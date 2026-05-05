interface CreditNoteNoteParams {
  creditDays: number;
  mrr: number;
}

export const generateCreditNoteCustomerNote = ({
  creditDays,
  mrr,
}: CreditNoteNoteParams) => {
  const daysString = `day${creditDays === 1 ? "" : "s"}`;

  const GBP = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  });

  const mrrPounds = GBP.format(mrr / 100);

  return `Pause credit for ${creditDays} ${daysString} = ((${mrrPounds} x Months in year) / Days in year) x ${creditDays}`;
};
