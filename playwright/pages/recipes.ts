import { Page } from "@playwright/test";

export class RecipesPage {
  public constructor(private page: Page) {}

  public get tableBody() {
    return this.page.locator("tbody");
  }

  public getRecipeRow(textContent: string) {
    return this.page.locator(`tr:has-text('${textContent}')`);
  }

  public getRecipeRowEditButton(textContentToSelectRow: string) {
    return this.getRecipeRow(textContentToSelectRow).getByLabel("Edit").first();
  }

  public get newRecipeButton() {
    return this.page.getByLabel("New Recipe");
  }

  public async visit() {
    await this.page.goto("/admin/recipes");
  }
}
