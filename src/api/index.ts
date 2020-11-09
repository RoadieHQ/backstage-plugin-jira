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

export const jiraApiRef = createApiRef<JiraAPI>({
  id: 'plugin.jira.service',
  description: 'Used by the Jira plugin to make requests',
});

const DEFAULT_PROXY_PATH = '/jira/api/';

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

  async getDashboards() {
    const apiUrl = await this.getApiUrl();
    const data = {
      queries: ['project = EX ORDER BY Rank ASC'],
    };
    const request = await fetch(`${apiUrl}jql/parse`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    .then(res => Promise.resolve(res))
    .catch(err => Promise.reject({message: err?.response?.data?.errorMessages[0] || err.request})); 
    return request.json();  
  }

  async getIssues() {
    const apiUrl = await this.getApiUrl();
    const request = await axios(`${apiUrl}search?jql=project=Ex&issuetype=Bug&maxResults=0`);
    return request;
  }

}
