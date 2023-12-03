# Continuous Integration

Currently all pushes to the `main` branch trigger a Github Actions workflow that

- Runs all unit tests
- Checks Typescript types
- Runs the linter
- Deploys the application to `https://cypress.app.thenutritionistmcr.com` and runs end to end tests against it

If all of those steps pass, the application will automatically be deployed

- To production (`htttps://portal.thenutritionistmcr.com`) as well as
- The test environment (`https://test.app.thenutritionistmcr.com`)

Note that there is NO manual deployment step - If everyting passes, the change _will_ be deployed automatically

## Deployment

The correct way to deploy the application is via the CI pipeline. If you wish to deploy the `cypress` environment locally you can do (as long as you have AWS credentials in your environment) using `npm run deploy:cypress`
