---
id: integration-with-chargebee
title: ChargeBee Integration
tags:
  - ChargeBee
  - Webhook
  - CRM
description: How the ChargeBee integration works
---

# ChargeBee Integration

## Webhook Interactions

The application is configured to respond to webhooks sent from the Chargebee API when certain events take place.

### Customer Created or Updated

The following sequence takes place on either create or update customer

```mermaid
sequenceDiagram
    actor TNMS as TNM Staff Member
    participant Chargebee
    participant AWSL as AWS Lambda
    participant Cognito

    TNMS->>Chargebee: Creates/Update Customer Record
    Chargebee->>AWSL: Sends webhook
    AWSL->>Cognito: Create customer if not already created
    AWSL-->>Chargebee: Requests all subscription details
    Chargebee->>AWSL: Returns subscription details
    AWSL->>Cognito: Stores subscription details
```
