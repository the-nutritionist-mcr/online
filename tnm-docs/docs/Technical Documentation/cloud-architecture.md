# Cloud Architecture

The application is hosted on AWS. It is a statically rendered NextJS application backed by an API built on API Gateway, AWS Lambda and AWS Dynamodb. See [AWS Resources](./aws-resources.md) for more details.

```mermaid
flowchart TD
    A[User] <--> B(NextJS)
    B <-->|Authenticates Via| J[Cognito]
    B <-->|Static Assets| C[Route 53]
    C <--> E[S3]
    B <-->|Data| F[Api Gateway]
    F <--> G[AWS Lambda]
    G <--> H[DynamoDB]
    I[Chargebee] -->|Webhook| F
```
