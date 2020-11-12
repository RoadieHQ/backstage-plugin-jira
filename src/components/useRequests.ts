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
import { useCallback } from 'react';
import { useApi } from '@backstage/core';
import { useAsync } from 'react-use';
import convert from 'xml-js';
import moment from 'moment';
import { jiraApiRef } from '../api';
import { ActivityStreamEntry, ActivityStreamElement } from '../types';

const getPropertyValue = (entry: {}, property: string): string|null => entry[property]?._text || null;
const getElapsedTime = (start: string) => moment(start).fromNow();
const decodeHtml = (html: string) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

export const useIssuesCounters = (projectKey: string) => {
  const api = useApi(jiraApiRef);

  const getIssuesCounters = useCallback(async () => {
    try {
      const response = await api.getIssuesCounters(projectKey);
      return response;
    } catch (err) {
      return Promise.reject({message: err?.response?.data?.errorMessages[0] || err.request});
    }
  }, [api, projectKey]);
  
  const {loading, value, error} = useAsync(() => getIssuesCounters(), []);

  return {
    issuesLoading: loading,
    issues: value,
    issuesError: error,
  };
}

export const useActivityStream = () => {
  const api = useApi(jiraApiRef);

  const getIssuesCounters = useCallback(async () => {
    try {
      const response = await api.getActivityStream();
      const parsedData = JSON.parse(convert.xml2json(response, {compact: true, spaces: 2}));
      const mappedData = parsedData.feed.entry.map((entry: ActivityStreamEntry) => {
        const time = getPropertyValue(entry, 'updated');
        const icon = entry.link[1]._attributes;

        return {
          id: getPropertyValue(entry, 'id'),
          time: {
            elapsed: getElapsedTime(time),
            value: new Date(time).toLocaleTimeString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
          },
          title: decodeHtml(getPropertyValue(entry, 'title')),
          icon: {
            url: icon.href,
            title: icon.title,
          },
          summary: decodeHtml(getPropertyValue(entry, 'summary')),
          content: decodeHtml(getPropertyValue(entry, 'content')),
        }
      }) as Array<ActivityStreamElement>;
      return mappedData;
    } catch (err) {
      return Promise.reject({message: err?.response?.data?.errorMessages[0] || err.request});
    }
  }, [api]);
  
  const {loading, value, error} = useAsync(() => getIssuesCounters(), []);

  return {
    loading,
    value,
    error,
  };
}
export const useProjects = () => {
  const api = useApi(jiraApiRef);

  const getProjects = useCallback(async () => {
    await api.getProjects();
  }, [api]);
  
  const {loading, value, error} = useAsync(() => getProjects(), []);

  return {
    projectsLoading: loading,
    projects: value,
    projectsError: error,
  };
}
