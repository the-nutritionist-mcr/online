import { test, expect } from "@playwright/test";
import { login } from "../helpers/login";
import { RecipesPage } from "../pages/recipes";
import { EditRecipePage } from "../pages/edit-recipe";

test.beforeEach(async ({ page }) => {
  await login(page, "cypress-test-user", "password");
  await page.reload();
  await page.getByRole("link", { name: "Recipes" }).click();
  await expect(page.getByRole("main")).toContainText("Recipes");
});

test("when recipes link is clicked, a page is loaded which contains recipe data", async ({
  page,
}) => {
  const recipesPage = new RecipesPage(page);

  await expect(recipesPage.tableBody).toContainText("CHIX ORZO");
  await expect(recipesPage.tableBody).toContainText(
    "LEMON + HERB ROAST CHICKEN ORZO"
  );
  await expect(recipesPage.tableBody).toContainText(
    "Basil pesto cream sauce, roasted cherry vine tomatoes, summer vegetables, aged parmesan"
  );
  await expect(recipesPage.tableBody).toContainText("ASPARA RISSO");
  await expect(recipesPage.tableBody).toContainText(
    "ASPARAGUS, PEA + BROAD BEAN RISOTTO"
  );
  await expect(recipesPage.tableBody).toContainText(
    "Seared cypriot halloumi, parmesan, tarragon, semi dried tomatoes, lemon zest"
  );
});

test("User can add a recipe which is then visible in the recipes table", async ({
  page,
}) => {
  const recipesPage = new RecipesPage(page);

  await recipesPage.newRecipeButton.click();

  const editRecipePage = new EditRecipePage(page);

  await editRecipePage.nameField.fill("A recipe");
  await editRecipePage.shortNameField.fill("short-name");
  await editRecipePage.descriptionField.fill("A delicious thing");

  await editRecipePage.setHotOrColdField("Cold");
  await editRecipePage.allergensField.fill("Fish");

  await editRecipePage.setPotentialExclusionsField([
    "Extra Meat",
    "No Alcohol",
  ]);

  await editRecipePage.setInvalidExclusionsField(["Extra Veg"]);

  await editRecipePage.addAlternateButton.click();

  await editRecipePage.setAlternateCustomisation(0, "No Alcohol");
  await editRecipePage.setAlternateRecipe(0, "CHIX GUMBO");

  await editRecipePage.saveButton.scrollIntoViewIfNeeded();
  await editRecipePage.saveButton.click();

  await expect(page.locator("body")).toContainText("successfully");
  await expect(page.locator("main")).not.toContainText("not added", {
    timeout: 60_000,
  });
  await expect(editRecipePage.tableBody).toContainText("short-name");
  await expect(editRecipePage.tableBody).toContainText("A recipe");
  await expect(editRecipePage.tableBody).toContainText("A delicious thing");
  await expect(editRecipePage.tableBody).toContainText("Extra Meat");
  await expect(editRecipePage.tableBody).toContainText("No Alcohol");
});

test("User can edit a recipe and the edit is then visible in the recipes table", async ({
  page,
}) => {
  const recipesPage = new RecipesPage(page);
  await expect(recipesPage.tableBody).toContainText("BEEF BURRITO");
  await recipesPage.getRecipeRowEditButton("BEEF BURRITO").click();

  await expect(page.getByRole("main")).toContainText("Edit Recipe");

  const editRecipePage = new EditRecipePage(page);

  await editRecipePage.shortNameField.fill("BEEF BURRITO-2");
  await editRecipePage.setHotOrColdField("Cold");
  await editRecipePage.setPotentialExclusionsField(["No Alcohol"]);
  await editRecipePage.saveButton.click();

  await expect(page.locator("body")).toContainText("successfully");

  await page.getByRole("link", { name: "Recipes" }).click();
  await expect(page.locator("main")).not.toContainText("not added", {
    timeout: 60_000,
  });

  await expect(recipesPage.tableBody).toContainText("BEEF BURRITO-2");
  await expect(recipesPage.getRecipeRow("BEEF BURRITO-2")).toContainText(
    "No Alcohol"
  );
});

test.fixme(
  "user can delete a recipe and the deleted recipe is no longer visible",
  async ({ page }) => {
    await page.goto("https://cypress.app.thenutritionistmcr.com/");
    await page.getByRole("button", { name: "Login" }).click();
    await page.getByRole("link", { name: "Recipes" }).click();
    await page.getByRole("button", { name: "Checkmark Ok" }).nth(1).click();
    await page.getByRole("link", { name: "Recipes" }).click();
  }
);
