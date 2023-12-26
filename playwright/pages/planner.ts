import { Page } from "@playwright/test";

export class PlannerPage {
  constructor(private page: Page) {}

  visit() {}

  get publishButton() {
    return this.page.getByRole("button", { name: "Publish" });
  }

  get downloadsButton() {
    return this.page.getByRole("button", { name: "Downloads" });
  }

  get packPlanButton() {
    return this.page.getByRole("button", { name: "Pack Plan" });
  }

  get cookPlanButton() {
    return this.page.getByRole("button", { name: "Cook Plan" });
  }
}
