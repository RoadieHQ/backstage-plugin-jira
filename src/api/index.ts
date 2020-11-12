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
import { ProjectStatuses, IssuesCounter, IssueType } from '../types';

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

  private async getIssuesTypes(projectKey: string): Promise<Array<string>> {
    const apiUrl = await this.getApiUrl();
    const request = await axios(`${apiUrl}${REST_API}project/${projectKey}/statuses`);
    const statusesNames = request.data.map((status: ProjectStatuses) => status.name);
    return statusesNames;
  }

  private async getIssueIcon (issueType: string): Promise<string> {
    const apiUrl = await this.getApiUrl();
    const request = await axios(`${apiUrl}${REST_API}issuetype`);
    const response = request.data;
    return response.filter((issue: IssueType) => issue.name === issueType)[0].iconUrl;
  }

  private async getIssuesWithStatusCounter(apiUrl: string, projectKey: string, issueType: string) {
    const data = {
      jql: `project = ${projectKey} AND issuetype = ${issueType}`,
      maxResults: 1,
      fields: ['issuetype'],
    };
    const request = await axios.post(`${apiUrl}${REST_API}search`, data);
    const response = request.data;
    return {
      total: response.total,
      name: issueType,
      iconUrl: response.issues.length
        ? response.issues[0].fields.issuetype.iconUrl
        : await this.getIssueIcon(issueType), // Request icon url fallback when response is null
    } as IssuesCounter;
  };

  async getIssuesCounters(projectKey: string) {
    const apiUrl = await this.getApiUrl();
    const issuesTypes = await this.getIssuesTypes(projectKey);
    const issuesWithStatus = await Promise.all(
      issuesTypes.map(issueType => this.getIssuesWithStatusCounter(apiUrl, projectKey, issueType))
    ) as Array<IssuesCounter>;
    return issuesWithStatus.map(status => ({
      ...status,
    }));
  }

  async getActivityStream() {
    const apiUrl = await this.getApiUrl();
    const request = await axios(`${apiUrl}/activity?maxResults=10&os_authType=basic`)
    .then(res => Promise.resolve(res))
    .catch(err => Promise.reject({message: err?.response?.data?.errorMessages[0] || err.request})); 
    return request.data;  
  }

  async getProjects() {
    const apiUrl = await this.getApiUrl();
    const data = {
      queries: ['project = EX ORDER BY Rank ASC'],
    };
    const request = await fetch(`${apiUrl}${REST_API}jql/parse`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    .then(res => Promise.resolve(res))
    .catch(err => Promise.reject({message: err?.response?.data?.errorMessages[0] || err.request})); 
    return request.json();  
  }
}
