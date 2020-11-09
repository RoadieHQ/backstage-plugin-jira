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
import { makeStyles, createStyles, Theme } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { InfoCard, Progress } from '@backstage/core';
import { useIssues } from '../useRequests';
import { EntityProps } from '../types';

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
  const { value, loading, error } = useIssues();
;
  return (
    <InfoCard title="Jira" className={classes.infoCard}>
      { loading ? <Progress /> : null }
      { error ? <Alert severity="error" className={classes.infoCard}>{error.message}</Alert> : null }
      { value ? (
        <div className={classes.root}>
          { value.total }
        </div>
      ) : null }
    </InfoCard>
  )
};
