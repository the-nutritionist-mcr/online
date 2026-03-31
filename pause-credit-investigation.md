# Pause Credit Investigation

## Summary

This document records the investigation into incorrect pause credit amounts for Chargebee customer `BTcafVU64aglxIENM` (Kornelija Maceviciute), based on:

- the stakeholder spreadsheet in [Kornelija Macevicilite.xlsx - KM Inv Summ.csv](/Users/benwainwright/repos/online/Kornelija%20Macevicilite.xlsx%20-%20KM%20Inv%20Summ.csv)
- the existing pause and webhook code
- the actual Chargebee event history for the customer

The conclusion is that the current implementation had multiple bugs:

1. credit notes were calculated from the wrong date source
2. the pricing formula varied by month length instead of using a stable weekly rate
3. admin-console pauses did not populate the custom pause-start field required by the resume automation
4. the UI still allowed pause durations beyond the stated 2-week business rule

## Findings

### 1. Resume credits used the wrong date

The main bug was in the resume webhook handler.

Before the fix, [handle-subscription-resumed.ts](/Users/benwainwright/repos/online/src/backend/event-handlers/handle-subscription-resumed.ts#L7) calculated the credit note amount using:

- `pauseStartDate` from the subscription custom field
- `DateTime.now().plus({ days: 2 })` as the resume date

That meant the credit amount depended on when the webhook code happened to run, not on the actual Chargebee resumption date.

Effects:

- credits could vary even for pauses of the same length
- cross-month calculations could be wrong
- delayed or retried webhook processing could produce the wrong reimbursement

### 2. Two inconsistent formulas were in use

There were two separate calculation paths:

- webhook path in [handle-subscription-resumed.ts](/Users/benwainwright/repos/online/src/backend/event-handlers/handle-subscription-resumed.ts#L42)
- admin/manual path in [chargebee-issue-pause-credit.ts](/Users/benwainwright/repos/online/src/backend/lambdas/handlers/chargebee-issue-pause-credit.ts#L43)

The old formulas were inconsistent:

- the webhook path used `subscriptionMrr / daysInMonth`
- the admin/manual path used a hard-coded `31` day month

That explains the stakeholder observation that a full week sometimes came out as `£81.11` instead of the expected weekly rate based on:

- `361.66 * 12 / 52 = 83.46`

The business rule is weekly, so the calculation should not depend on whether the month has 28, 30, or 31 days.

### 3. Admin-console pauses bypassed the automation

Automatic credit creation on resume relied on the custom field `cf_Pause_date_ISO`.

That field was populated when pauses were scheduled through the TNM app in [chargebee-pause-plan.ts](/Users/benwainwright/repos/online/src/backend/lambdas/handlers/chargebee-pause-plan.ts), but it was not populated when pauses were scheduled directly in Chargebee admin.

For this customer, the Chargebee events show:

- `SUBSCRIPTION_PAUSE_SCHEDULED` on `2024-05-21` from `ADMIN_CONSOLE`
- `SUBSCRIPTION_RESUMED` on `2024-06-22` from `SCHEDULED_JOB`

In that case the webhook could sync subscription state, but it had no stored pause-start date to calculate the reimbursement window correctly.

### 4. UI allowed more than 2 weeks of pause

The stakeholder said the business rule is:

- pauses must be in whole weeks
- starting on Sunday
- resuming on Sunday
- maximum 2 weeks

But the frontend pause selector still offered up to 4 weeks. This was in:

- [pause-selector.tsx](/Users/benwainwright/repos/online/src/components/organisms/account/pause-selector.tsx#L32)
- [pause-utils.ts](/Users/benwainwright/repos/online/src/components/organisms/account/pause-utils.ts#L15)

That mismatch could create pauses the business does not want to support.

## Actual Sequence Of Events

This is the reconstructed sequence from the Chargebee event history and the spreadsheet.

### May to June 2024

- `2024-05-21`: two `SUBSCRIPTION_PAUSE_SCHEDULED` events from `ADMIN_CONSOLE`
- `2024-06-22`: two `SUBSCRIPTION_RESUMED` events from `SCHEDULED_JOB`
- webhook delivery for the June resume events succeeded

Interpretation:

- the pause was created manually in Chargebee
- the automation likely did not have `cf_Pause_date_ISO`
- any reimbursement for this period required manual handling

This lines up with the spreadsheet showing:

- invoice `2375` on `20-Jun`
- then a later credit note/manual adjustment rather than a clean automated reimbursement

### July to August 2024

The spreadsheet shows:

- `CN 305` for pause `12-Jul` to `23-Jul`
- `CN 317` for pause `26-Jul` to `31-Jul`
- invoice `2540` on `8-Aug` with deductions applied

This period appears to have been handled, but the amounts were derived from inconsistent prorating logic.

### September to November 2024

Chargebee events show:

- `2024-09-30`: two `SUBSCRIPTION_PAUSE_SCHEDULED` events from `API`
- `2024-10-20`: two `SUBSCRIPTION_RESUMED` events from `SCHEDULED_JOB`
- both October `SUBSCRIPTION_RESUMED` webhook deliveries show failed integration status
- `2024-11-04`: `INVOICE_GENERATED` and `CREDIT_NOTE_CREATED` events from `ADMIN_CONSOLE`

Interpretation:

- this pause was scheduled through TNM, so the pause-start custom field should have existed
- but the resume webhook failed, so automatic credit creation did not complete
- staff then corrected it manually in Chargebee on `2024-11-04`

This matches the spreadsheet rows around:

- `CN 367`
- invoice `2769`

### November 2024 to February 2025

Chargebee events show:

- `2024-11-30`: `CREDIT_NOTE_CREATED` from `ADMIN_CONSOLE`
- `2025-02-06`: multiple `CREDIT_NOTE_CREATED` events from `ADMIN_CONSOLE`

Interpretation:

- further historical corrections were made manually
- this is consistent with the spreadsheet containing later adjustments and promo-credit comments

## Root Cause

The incorrect results were not caused by a single defect. They came from a combination of:

1. wrong resume date source in the webhook
2. month-based daily prorating instead of a weekly-derived rate
3. missing pause metadata for admin-created pauses
4. occasional failed resume webhook deliveries
5. frontend allowing unsupported pause durations

## Fix Implemented

### 1. Shared pause credit calculation

A single calculator was added in:

- [calculate-pause-credit.ts](/Users/benwainwright/repos/online/src/backend/utils/calculate-pause-credit.ts#L1)

The new logic:

- uses the actual pause start and actual resume date
- credits only the portion of the pause that belongs to the already-billed period
- derives the rate from:
  - `monthly_mrr * 12 / 52 / 7`

That gives a stable weekly-based calculation aligned to the business rule.

### 2. Resume webhook now uses the actual event time

The webhook now passes the real Chargebee event timestamp into the resume handler:

- [webhook.ts](/Users/benwainwright/repos/online/src/backend/lambdas/handlers/webhook.ts#L97)

The resume handler now calculates credit from that actual resume date:

- [handle-subscription-resumed.ts](/Users/benwainwright/repos/online/src/backend/event-handlers/handle-subscription-resumed.ts#L42)

### 3. Admin/manual credit path uses the same formula

The admin/manual endpoint now uses the same shared calculator:

- [chargebee-issue-pause-credit.ts](/Users/benwainwright/repos/online/src/backend/lambdas/handlers/chargebee-issue-pause-credit.ts#L43)

That removes the old hard-coded 31-day calculation.

### 4. Admin-console pause scheduling now stores the pause start date

The webhook now writes `cf_Pause_date_ISO` when it receives:

- `subscription_pause_scheduled`

and clears it on:

- `subscription_scheduled_pause_removed`

This makes admin-console scheduling behave the same as app scheduling for downstream credit automation.

Implementation:

- [webhook.ts](/Users/benwainwright/repos/online/src/backend/lambdas/handlers/webhook.ts#L19)
- [webhook.ts](/Users/benwainwright/repos/online/src/backend/lambdas/handlers/webhook.ts#L126)

### 5. Frontend pause limit reduced to 2 weeks

The UI now only offers up to 2 weeks, matching the business rule:

- [pause-selector.tsx](/Users/benwainwright/repos/online/src/components/organisms/account/pause-selector.tsx#L32)
- [pause-utils.ts](/Users/benwainwright/repos/online/src/components/organisms/account/pause-utils.ts#L15)

## Verification

The following verification was run after the code changes:

1. `npx vitest run src/backend/utils/calculate-pause-credit.spec.ts`
2. `npx vitest run src/backend/lambdas/handlers/webhook.spec.ts`
3. `npx tsc --noEmit`

All passed.

There is still an unrelated warning during Vitest startup because the repo contains `tnm-docs/tsconfig.json` extending `@docusaurus/tsconfig`, which is not installed in this workspace. That warning did not prevent the targeted tests from passing.

## Notes On Chargebee Behavior

Chargebee event history confirmed that:

- pauses and resumptions are distinct events
- resumptions can trigger new invoices at the time the subscription resumes
- credit-note creation for these pause reimbursements is being handled by TNM logic rather than by an automatic Chargebee pause-credit feature

Relevant documentation checked during the investigation:

- https://www.chargebee.com/docs/2.0/credit-notes.html
- https://www.chargebee.com/docs/billing/1.0/kb/billing/edit-the-resumption-date-of-a-paused-subscription

## Outcome

Future pause credits should now:

- use the actual pause window
- use a consistent weekly-derived rate
- work whether the pause was scheduled in TNM or directly in Chargebee admin
- respect the stated 2-week maximum pause rule in the UI

Historical bad credits are not automatically corrected by this change. Those would require a separate one-off backfill or manual correction exercise.
