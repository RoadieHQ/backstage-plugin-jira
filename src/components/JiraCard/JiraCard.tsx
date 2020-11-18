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
import React, { useState, FC } from 'react';
import { 
  Avatar,
  Box,
  Grid,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { InfoCard, Progress } from '@backstage/core';
import { useProjectInfo, useProjectEntity } from '../../hooks';
import { EntityProps, ProjectDetailsProps } from '../../types';
import { Status } from './components/Status';
import { ActivityStream } from './components/ActivityStream';
import { Selectors } from './components/Selectors';

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
  }),
);

const CardProjectDetails = ({ project }: { project: ProjectDetailsProps }) => (
  <Box display="flex" alignItems="center">
    <Avatar alt="" src={project.iconUrl} />
    <Box component="span" ml={1}> {project.name} | {project.type}</Box>
  </Box>
);

export const JiraCard: FC<EntityProps> = ({ entity }) => {
  const classes = useStyles();
  const { projectKey, component } = useProjectEntity(entity);
  const [statusesNames, setStatusesNames] = useState<Array<string>>([]);
  const { project, issues, projectLoading, projectError, fetchProjectInfo } = useProjectInfo(projectKey, component, statusesNames);

  return (
    <InfoCard
      title="Jira"
      subheader= { project && <CardProjectDetails project={ project }/> }
      className={classes.infoCard}
      deepLink={{
        link: `${project?.url}/browse/${projectKey}`,
        title: 'Go to project',
        onClick: (e) => {
          e.preventDefault();
          window.open(`${project?.url}/browse/${projectKey}`);
        }
      }}
    >
      { projectLoading && !(project && issues) ? <Progress /> : null }
      { projectError ? <Alert severity="error" className={classes.infoCard}>{projectError.message}</Alert> : null }
      { project && issues ? (
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
          <Selectors
            statusesNames={statusesNames}
            setStatusesNames={setStatusesNames}
            fetchProjectInfo={fetchProjectInfo}
          />
          <ActivityStream />
        </div>
      ) : null }
    </InfoCard>
  );
};
