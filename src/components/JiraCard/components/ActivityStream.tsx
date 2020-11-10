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
import React from 'react';
import { Box, Paper, Typography, makeStyles, createStyles, Theme, } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { Progress } from '@backstage/core';
import parse from 'html-react-parser';
import { useActivityStream } from '../../useRequests';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      padding: theme.spacing(1),
      backgroundColor: '#f6f8fa',
      color: 'rgba(0, 0, 0, 0.87)',
      marginTop: theme.spacing(1),
      '& a': {
        color: theme.palette.primary.main,
      },
    },  
  }),
);

export const ActivityStream = () => {
  const classes = useStyles();
  const { value, loading, error } = useActivityStream();

  if(error) return <Alert severity="error">Failed to load activity stream</Alert>

  return (
    <>
      <Typography variant="subtitle1">Activity stream</Typography>
      <Paper className={classes.paper}>
      { loading ? <Progress /> : null }
      { value ? (
        value.map(entry => (
          <Box>
            {parse(entry.title)}
            <Typography variant="subtitle2">{entry.elapsedTime}</Typography>
          </Box>
        ))
      ) : null }
      </Paper>
    </>
  );
 }