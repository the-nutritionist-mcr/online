import { Page } from "@playwright/test";

export class AccountPage {
  public constructor(private page: Page) {}

  public get logoutButton() {
    return this.page.getByRole("button", { name: "Logout" });
  }
}
