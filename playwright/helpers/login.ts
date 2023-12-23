import { Page, expect } from "@playwright/test";

export const login = async (page: Page, username: string, password: string) => {
  await page.goto("/login");
  await page.getByLabel("Email").click();
  await page.getByLabel("Email").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/\/account\//);
};
