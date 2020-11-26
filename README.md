# Jira Plugin for Backstage

![a Jira plugin for Backstage](https://raw.githubusercontent.com/RoadieHQ/backstage-plugin-jira/main/docs/jira-plugin.gif)

## Features

- Show project details and tasks
- Activity Stream

## How to add Jira project dependency to Backstage app

1. If you have standalone app (you didn't clone this repo), then do

```bash
yarn add @roadiehq/backstage-plugin-jira
```

2. Add proxy config:

```yaml
// app-config.yaml
proxy:
  '/jira/api':
    target: [JIRA_URL]
    headers:
      Authorization:
        $env: JIRA_TOKEN
      Accept: 'application/json'
      Content-Type: 'application/json'
      X-Atlassian-Token: 'no-check'
      User-Agent: "MY-UA-STRING"
// For Jira Server / Data Center users you also need to set up API version
jira:
  apiVersion: 2
```

3. Add plugin to the list of plugins:

```ts
// packages/app/src/plugins.ts
export { plugin as Jira } from '@roadiehq/backstage-plugin-jira';
```

4. Add plugin API to your Backstage instance:

```ts
// packages/app/src/components/catalog/EntityPage.tsx
import {
  JiraCard
  isPluginApplicableToEntity as isJiraAvailable,
} from '@roadiehq/backstage-plugin-jira';

const OverviewContent = ({ entity }: { entity: Entity }) => (

  <Grid container spacing={3} alignItems="stretch">
    ...
    {isJiraAvailable(entity) && (
      <Grid item md={6}>
        <JiraCard entity={entity} />
      </Grid>
    )}
  </Grid>
);
```

## How to use Jira plugin in Backstage

1. Add annotation to the yaml config file of a component:

```yaml
metadata:
  annotations:
    jira/project-key: [example-jira-project-key]
    jira/component: [example-component] // optional, you might skip value to fetch data for all components
```

2. Get and provide `JIRA_TOKEN` as env variable in following format:
   "Basic base64(jira-mail@example.com:JIRA_TOKEN)" for example:
   `Basic: ZXhhbXBsZV9qaXJhQGV4YW1wbGUuY29tOjU1Q3NUSEoxWW1oTVdJSFptdGJXNUUxOA==`

## Links

- [Backstage](https://backstage.io)
- [Further instructons](https://roadie.io/backstage/plugins/buildkite)
- Get hosted, managed Backstage for your company: https://roadie.io
