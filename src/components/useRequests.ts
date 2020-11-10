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
import XMLParser from 'react-xml-parser';
import moment from 'moment';
import { jiraApiRef } from '../api';
import { ActivityStreamEntry, ActivityStreamElement } from '../types';

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
    loading,
    value,
    error,
  };
}

const getElementByTagName = (element: ActivityStreamElement, elementName: string) => element.getElementsByTagName(elementName)[0].value;
const getElapsedTime = (start: string) => moment(start).fromNow();
const decodeHtml = (html) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

export const useActivityStream = () => {
  const api = useApi(jiraApiRef);

  const getIssuesCounters = useCallback(async () => {
    try {
      const response = await api.getActivityStream();
      const parsedData = new XMLParser().parseFromString(response);
      const mappedData = parsedData.getElementsByTagName('entry').map(entry => {
        const author = entry.getElementsByTagName('author')[0];
        return {
          author: {
            name: getElementByTagName(author, 'name'),
            url: getElementByTagName(author, 'uri'),
          },
          elapsedTime: getElapsedTime(getElementByTagName(entry, 'updated')),
          //activity: getElementByTagName(entry, 'category'),
          title: decodeHtml(getElementByTagName(entry, 'title')),
        }
      }) as Array<ActivityStreamEntry>;
      return mappedData;
    } catch (err) {
      console.error(err);
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
export const useDashboards = () => {
  const api = useApi(jiraApiRef);

  const getDashboards = useCallback(async () => {
    await api.getDashboards();
  }, [api]);
  
  const {loading, value, error} = useAsync(() => getDashboards(), []);

  return {
    loading,
    value,
    error,
  };
}
