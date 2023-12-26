import { expect } from "@playwright/test";
import { Page } from "@playwright/test";

export class CustomersPage {
  constructor(private page: Page) {}

  public async visit() {
    this.page.goto("/admin/customers");

    await expect(this.page).toHaveURL("/admin/customers/");
    await expect(this.page.getByText("Customers")).toBeVisible({
      timeout: 5 * 60_000,
    });
  }

  public customerRow(firstName: string, lastName: string) {
    return this.page.locator(`tr:has-text('${lastName}, ${firstName}')`);
  }
}
