import { Page } from "@playwright/test";

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
    await this.hotOrColdField.click();
    await this.page.getByRole("option", { name: value }).click();
  }

  public get allergensField() {
    return this.page.locator("input[name='allergens']");
  }

  public get potentialExclusionsField() {
    return this.page.locator("input[name='potentialExclusions']");
  }

  public async setPotentialExclusionsField(values: string[]) {
    await this.potentialExclusionsField.click();
    await values.reduce(async (nextPromise, current) => {
      await nextPromise;
      await this.page.getByRole("option", { name: current }).click();
    }, Promise.resolve());
  }

  public get invalidExclusionsField() {
    return this.page.locator('input[name="invalidExclusions"]');
  }

  public async setInvalidExclusionsField(values: string[]) {
    await this.invalidExclusionsField.click();
    await values.reduce(async (nextPromise, current) => {
      await nextPromise;
      await this.page.getByRole("option", { name: current }).click();
    }, Promise.resolve());
  }
}
