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

// test("When the user clicks on the recipes page link, a page appears containing loaded recipe data", async ({
//   page,
// }) => {
//   test.setTimeout(120000);
//   const recipesPage = new RecipesPage(page);

//   await expect(recipesPage.tableBody).toContainText("CHIX ORZO");
//   await expect(recipesPage.tableBody).toContainText(
//     "LEMON + HERB ROAST CHICKEN ORZO"
//   );
//   await expect(recipesPage.tableBody).toContainText(
//     "Basil pesto cream sauce, roasted cherry vine tomatoes, summer vegetables, aged parmesan"
//   );
//   await expect(recipesPage.tableBody).toContainText("ASPARA RISSO");
//   await expect(recipesPage.tableBody).toContainText(
//     "ASPARAGUS, PEA + BROAD BEAN RISOTTO"
//   );
//   await expect(recipesPage.tableBody).toContainText(
//     "Seared cypriot halloumi, parmesan, tarragon, semi dried tomatoes, lemon zest"
//   );
// });

test("When a user creates a new recipe, the recipe appears on the recipes page", async ({
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

test("When a user edits a recipe, the edit appears on the recipes page", async ({
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
  "When a user deletes a recipe, it is no longer visible on the page",
  async ({ page }) => {
    const recipesPage = new RecipesPage(page);
    await expect(recipesPage.tableBody).toContainText("ASIAN PORK");
    await recipesPage.getRecipeRowDeleteButton("ASIAN PORK").click();
    await expect(recipesPage.tableBody).not.toContainText("ASIAN PORK");
  }
);
