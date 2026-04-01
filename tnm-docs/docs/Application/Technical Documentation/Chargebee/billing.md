
# Billing

TNM configures Chargebee in the following manner 
- [calendar billing](https://www.chargebee.com/docs/billing/2.0/subscriptions/calendar-billing) is enabled
- Billing date is configured to be the first of every month

In practice what this means is

- On the first of each month, a new invoice is generated on the Chargebee system. That invoice represents payment for all of the food the customer will receive in *that* month. So for example, if an invoice is generated and paid for on the 1st of April, the customer has paid for food on all the cook days between the 1st of April and the last day of April inclusive
- When an invoice is generated, Chargebee will automatically request payment for that invoice. If that payment fails, Chargebee will continue to request payment through its [dunning](https://www.chargebee.com/docs/payments/2.0/dunning/dunning-v2) process.


# Subscription Pausing

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

Because as noted above, the invoice generated at the start of a month is for all the food received during that month, logically, that means

1. At the point the pause is scheduled, the relevant invoice has not been generated yet and so there is no action to take
2. At the start of the month containing the pause start and end, by default a new invoice must be generated paying for all of the food in that month
3. Because a pause has been scheduled, the customer will not receive some of that food

Reading the Chargebee documentation it states the following

> Chargebee does not automatically provide credits for the unused billing period, but you can choose to manually provide credits to your customers if needed.

*In practical terms, this means that once the pause resumes, the customer has paid for food they have not received and it is therefore up to us to make this right*

### How should we handle this?

It seems to me there are two possible approaches

#### 1. Adjust the bill at the start of the month, knowing an in-term pause period is present

While this seems like it might be a better approach, because the customer hasn't paid their bill yet, so seemingly its a simpler experience for the customer, this faces the following problem: If the customer changes their mind, we then have to *rebill* them for the food they didn't pay for.

 #### 2. Provide a credit note at the point of resumption

This is the current approach. If the customer has paid, we provide a refundable credit note for the correct amount. If the customer has not yet paid the invoice, this can be marked as an 'adjustment' to the current invoice, otherwise it can be marked as a 'refundable' credit note which will then be carried forward and adjusted against the next invoice

## Out of term resumption

For an 'out of term resumption' a subscription is still in a 'paused' state when a new billing period starts. In this scenario, **a new invoice will *not* be generated until the subscription is resumed**. The reason this is a slightly complicated billing scenario is because of our advance billing model: Food from any cooks between the start of the pause and the end of the billing period *have already been paid for*, but food in the following billing period have NOT yet been paid for.

_Again, in this scenario there is still food that has been paid for and not received, so it is again up to us to make it right_

#### How should we handle this?

For the reasons stated above, we are not going to adjust the invoice for the previous month until the pause has resumed. Since the 'current' month has already been pro-rated, we will

- Identify the amount of money
