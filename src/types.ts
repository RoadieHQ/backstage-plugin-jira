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
import { Dispatch, SetStateAction } from 'react';

type PropertyValue = {
  _text: string;
};

export type EntityProps = {
  entity: Entity;
};

export type SelectorsProps = {
  projectKey: string;
  statusesNames: Array<string>;
  setStatusesNames: Dispatch<SetStateAction<Array<string>>>;
  fetchProjectInfo: () => Promise<any>;
};

export type IssueType = {
  name: string;
  iconUrl: string;
};

export type IssuesCounter = {
  total: number;
  name: string;
  iconUrl: string;
};

export type ActivityProperties =
  | 'updated'
  | 'title'
  | 'id'
  | 'summary'
  | 'content';

export type ActivityStreamElement = {
  id: string;
  time: {
    elapsed: string;
    value: string;
  };
  title: string;
  icon?: {
    url: string;
    title: string;
  };
  summary?: string;
  content?: string;
};

export type ActivityStreamKeys =
  | 'updated'
  | 'title'
  | 'summary'
  | 'content'
  | 'id';

export type ActivityStreamEntry = {
  updated: PropertyValue;
  title: PropertyValue;
  summary: PropertyValue;
  content: PropertyValue;
  id: PropertyValue;
  link?: Array<{
    _attributes: {
      href: string;
      title: string;
      rel: string;
    };
  }>;
};

export type Project = {
  name: string;
  avatarUrls: {
    [key: string]: string;
  };
  issueTypes: Array<{
    name: string;
    iconUrl: string;
  }>;
  self: string;
  url: string;
  projectTypeKey: string;
};

export type ProjectDetailsProps = {
  name: string;
  type: string;
  iconUrl: string;
};

export type Status = {
  statuses: Array<{ name: string }>;
};
