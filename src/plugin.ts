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
import {
  configApiRef,
  createPlugin,
  createApiFactory,
  discoveryApiRef,
  createComponentExtension,
} from '@backstage/core-plugin-api';
import { jiraApiRef, JiraAPI } from './api';

export const jiraPlugin = createPlugin({
  id: 'jira',
  apis: [
    createApiFactory({
      api: jiraApiRef,
      deps: { discoveryApi: discoveryApiRef, configApi: configApiRef },
      factory: ({ discoveryApi, configApi }) => {
        return new JiraAPI({
          discoveryApi,
          apiVersion: configApi.getOptionalNumber('jira.apiVersion'),
        });
      },
    }),
  ],
});

export const EntityJiraOverviewCard = jiraPlugin.provide(
  createComponentExtension({
    component: {
      lazy: () => import('./components/JiraCard').then((m) => m.JiraCard),
    },
  })
);
