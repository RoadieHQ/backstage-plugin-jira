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
import { useEffect, useCallback } from 'react';
import { useApi } from '@backstage/core';
import { useAsync, useAsyncFn} from 'react-use';
import convert from 'xml-js';
import moment from 'moment';
import { jiraApiRef } from '../api';
import { ActivityStreamEntry, ActivityStreamElement } from '../types';
import { AxiosError } from 'axios';

const getPropertyValue = (entry: {}, property: string): string|null => entry[property]?._text || null;
const getElapsedTime = (start: string) => moment(start).fromNow();
const decodeHtml = (html: string) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

const handleError = (error: AxiosError) => Promise.reject({
  message: error?.response?.data?.errorMessages.length && error.response.data.errorMessages[0] || error.request
});

export const useActivityStream = (size) => {
  const api = useApi(jiraApiRef);

  const getActivityStream = useCallback(async () => {
    try {
      const response = await api.getActivityStream(size);
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
      return handleError(err);
    }
  }, [api, size]);
  
  const [state, fetchActivityStream] = useAsyncFn(() => getActivityStream(), [size]);

  useEffect(() => {
    fetchActivityStream();
  }, [size, fetchActivityStream]);

  return {
    activitesLoading: state.loading,
    activities: state.value,
    activitiesError: state.error,
  };
};

export const useProjectInfo = (
  projectKey: string,
  componentsNames: Array<string>,
  statusesNames: Array<string>
) => {
  const api = useApi(jiraApiRef);

  const getProjectDetails = useCallback(async () => {
    try {
      setTimeout(() => (document.activeElement as HTMLElement).blur());
      return await api.getProjectDetails(projectKey, componentsNames, statusesNames);
    } catch (err) {
      return handleError(err);
    }
  }, [api, projectKey, componentsNames, statusesNames]);
  
  const [state, fetchProjectInfo] = useAsyncFn(() => getProjectDetails(), [componentsNames, statusesNames]);

  useEffect(() => {
    fetchProjectInfo();
  }, [componentsNames, statusesNames, fetchProjectInfo]);

  return {
    projectLoading: state.loading,
    project: state?.value?.project,
    issues: state?.value?.issues,
    projectError: state.error,
    fetchProjectInfo,
  };
};

export const useComponents = (projectKey: string) => {
  const api = useApi(jiraApiRef);

  const getComponenets = useCallback(async () => {
    try {
      return await api.getComponenets(projectKey);
    } catch (err) {
      return handleError(err);
    }
  }, [api, projectKey]);
  
  const {loading, value, error} = useAsync(() => getComponenets(), []);
  return {
    componentsLoading: loading,
    components: value,
    componentsError: error,
  };
};

export const useStatuses = () => {
  const api = useApi(jiraApiRef);

  const getStatuses = useCallback(async () => {
    try {
      return await api.getStatuses();
    } catch (err) {
      return handleError(err);
    }
  }, [api]);
  
  const {loading, value, error} = useAsync(() => getStatuses(), []);
  return {
    statusesLoading: loading,
    statuses: value,
    statusesError: error,
  };
};
