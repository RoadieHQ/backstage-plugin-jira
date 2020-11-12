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

export type EntityProps = {
  entity: Entity;
}

export type IssueType = {
  name: string;
  iconUrl: string;
}
  
export type Issue = {
  key: string;
  total: number;
  fields: {
    issuetype: IssueType
  }
}

export type IssuesCounter = {
  total: number,
  name: string,
  iconUrl: string;
}

type PropertyValue = {
  _text: string;
}


export type ActivityStreamElement = {
  id: string;
  time: {
    elapsed: string;
    value: Date;
  },
  title: string;
  icon: {
    url: string;
    title: string;
  }
  summary?: string;
  content?: string;
}

export type ActivityStreamEntry = {
  updated: PropertyValue;
  title: PropertyValue;
  link: Array<{
    _attributes: {
      href: string;
      title: string;
    }
  }>;
}

export type ProjectType = {
  name: string;
  avatarsUrls: {
    [key: string]: string;
  }
  projectTypeKey: string;
};