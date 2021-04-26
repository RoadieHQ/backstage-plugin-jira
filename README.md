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
    target: <JIRA_URL>
    headers:
      Authorization:
        $env: JIRA_TOKEN
      Accept: 'application/json'
      Content-Type: 'application/json'
      X-Atlassian-Token: 'no-check'
      User-Agent: "MY-UA-STRING"
```

3. Set img-src in Content Security Policy

```
// app-config.yaml
backend:
  # ...
  csp:
    img-src:
      # "'self'" and 'data' are from the backstage default but must be set since img-src is overriden
      - "'self'"
      - 'data:'
      # Allow your Jira instance for @roadiehq/backstage-plugin-jira
      - 'JIRA_URL'
```

4. Add plugin to the list of plugins:

```ts
// packages/app/src/plugins.ts
export { jiraPlugin } from '@roadiehq/backstage-plugin-jira';
```

5. Add plugin component to your Backstage instance:

```ts
// packages/app/src/components/catalog/EntityPage.tsx
import { EntityJiraOverviewCard, isJiraAvailable } from '@roadiehq/backstage-plugin-jira';

const overviewContent = (
  <Grid container spacing={3} alignItems="stretch">
    ...
    <EntitySwitch>
      <EntitySwitch.Case if={isJiraAvailable}>
        <Grid item md={6}>
          <EntityJiraOverviewCard />
        </Grid>
      </EntitySwitch.Case>
    </EntitySwitch>
  </Grid>
);
```

## How to use Jira plugin in Backstage

1. Add annotation to the yaml config file of a component:

```yaml
metadata:
  annotations:
    jira/project-key: <example-jira-project-key>
    jira/component: <example-component> # optional, you might skip value to fetch data for all components
```

2. Get and provide `JIRA_TOKEN` as env variable:
   1. Obtain you personal token from jira: https://id.atlassian.com/manage-profile/security/api-tokens
   2. Create a base64-encoded string by converting "<your-atlassian-account-mail>:<your-jira-token>", for example `jira-mail@example.com:hTBgqVcrcxRYpT5TCzTA9C0F` converts to `amlyYS1tYWlsQGV4YW1wbGUuY29tOmhUQmdxVmNyY3hSWXBUNVRDelRBOUMwRg==`
   3.  Save the environmental variable `JIRA_TOKEN` with `Basic ` prefix, eg: `JIRA_TOKEN='Basic amlyYS1tYWlsQGV4YW1wbGUuY29tOmhUQmdxVmNyY3hSWXBUNVRDelRBOUMwRg=='`

## Links

- [Backstage](https://backstage.io)
- [Further instructons](https://roadie.io/backstage/plugins/jira)
- Get hosted, managed Backstage for your company: https://roadie.io
