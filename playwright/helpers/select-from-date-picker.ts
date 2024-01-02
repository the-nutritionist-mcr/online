import { Locator } from "@playwright/test";

const monthDiff = (dateFrom: Date, dateTo: Date) =>
  dateTo.getMonth() -
  dateFrom.getMonth() +
  12 * (dateTo.getFullYear() - dateFrom.getFullYear());

const months = {
  January: 0,
  February: 1,
  March: 2,
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11,
};

export const selectFromDatePicker = async (
  input: Locator,
  targetDate: Date
) => {
  await input.click();

  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString("default", { month: "long" });

  const container = input.locator(`div:has-text('${currentMonth}')`);

  const header = (await container.locator("h3").innerText()).trim().split(" ");
  const currentYear = parseInt(header[1].trim());
  currentDate.setFullYear(currentYear);
  const difference = monthDiff(currentDate, targetDate);
  const nextOrPrevious = difference > 0 ? "Next" : "Previous";

  const targetWeekday = targetDate.toLocaleString("default", {
    weekday: "short",
  });
  const targetMonth = targetDate.toLocaleString("default", { month: "short" });

  const targetDay = targetDate.toLocaleString("default", { day: "2-digit" });

  const targetLabelString = `${targetWeekday} ${targetMonth} ${targetDay}`;

  await [...Array.from({ length: Math.abs(difference) })].reduce(
    async (prevPromise) => {
      await prevPromise;
      await input.getByRole("button", { name: nextOrPrevious }).click();
    },
    Promise.resolve()
  );

  await input.getByLabel(targetLabelString).click();
};
