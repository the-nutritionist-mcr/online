import { Page } from "@playwright/test";
import { multiSelectFromDropdown } from "../helpers/multi-select-from-dropdown";
import { selectFromDropdown } from "../helpers/select-from-dropdown";

export class EditRecipePage {
  constructor(private page: Page) {}

  public get tableBody() {
    return this.page.locator("tbody");
  }

  public get nameField() {
    return this.page.locator("input[name='name']");
  }

  public get shortNameField() {
    return this.page.locator("input[name='shortName']");
  }

  public get descriptionField() {
    return this.page.locator("input[name='description']");
  }

  public get hotOrColdField() {
    return this.page.locator("input[name='hotOrCold']");
  }

  public async setHotOrColdField(value: string) {
    await selectFromDropdown(this.page, this.hotOrColdField, value);
  }

  public get allergensField() {
    return this.page.locator("input[name='allergens']");
  }

  public get potentialExclusionsField() {
    return this.page.locator("input[name='potentialExclusions']");
  }

  public async setPotentialExclusionsField(values: string[]) {
    await multiSelectFromDropdown(
      this.page,
      this.potentialExclusionsField,
      values
    );
  }

  public get invalidExclusionsField() {
    return this.page.locator('input[name="invalidExclusions"]');
  }

  public async setInvalidExclusionsField(values: string[]) {
    await multiSelectFromDropdown(
      this.page,
      this.invalidExclusionsField,
      values
    );
  }

  public get addAlternateButton() {
    return this.page.getByRole("button", { name: "Add" });
  }

  public get alternateCards() {
    return this.page.locator("div[data-testid='alternate-card']");
  }

  public get saveButton() {
    return this.page.getByText("Save");
  }

  public getAlternateCustomisationField(alternateIndex: number) {
    return this.alternateCards
      .nth(alternateIndex)
      .locator("input[name='alternate-customisation']");
  }

  public getAlternateRecipeField(alternateIndex: number) {
    return this.alternateCards
      .nth(alternateIndex)
      .locator("input[name='alternate-recipe']");
  }

  public async setAlternateRecipe(alternateIndex: number, value: string) {
    await selectFromDropdown(
      this.page,
      this.getAlternateRecipeField(alternateIndex),
      value
    );
  }

  public async setAlternateCustomisation(
    alternateIndex: number,
    value: string
  ) {
    await selectFromDropdown(
      this.page,
      this.getAlternateCustomisationField(alternateIndex),
      value
    );
  }
}
