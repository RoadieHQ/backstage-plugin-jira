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
import { IssuesCounter, IssueType } from '../types';

export const jiraApiRef = createApiRef<JiraAPI>({
  id: 'plugin.jira.service',
  description: 'Used by the Jira plugin to make requests',
});

const DEFAULT_PROXY_PATH = '/jira/api/';
const REST_API = 'rest/api/3/'

type Options = {
  discoveryApi: DiscoveryApi;
  /**
   * Path to use for requests via the proxy, defaults to /buildkite/api
   */
  proxyPath?: string;
};

export class JiraAPI {
  private readonly discoveryApi: DiscoveryApi;
  private readonly proxyPath: string;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;
    this.proxyPath = options.proxyPath ?? DEFAULT_PROXY_PATH;
  }

  private async getApiUrl() {
    const proxyUrl = await this.discoveryApi.getBaseUrl('proxy');
    return `${proxyUrl}${this.proxyPath}`;
  }

  private async getIssuesStatuses(projectKey: string): Promise<Array<IssueType>> {
    const apiUrl = await this.getApiUrl();
    const request = await axios(`${apiUrl}${REST_API}project/${projectKey}`);
    const statusesNames = request.data.issueTypes.map((status: IssueType) => ({
      name: status.name,
      iconUrl: status.iconUrl,
    }));
    return statusesNames;
  }

  private async getIssuesWithStatusCounter(apiUrl: string, projectKey: string, issueStatus: string, issueIcon: string) {
    const data = {
      jql: `project = ${projectKey} AND issuetype = ${issueStatus}`,
      maxResults: 1,
      fields: ['issuetype'],
    };
    const request = await axios.post(`${apiUrl}${REST_API}search`, data);
    const response = request.data;
    return {
      total: response.total,
      name: issueStatus,
      iconUrl: issueIcon,
    } as IssuesCounter;
  };

  async getIssuesCounters(projectKey: string) {
    const apiUrl = await this.getApiUrl();
    const issuesStatuses = await this.getIssuesStatuses(projectKey);
    const issuesWithStatus = await Promise.all(
      issuesStatuses.map(issue => {
        const issueStatus = issue.name;
        const issueIcon = issue.iconUrl;
        return this.getIssuesWithStatusCounter(apiUrl, projectKey, issueStatus, issueIcon)
      })
    ) as Array<IssuesCounter>;
    return issuesWithStatus.map(status => ({
      ...status,
    }));
  }

  async getProjectInfo(projectKey: string) {
    const apiUrl = await this.getApiUrl();
    const request = await axios(`${apiUrl}${REST_API}project/${projectKey}`);
    const project = request.data;
    return {
      name: project.name,
      iconUrl: project.avatarUrls['16x16'],
      type: project.projectTypeKey,
    };
  }

  async getActivityStream() {
    const apiUrl = await this.getApiUrl();
    const request = await axios(`${apiUrl}/activity?maxResults=10&os_authType=basic`)
    .then(res => Promise.resolve(res))
    .catch(err => Promise.reject({
      message: err?.response?.data?.errorMessages.length && err.response.data.errorMessages[0] || err.request
    })); 
    return request.data;  
  }

  async getStatuses(projectKey: string) {
    const apiUrl = await this.getApiUrl();
    await axios(`${apiUrl}${REST_API}project/${projectKey}/statuses`)
    .then(res => Promise.resolve(res))
    .catch(err => Promise.reject({
      message: err?.response?.data?.errorMessages.length && err.response.data.errorMessages[0] || err.request
    })); 
  }
}
