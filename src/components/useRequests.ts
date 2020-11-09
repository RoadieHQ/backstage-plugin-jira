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
import { jiraApiRef } from '../api';

export const useIssues = () => {
  const api = useApi(jiraApiRef);

  const getIssues = useCallback(async () => {
    try {
      const response = await api.getIssues();
      return response.data;
    } catch (err) {
      return Promise.reject({message: err?.response?.data?.errorMessages[0] || err.request});
    }
  }, [api]);
  
  const {loading, value, error} = useAsync(() => getIssues(), []);

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
