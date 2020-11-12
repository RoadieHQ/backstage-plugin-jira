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
import React, { FC, useEffect } from 'react';
import { 
  Box,
  Checkbox,
  Divider,
  FormControl,
  Grid,
  Input,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { InfoCard, Progress } from '@backstage/core';
import { useIssuesCounters, useProjects } from '../useRequests';
import { useProjectEntity } from '../useProjectEntity';
import { EntityProps } from '../../types';
import { Status } from './components/Status';
import { ActivityStream } from './components/ActivityStream';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    infoCard: {
      marginBottom: theme.spacing(3),
      '& + .MuiAlert-root': {
        marginTop: theme.spacing(3),
      },
    },  
    root: {
      flexGrow: 1,
      fontSize: '0.75rem',
    },
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
      width: 250,
    },
  },
};

const names = [
  'ExampleJiraProject',
  'ExampleProject #2',
];


export const JiraCard: FC<EntityProps> = ({ entity }) => {
  const classes = useStyles();
  const projectKey = useProjectEntity(entity);
  const { issues, issuesLoading, issuesError } = useIssuesCounters(projectKey);
  const { projects, projectsLoading, projectsError } = useProjects();
  const [projectName, setprojectName] = React.useState<string[]>([]);

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setprojectName(event.target.value as string[]);
  };

  useEffect(() => {
    console.log(projectName);
  },[projectName]);

  console.log(projects && projects.values);

  return (
    <InfoCard
      title="Jira"
      className={classes.infoCard}
      deepLink={{
        link: '/catalog/default/component/ExamplePipeline/jira',
        title: 'Go to project',
      }}
    >
      { issuesLoading ? <Progress /> : null }
      { issuesError ? <Alert severity="error" className={classes.infoCard}>{issuesError.message}</Alert> : null }
      { issues ? (
        <div className={classes.root}>

          <Grid container spacing={3}>
            { issues.map(issueType => (
              <Grid item xs key={issueType.name}>
                <Box width={ 100 } display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                  <Status name={issueType.name} iconUrl={issueType.iconUrl} />
                  <Typography variant="h4">{issueType.total}</Typography>
                </Box>
              </Grid>
            )) }
          </Grid>

          <Box pt={2}>
            <Divider />
          </Box>
            { projects?.values.length >= 2 && (
              <Box display="flex" justifyContent="flex-end" pb={2}>
              <FormControl className={classes.formControl}>
                <InputLabel id="demo-mutiple-checkbox-label">Select Project</InputLabel>
                <Select
                  labelId="select-projects-label"
                  id="select-projects"
                  multiple
                  value={projectName}
                  onChange={handleChange}
                  input={<Input />}
                  renderValue={(selected) => (selected as string[]).join(', ')}
                  MenuProps={MenuProps}
                >
                  {names.map((name) => (
                    <MenuItem key={name} value={name}>
                      <Checkbox checked={projectName.indexOf(name) > -1} />
                      <ListItemText primary={name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box> 
            )}

          <ActivityStream />
        </div>
      ) : null }
    </InfoCard>
  )
};
