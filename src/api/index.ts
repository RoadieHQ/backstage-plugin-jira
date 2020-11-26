/*
 * Copyright 2020 RoadieHQ
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createApiRef, DiscoveryApi } from '@backstage/core';
import axios from 'axios';
import { IssuesCounter, IssueType, Project, Status } from '../types';

export const jiraApiRef = createApiRef<JiraAPI>({
  id: 'plugin.jira.service',
  description: 'Used by the Jira plugin to make requests',
});

const DEFAULT_PROXY_PATH = '/jira/api/';
const DEFAULT_REST_API_VERSION = 3;

type Options = {
  discoveryApi: DiscoveryApi;
  /**
   * Path to use for requests via the proxy, defaults to /jira/api
   */
  proxyPath?: string;
  apiVersion?: number;
};

export class JiraAPI {
  private readonly discoveryApi: DiscoveryApi;
  private readonly proxyPath: string;
  private readonly apiVersion: number;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;
    this.proxyPath = options.proxyPath ?? DEFAULT_PROXY_PATH;
    this.apiVersion = options.apiVersion ?? DEFAULT_REST_API_VERSION;
  }

  private generateProjectUrl = (url: string) => new URL(url).origin;

  private async getUrls() {
    const proxyUrl = await this.discoveryApi.getBaseUrl('proxy');
    return {
      apiUrl: `${proxyUrl}${this.proxyPath}/rest/api/${this.apiVersion}/`,
      baseUrl: `${proxyUrl}${this.proxyPath}`,
    }
  };

  private convertToString = (arrayElement: Array<string>): string =>
    arrayElement
    .filter(Boolean)
    .map(i => `'${i}'`).join(',');

  private async getIssuesCountByType(
    apiUrl: string,
    projectKey: string,
    component: string,
    statusesNames: Array<string>,
    issueType: string,
    issueIcon: string
  ) {
    const statusesString = this.convertToString(statusesNames);
    const jql = `
      project = "${projectKey}"
      AND issuetype = "${issueType}"
      ${statusesString ? `AND status in (${statusesString})` : ''}
      ${component ? `AND component = ${component}` : ''}
    `;
    const data = {
      jql,
      maxResults: 0,
    };
    const request = await axios.post(`${apiUrl}search`, data);
    const response = request.data;
    return {
      total: response.total,
      name: issueType,
      iconUrl: issueIcon,
    } as IssuesCounter;
  };

  async getProjectDetails(projectKey: string, component: string, statusesNames: Array<string>) {
    const { apiUrl } = await this.getUrls();
    const request = await axios.get(`${apiUrl}project/${projectKey}`);
    const project = request.data as Project;

    // Generate counters for each issue type
    const issuesTypes = project.issueTypes.map((status: IssueType) => ({
      name: status.name,
      iconUrl: status.iconUrl,
    }));
  
    const issuesCounterByType = await Promise.all(
      issuesTypes.map(issue => {
        const issueType = issue.name;
        const issueIcon = issue.iconUrl;
        return this.getIssuesCountByType(apiUrl, projectKey, component, statusesNames, issueType, issueIcon)
      })
    );
  
    return {
      project: {
        name: project.name,
        iconUrl: project.avatarUrls['16x16'],
        type: project.projectTypeKey,
        url: this.generateProjectUrl(project.self),
      },
      issues: issuesCounterByType && issuesCounterByType.length ? issuesCounterByType.map(status => ({
        ...status,
      })) : []
    };
  }

  async getActivityStream(size: number) {
    const { baseUrl } = await this.getUrls();
    const request = await axios.get(`${baseUrl}activity?maxResults=${size}&os_authType=basic`);
    const activityStream = request.data;
    return activityStream; 
  }

  async getStatuses() {
    const { apiUrl } = await this.getUrls();
    const request = await axios.get(`${apiUrl}status`);
    const statuses = request.data as Array<Status>;
    const formattedStatuses = statuses.length ? [...new Set(statuses.map((status) => status.name))] : [];
    return formattedStatuses;
  }
}
