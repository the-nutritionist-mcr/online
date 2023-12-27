import { Locator, Page, expect } from "@playwright/test";
import { selectFromDatePicker } from "../helpers/select-from-date-picker";

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

  public recipeRowCheckbox(textContentToSelectRow: string) {
    const checkbox = this.getRecipeRow(textContentToSelectRow)
      .getByRole("checkbox")
      .first();

    return this.page.locator("label", { has: checkbox });
  }

  public getRecipeRowDeleteButton(textContentToSelectRow: string) {
    return this.getRecipeRow(textContentToSelectRow)
      .getByLabel("Delete")
      .first();
  }

  public get newRecipeButton() {
    return this.page.getByLabel("New Recipe");
  }

  public get planningModeButton() {
    return this.page.getByRole("button", { name: "Planning Mode" });
  }

  public get sendToPlannerButton() {
    return this.page.getByRole("button", { name: "Send to Planner" });
  }

  public pickMealsButton(cookNumber: number) {
    return this.page
      .getByRole("button", { name: `Cook ${cookNumber + 1}` })
      .nth(cookNumber);
  }

  public dateSelectorInput(cookNumber: number) {
    return this.page
      .locator(`div`)
      .filter({
        hasText: `Cook ${cookNumber}`,
      })
      .getByPlaceholder("mm/dd/yyyy");
  }

  public async setDateSelectorInput(cookNumber: number, date: Date) {
    const locator = this.dateSelectorInput(cookNumber);
    await selectFromDatePicker(locator, date);
  }

  public async visit() {
    await this.page.goto("/admin/recipes");

    await expect(this.page).toHaveURL("/admin/recipes/");
    await expect(
      this.page.getByRole("heading", { name: "Recipes" })
    ).toBeVisible({
      timeout: 5 * 60_000,
    });
  }
}
