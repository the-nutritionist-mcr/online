# Continuous Integration

Currently all pushes to the `main` branch trigger a [Github Actions workflow](https://github.com/the-nutritionist-mcr/online/actions/workflows/main.yml) that

- Runs all unit tests
- Checks Typescript types
- Runs the linter
- Deploys the application to a pre-production test environment and runs end to end tests against it

If all of those steps pass, the application will automatically be deployed

- To production as well as
- Another test environment

Note that there is NO manual deployment step - If everything passes, the change _will_ be deployed automatically. See [Environments](./environments) for details of the different application environments.

## Pipeline Times

The time it takes for a change to be available in production varies depending on whether you are making complex changes to infrastructure or whether you are installing any new npm packages. However, simple changes should take about 20 minutes to be visible in production.

## Commit Hooks

In order to minimise failed pipeline runs, the project uses 'husky' to configure pre-commit hooks that will automatically run the following checks against staged files

- `tsc-files`
- `eslint`
- `vitest related`
- `prettier`

## Deployment

The correct way to deploy the application is via the CI pipeline. If you wish to deploy the `cypress` environment locally you can do (as long as you have AWS credentials in your environment) using `npm run deploy:cypress`
