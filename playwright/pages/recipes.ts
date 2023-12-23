import { Page } from "@playwright/test";

export class RecipesPage {
  public constructor(private page: Page) {}

  public tableBody() {
    return this.page.locator("tbody");
  }

  public newRecipeButton() {
    return this.page.getByLabel("New Recipe");
  }
}
