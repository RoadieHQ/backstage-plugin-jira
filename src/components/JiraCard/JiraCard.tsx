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
import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Grid,
  Theme,
  Typography,
  createStyles,
  makeStyles,
  IconButton,
  Menu,
  MenuItem,
  Checkbox,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { InfoCard, Progress } from '@backstage/core';
import { useProjectInfo, useProjectEntity } from '../../hooks';
import { EntityProps, ProjectDetailsProps } from '../../types';
import { Status } from './components/Status';
import { ActivityStream } from './components/ActivityStream';
import { Selectors } from './components/Selectors';
import { useEmptyIssueTypeFilter } from '../../hooks/useEmptyIssueTypeFilter';
import MoreVertIcon from '@material-ui/icons/MoreVert';

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
    actions: {
      // It's a workaroung for strange styles set in @backstage/core InfoCard component
      margin: theme.spacing(-8, -8, 0, 0),
    },
  }),
);

const CardProjectDetails = ({ project }: { project: ProjectDetailsProps }) => (
  <Box display="flex" alignItems="center">
    <Avatar alt="" src={project.iconUrl} />
    <Box component="span" ml={1}>
      {' '}
      {project.name} | {project.type}
    </Box>
  </Box>
);

export const JiraCard = ({ entity }: EntityProps) => {
  const classes = useStyles();
  const { projectKey, component } = useProjectEntity(entity);
  const [statusesNames, setStatusesNames] = useState<Array<string>>([]);
  const {
    project,
    issues,
    projectLoading,
    projectError,
    fetchProjectInfo,
  } = useProjectInfo(projectKey, component, statusesNames);
  const {
    issueTypes: displayIssues,
    type,
    changeType,
  } = useEmptyIssueTypeFilter(issues);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <InfoCard
      title="Jira"
      actionsTopRight={
        <>
          <IconButton
            className={classes.actions}
            aria-label="more"
            aria-controls="long-menu"
            aria-haspopup="true"
            onClick={handleClick}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={changeType}>
              <Checkbox checked={type === 'all'} />
              <>Show non-empty issue types</>
            </MenuItem>
          </Menu>
        </>
      }
      subheader={project && <CardProjectDetails project={project} />}
      className={classes.infoCard}
      deepLink={{
        link: `${project?.url}/browse/${projectKey}`,
        title: 'Go to project',
        onClick: e => {
          e.preventDefault();
          window.open(`${project?.url}/browse/${projectKey}`);
        },
      }}
    >
      {projectLoading && !(project && issues) ? <Progress /> : null}
      {projectError ? (
        <Alert severity="error" className={classes.infoCard}>
          {projectError.message}
        </Alert>
      ) : null}
      {project && issues ? (
        <div className={classes.root}>
          <Grid container spacing={3}>
            {displayIssues?.map(issueType => (
              <Grid item xs key={issueType.name}>
                <Box
                  width={100}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Status name={issueType.name} iconUrl={issueType.iconUrl} />
                  <Typography variant="h4">{issueType.total}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          <Selectors
            projectKey={projectKey}
            statusesNames={statusesNames}
            setStatusesNames={setStatusesNames}
            fetchProjectInfo={fetchProjectInfo}
          />
          <ActivityStream projectKey={projectKey} />
        </div>
      ) : null}
    </InfoCard>
  );
};
