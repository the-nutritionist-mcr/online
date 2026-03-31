# Pause Credit Amount Tests

## Purpose

This document lists the stakeholder-facing automated tests for pause credit behaviour on subscription resume.

These scenarios reflect the production rule:

1. find the invoice containing the pause start date
2. find the invoice containing the resume date
3. if they are the same invoice, create no manual credit note
4. if they are different invoices, create a credit note only for the paused days inside the pause-start invoice

## Billing Behaviour

- In-term resumptions are expected to be prorated by Chargebee automatically, so TNM should not create a manual credit note.
- Out-of-term resumptions can leave the earlier invoice uncorrected, so TNM creates a credit note against the invoice containing the pause start date.
- For `paid` pause-start invoices, the credit note is `REFUNDABLE`.
- For `payment_due` pause-start invoices, the credit note is `ADJUSTMENT`.

## Assumptions Used In These Tests

- Dates are handled as whole days.
- Amounts are shown in cents to match the system.
- Credit amounts round up to the nearest cent.
- Formula used:
  - weekly rate = `subscriptionMrr * 12 / 52`
  - daily rate = `weekly rate / 7`
  - credit amount = `ceil(daily rate * credited days)`

## Real-World Handler Test Cases

| Test ID | Scenario | Pause start | Resume date | Pause-start invoice term start | Pause-start invoice term end | Resume invoice term start | Resume invoice term end | Pause-start invoice status | Manual credit note type | Subscription MRR (cents) | Expected credited days | Credit note amount (cents) | Credit note amount (GBP) | Expected billing effect | Calculation explanation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | --- | --- |
| H1 | In-term resumption within a single billed period should not create a manual credit note | 2024-07-12 | 2024-07-23 | 2024-07-01 | 2024-08-01 | 2024-07-01 | 2024-08-01 | paid | None | 36166 | 0 | 0 | 0.00 | No manual credit note because Chargebee should handle the in-term proration | Pause start and resume date fall in the same billed term |
| H2 | Out-of-term resumption on a `payment_due` start invoice should reduce that earlier invoice | 2024-10-25 | 2024-11-05 | 2024-10-01 | 2024-11-01 | 2024-11-01 | 2024-12-01 | payment_due | ADJUSTMENT | 36166 | 7 | 8346 | 83.46 | Creates adjustment credit against the pause-start invoice | `36166 * 12 / 52 = 8346` weekly, `8346 / 7 = 1192.285714` daily, `1192.285714 * 7 = 8346` |
| H3 | Out-of-term resumption from a month-crossing billed period credits only the paused days in the start invoice | 2024-02-28 | 2024-04-03 | 2024-02-26 | 2024-03-26 | 2024-03-26 | 2024-04-26 | paid | REFUNDABLE | 36166 | 27 | 32192 | 321.92 | Creates refundable credit against the pause-start invoice | `36166 * 12 / 52 = 8346` weekly, `8346 / 7 = 1192.285714` daily, `1192.285714 * 27 = 32191.714278`, rounded up to `32192` |
| H4 | In-term resumption inside a month-crossing billed period should not create a manual credit note | 2024-02-28 | 2024-03-03 | 2024-02-26 | 2024-03-26 | 2024-02-26 | 2024-03-26 | paid | None | 36166 | 0 | 0 | 0.00 | No manual credit note because Chargebee should handle the in-term proration | Pause start and resume date both fall in the same billed term |
| H5 | Out-of-term resumption credits the pause-start invoice rather than the later resume invoice | 2024-03-20 | 2024-04-05 | 2024-03-01 | 2024-04-01 | 2024-04-01 | 2024-05-01 | paid | REFUNDABLE | 36166 | 12 | 14308 | 143.08 | Creates refundable credit against the pause-start invoice | `36166 * 12 / 52 = 8346` weekly, `8346 / 7 = 1192.285714` daily, `1192.285714 * 12 = 14307.428568`, rounded up to `14308` |
| H7 | Out-of-term resumption for a lower monthly recurring revenue credits the earlier invoice only | 2024-08-28 | 2024-09-12 | 2024-08-01 | 2024-09-01 | 2024-09-01 | 2024-10-01 | paid | REFUNDABLE | 24000 | 4 | 3165 | 31.65 | Creates refundable credit against the pause-start invoice | `24000 * 12 / 52 = 5538.461538` weekly, `5538.461538 / 7 = 791.208791` daily, `791.208791 * 4 = 3164.835164`, rounded up to `3165` |
| H8 | Out-of-term resumption for a higher monthly recurring revenue credits only the paused days inside the start invoice | 2024-09-25 | 2024-10-10 | 2024-09-01 | 2024-10-01 | 2024-10-01 | 2024-11-01 | paid | REFUNDABLE | 49999 | 6 | 9890 | 98.90 | Creates refundable credit against the pause-start invoice | `49999 * 12 / 52 = 11538.230769` weekly, `11538.230769 / 7 = 1648.318681` daily, `1648.318681 * 6 = 9889.912086`, rounded up to `9890` |
| H9 | Out-of-term resumption for a mid-range MRR credits the overlap of the pause with the start invoice | 2024-05-30 | 2024-06-14 | 2024-05-06 | 2024-06-06 | 2024-06-06 | 2024-07-06 | paid | REFUNDABLE | 27550 | 7 | 6358 | 63.58 | Creates refundable credit against the pause-start invoice | `27550 * 12 / 52 = 6357.692307` weekly, `6357.692307 / 7 = 908.241758` daily, `908.241758 * 7 = 6357.692306`, rounded up to `6358` |

## What These Cases Prove

- `H1` proves that in-term resumptions are skipped.
- `H2` proves that the pause-start invoice determines the credit-note type.
- `H3`, `H5`, `H7`, `H8`, and `H9` prove that only the paused days inside the pause-start invoice are credited for out-of-term resumptions.
- `H4` proves that an in-term resumption is still skipped even when the billed term crosses a calendar month.

## What Is Not Included Here

The codebase also contains lower-level defensive tests for date normalization, zero-MRR behaviour, and overlap math. Those remain useful for engineering safety but are not listed here because they are not normal stakeholder operating scenarios.
