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
import React, { FC } from 'react';
import { 
  Box,
  Checkbox,
  Divider,
  FormControl,
  Input,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Theme,
  createStyles,
  makeStyles,
} from '@material-ui/core';
import { useComponents, useStatuses } from '../../useRequests';
import { SelectorsProps } from '../../../types';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
      maxWidth: 300,
    },
  }),
);

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 350,
    },
  },
};

export const Selectors: FC<SelectorsProps> = ({
  projectKey,
  componentsNames,
  statusesNames,
  setStatusesNames,
  setComponentsNames,
  fetchProjectInfo,
}) => {
  const classes = useStyles();
  const { components, componentsLoading, componentsError } = useComponents(projectKey);
  const { statuses, statusesLoading, statusesError } = useStatuses();
  const handleComponentsChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setComponentsNames(event.target.value as string[]);
  };

  const handleStatusesChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setStatusesNames(event.target.value as string[]);
  };

  return !componentsLoading && !statusesLoading && !componentsError && !statusesError ? (
    <Box py={2}>
      <Divider />
      <Box display="flex" justifyContent="flex-end" py={2}>
        {statuses.length >= 2 ? (
          <FormControl className={classes.formControl}>
            <InputLabel id="select-multiple-projects-statuses">Statuses</InputLabel>
            <Select
              labelId="select-statuses-label"
              id="select-statuses"
              multiple
              value={statusesNames}
              onChange={handleStatusesChange}
              input={<Input />}
              renderValue={(selected: Array<string>) => selected.filter(Boolean).join(', ')}
              MenuProps={MenuProps}
              onClose={fetchProjectInfo}
            >
              {statuses.map((status) => (
                <MenuItem key={status} value={status}>
                  <Checkbox checked={statusesNames.indexOf(status) > -1} />
                  <ListItemText primary={status} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : null }

        {components.length >= 2 ? (
          <FormControl className={classes.formControl}>
            <InputLabel id="select-multiple-projects-components">Components</InputLabel>
            <Select
              labelId="select-components-label"
              id="select-components"
              multiple
              value={componentsNames}
              onChange={handleComponentsChange}
              input={<Input />}
              renderValue={(selected: Array<string>) => selected.filter(Boolean).join(', ')}
              MenuProps={MenuProps}
              onClose={fetchProjectInfo}
            >
              {components.map((component) => (
                <MenuItem key={component} value={component}>
                  <Checkbox checked={componentsNames.indexOf(component) > -1} />
                  <ListItemText primary={component} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : null }
      </Box>
    </Box>
  ) : null;
}