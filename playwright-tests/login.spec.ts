import { test, expect } from "@playwright/test";
import { login } from "./login";
test("login page works and takes user to account page", async ({ page }) => {
  await page.goto("https://cypress.app.thenutritionistmcr.com/login");
  await page.getByLabel("Email").click();
  await page.getByLabel("Email").fill("cypress-test-user");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(
    "https://cypress.app.thenutritionistmcr.com/account/"
  );
});

test("logout page works and takes user to login page", async ({ page }) => {
  await login(page, "cypress-test-user", "password");
  await page.getByRole("button", { name: "Logout" }).click();
  await expect(page).toHaveURL(
    "https://cypress.app.thenutritionistmcr.com/login/"
  );
});
