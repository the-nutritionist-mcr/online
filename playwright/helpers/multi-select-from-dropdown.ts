import { Locator, Page } from "@playwright/test";

export const multiSelectFromDropdown = async (
  page: Page,
  locator: Locator,
  values: string[]
) => {
  await locator.click();
  await values.reduce(async (nextPromise, current) => {
    await nextPromise;
    await page.getByRole("option", { name: current }).click();
  }, Promise.resolve());
  await locator.click();
};
