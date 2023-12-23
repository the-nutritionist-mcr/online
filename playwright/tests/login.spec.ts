import { test, expect } from "@playwright/test";
import { login } from "../helpers/login";
import { LoginPage } from "../pages/login";
import { AccountPage } from "../pages/account";
test("login page works and takes user to account page", async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.visit();
  await loginPage.emailInput.click();
  await loginPage.emailInput.fill("cypress-test-user");
  await loginPage.passwordInput.fill("password");
  await loginPage.loginButton.click();

  await expect(page).toHaveURL(/\/account\//);
});

test("logout page works and takes user to login page", async ({ page }) => {
  await login(page, "cypress-test-user", "password");
  const accountPage = new AccountPage(page);

  await accountPage.logoutButton.click();

  await expect(page).toHaveURL(/\/login\//);
});
