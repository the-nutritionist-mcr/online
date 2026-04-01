# Billing

TNM configures Chargebee in the following manner 
- [calendar billing](https://www.chargebee.com/docs/billing/2.0/subscriptions/calendar-billing) is enabled
- Billing date is configured to be the first of every month

In practice what this means is

- On the first of each month, a new invoice is generated on the Chargebee system. That invoice represents payment for all of the food the customer will receive in *that* month. So for example, if an invoice is generated and paid for on the 1st of April, the customer has paid for food on all the cook days between the 1st of April and the last day of April inclusive
- When an invoice is generated, Chargebee will automatically request payment for that invoice. If that payment fails, Chargebee will continue to request payment through its [dunning](https://www.chargebee.com/docs/payments/2.0/dunning/dunning-v2) process.



# Subscription Pausing (Default behaviour)

_The following is a description of the behaviour provided by Chargebee independent of our integration_

- Chargebee provides the facility to 'pause' a customers subscription.
- That will mark a subscription with a 'paused' status
- That subscription can be 'resumed' at a point in the future
- These status changes can be scheduled via the admin interface or the API

## Billing Behaviour

- Chargebee distinguishes between 
  - an [In term resumption](https://www.chargebee.com/docs/billing/2.0/subscriptions/pause-subscription#in-term-resumption) (where the pause start end end date are contained within the same billing period)
  - an [out of term resumption](https://www.chargebee.com/docs/billing/2.0/subscriptions/pause-subscription#out-of-term-resumption) (where the subscription resumes in a later billing period)
- These both have different billing behaviour

## In term resumption

Because as noted above, the invoice generated at the start of a month is for all the food in that month, it means in this case

1 At the point the pause is scheduled, the relevant invoice has not been generated yet and so there is no action to take
- At the start of the month containing the pause start and end, a new invoice is generated paying for all of the food in that month

> Chargebee does not automatically provide credits for the unused billing period, but you can choose to manually provide credits to your customers if needed.

This means in this case, it is up to us to credit the customer for the food not received

## Out of term resumption
