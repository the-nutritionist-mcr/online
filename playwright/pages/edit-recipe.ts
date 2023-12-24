import { Page } from "@playwright/test";
import { selectFromDropdown } from "../helpers/select-from-dropdown";

export class EditRecipePage {
  constructor(private page: Page) {}

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
    await selectFromDropdown(this.page, this.hotOrColdField, [value]);
  }

  public get allergensField() {
    return this.page.locator("input[name='allergens']");
  }

  public get potentialExclusionsField() {
    return this.page.locator("input[name='potentialExclusions']");
  }

  public async setPotentialExclusionsField(values: string[]) {
    await selectFromDropdown(this.page, this.potentialExclusionsField, values);
  }

  public get invalidExclusionsField() {
    return this.page.locator('input[name="invalidExclusions"]');
  }

  public async setInvalidExclusionsField(values: string[]) {
    await selectFromDropdown(this.page, this.invalidExclusionsField, values);
  }

  public get addAlternateButton() {
    return this.page.getByRole("button", { name: "Add" });
  }

  public getCustomisationCards(index: number) {
    return this.page
      .locator("div")
      .filter({ hasText: /^Customisation$/ })
      .nth(index);
  }

  public get customisationsField() {
    return this.page
      .locator("div")
      .filter({ hasText: /^Customisation$/ })
      .getByRole("textbox");
  }

  public setCustomisationsField(values: string[]) {
    return selectFromDropdown(this.page, this.customisationsField, values);
  }
}
