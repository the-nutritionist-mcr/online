import { test, expect } from "@playwright/test";
import { login } from "./login";

test.beforeEach(async ({ page }) => {
  await login(page, "cypress-test-user", "password");
  await page.reload();
  await page.getByRole("link", { name: "Recipes" }).click();
  await expect(page.getByRole("main")).toContainText("Recipes");
});

test("when recipes link is clicked, a page is loaded which contains recipe data", async ({
  page,
}) => {
  await expect(page.locator("tbody")).toContainText("CHIX ORZO");
  await expect(page.locator("tbody")).toContainText(
    "LEMON + HERB ROAST CHICKEN ORZO"
  );
  await expect(page.locator("tbody")).toContainText(
    "Basil pesto cream sauce, roasted cherry vine tomatoes, summer vegetables, aged parmesan"
  );
  await expect(page.locator("tbody")).toContainText("ASPARA RISSO");
  await expect(page.locator("tbody")).toContainText(
    "ASPARAGUS, PEA + BROAD BEAN RISOTTO"
  );
  await expect(page.locator("tbody")).toContainText(
    "Seared cypriot halloumi, parmesan, tarragon, semi dried tomatoes, lemon zest"
  );
});

test("User can add a recipe which is then visible in the recipes table", async ({
  page,
}) => {
  await page.getByLabel("New Recipe").click();
  await page.locator('input[name="name"]').fill("A recipe");
  await page.locator('input[name="shortName"]').fill("short-name");
  await page.locator('input[name="description"]').fill("A delicious thing");
  await page.locator('input[name="hotOrCold"]').click();
  await page.getByRole("option", { name: "Cold" }).click();

  await page.locator('input[name="allergens"]').fill("Fish");

  await page.locator('input[name="potentialExclusions"]').click();
  await page.getByRole("option", { name: "Extra Meat" }).click();
  await page.getByRole("option", { name: "No Alcohol" }).click();

  await page.locator('input[name="invalidExclusions"]').click();
  await page.getByRole("option", { name: "Extra Veg" }).click();

  await page
    .locator('[id="__next"] div')
    .filter({ hasText: "Create" })
    .nth(3)
    .click();

  await page.getByRole("button", { name: "Add" }).click();

  await page
    .locator("div")
    .filter({ hasText: /^Customisation$/ })
    .getByRole("textbox")
    .click();

  await page.getByRole("option", { name: "No Alcohol" }).click();
  await page
    .getByLabel("Open Drop", { exact: true })
    .getByRole("textbox")
    .click();

  await page.getByRole("option", { name: "CHIX GUMBO" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await page.getByRole("cell", { name: "short-name" }).click();
  await expect(page.locator("tbody")).toContainText("short-name");
  await expect(page.locator("tbody")).toContainText("A recipe");
  await expect(page.locator("tbody")).toContainText("A delicious thing");
  await expect(page.locator("tbody")).toContainText("Extra Meat");
  await expect(page.locator("tbody")).toContainText("No Alcohol");
});

test("User can edit a recipe and the edit is then visible in the recipes table", async ({
  page,
}) => {
  await page
    .getByRole("row", { name: "BEEF BURRITO SLOW COOKED BEEF" })
    .getByLabel("Edit")
    .first()
    .click();
  await expect(page.getByRole("main")).toContainText("Edit Recipe");

  await page.locator('input[name="shortName"]').fill("BEEF BURRITO-2");
  await page.getByLabel("Open Drop; Selected: Hot").click();
  await page.getByRole("option", { name: "Cold" }).click();

  await page.locator('input[name="potentialExclusions"]').click();
  await page.getByRole("option", { name: "No Alcohol" }).click();
  await page.locator("form").click();

  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.locator("body")).toContainText("successfully");
  await page.getByRole("link", { name: "Recipes" }).click();
  await expect(page.locator("main")).not.toContainText("not added", {
    timeout: 60_000,
  });
  await expect(page.locator("tbody")).toContainText("BEEF BURRITO-2");
  const row = page.locator("tr:has-text('BEEF BURRITO-2')");
  await expect(row).toContainText("No Alcohol");
});
