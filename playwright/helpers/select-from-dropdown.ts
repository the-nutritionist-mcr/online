import { Locator, Page } from "@playwright/test";

export const selectFromDropdown = async (
  page: Page,
  locator: Locator,
  value: string
) => {
  await locator.click();
  await page.getByRole("option", { name: value }).click();
};
