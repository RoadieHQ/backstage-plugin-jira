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
import { Grid, Box, Typography, makeStyles, createStyles, Theme, Divider } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { InfoCard, Progress } from '@backstage/core';
import { useIssuesCounters } from '../useRequests';
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
    },
  }),
);

export const JiraCard: FC<EntityProps> = ({ entity }) => {
  const classes = useStyles();
  const projectKey = useProjectEntity(entity);
  const { value, loading, error } = useIssuesCounters(projectKey);

  return (
    <InfoCard
      title="Jira"
      className={classes.infoCard}
      deepLink={{
        link: '/jira',
        title: 'Go to project',
      }}
    >
      { loading ? <Progress /> : null }
      { error ? <Alert severity="error" className={classes.infoCard}>{error.message}</Alert> : null }
      { value ? (
        <div className={classes.root}>
          <Grid container spacing={3}>
            { value.map(issueType => (
              <Grid item xs key={issueType.name}>
                <Box width={ 100 } display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                  <Status name={issueType.name} iconUrl={issueType.iconUrl} />
                  <Typography variant="h4">{issueType.total}</Typography>
                </Box>
              </Grid>
            )) }
          </Grid>
          <Box py={2}>
            <Divider />
          </Box>
          <ActivityStream />
        </div>
      ) : null }
    </InfoCard>
  )
};
