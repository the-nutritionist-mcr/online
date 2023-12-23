import { Page } from "@playwright/test";

export class LoginPage {
  constructor(private page: Page) {}

  async visit() {
    await this.page.goto("/login");
  }

  public get emailInput() {
    return this.page.getByLabel("Email");
  }

  public get passwordInput() {
    return this.page.getByLabel("Password");
  }

  public get loginButton() {
    return this.page.getByRole("button", { name: "Login" });
  }
}
