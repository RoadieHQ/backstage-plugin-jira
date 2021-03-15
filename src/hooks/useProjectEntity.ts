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
import { Entity } from '@backstage/catalog-model';
import { CustomQuery } from '../types';

export const JIRA_PROJECT_KEY_ANNOTATION = 'jira/project-key';
const JIRA_COMPONENT_ANNOTATION = 'jira/component';
const JIRA_QUERIES_ANNOTATION = 'jira/queries';

export const useProjectEntity = (entity: Entity) => {
  const annotations = entity.metadata?.annotations;
  const queries = annotations
    ? Object.entries(annotations)
        .map(([annotation, query]) => {
          if (annotation.startsWith(JIRA_QUERIES_ANNOTATION)) {
            return {
              name: annotation.replace(`${JIRA_QUERIES_ANNOTATION}-`, ''),
              query,
            };
          }
          return null;
        })
        .filter((it): it is CustomQuery => it !== null)
    : [];

  return {
    projectKey: entity.metadata?.annotations?.[
      JIRA_PROJECT_KEY_ANNOTATION
    ] as string,
    component: entity.metadata?.annotations?.[
      JIRA_COMPONENT_ANNOTATION
    ] as string,
    queries,
  };
};
