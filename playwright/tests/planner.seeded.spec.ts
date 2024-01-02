import { expect } from "@playwright/test";
import { test } from "./base";
import { E2E } from "@tnmo/constants";
import { waitUntilCognitoUserDoesntExist } from "../helpers/wait-until-cognito-user-doesnt-exist";
import { createChargebeeCustomer } from "../helpers/chargebee/create-customer";
import { CustomersPage } from "../pages/customers";
import { deleteChargebeeCustomer } from "../helpers/chargebee/delete-customer";
import { login } from "../helpers/login";
import { addTestCard } from "../helpers/chargebee/add-test-card";
import { addSubscription } from "../helpers/chargebee/add-subscription";
import { RecipesPage } from "../pages/recipes";

test.beforeAll(async () => {
  await deleteChargebeeCustomer(E2E.e2eCustomer.username);
});

test.beforeEach(async ({ page }) => {
  await login(page, "cypress-test-user", "password");
});

test.fixme(
  "When a user generates a plan using planning mode on the recipes page, that plan appears on the planner",
  async ({ page, clock }) => {
    const testUser = {
      username: E2E.e2eCustomer.username,
      country: E2E.e2eCustomer.country,
      deliveryDay1: E2E.e2eCustomer.deliveryDay1,
      deliveryDay2: E2E.e2eCustomer.deliveryDay2,
      addressLine1: E2E.e2eCustomer.addressLine1,
      addressLine2: E2E.e2eCustomer.addressLine2,
      phoneNumber: E2E.e2eCustomer.phoneNumber,
      addressLine3: E2E.e2eCustomer.addressLine3,
      firstName: E2E.e2eCustomer.firstName,
      surname: E2E.e2eCustomer.surname,
      email: E2E.e2eCustomer.email,
      city: E2E.e2eCustomer.city,
      postcode: E2E.e2eCustomer.postcode,
    };

    await waitUntilCognitoUserDoesntExist(testUser.username);
    await createChargebeeCustomer(testUser);

    const customersPage = new CustomersPage(page);
    await customersPage.visit();

    const theCustomerRow = customersPage.customerRow(
      testUser.firstName,
      testUser.surname
    );
    await expect(theCustomerRow).toBeVisible({ timeout: 5 * 60_000 });

    await addTestCard(testUser.username);
    await addSubscription(E2E.e2eCustomer.username, "EQ-1-Monthly-5-2022");

    await expect(theCustomerRow).toContainText("EQ-5", { timeout: 5 * 60_000 });

    const recipesPage = new RecipesPage(page);

    await recipesPage.visit();

    await clock.mockDate(new Date("December 27 2023"));

    await recipesPage.planningModeButton.click();
    await recipesPage.pickMealsButton(0).click();
    await recipesPage.recipeRowCheckbox("PAD THAI").click();
    await recipesPage.recipeRowCheckbox("ANCHO BBQ CHIX").click();
    await recipesPage.recipeRowCheckbox("ACHIOTE PORK").click();
    await recipesPage.recipeRowCheckbox("RICOTTA").click();
    await recipesPage.recipeRowCheckbox("BUDDHA BOWL").click();
    await recipesPage.recipeRowCheckbox("SAGE RISO").click();

    await recipesPage.setDateSelectorInput(0, new Date("December 31 2023"));

    await recipesPage.pickMealsButton(1).click();
    await recipesPage.recipeRowCheckbox("CHIX ORZO").click();
    await recipesPage.recipeRowCheckbox("BEEF BURRITO").click();
    await recipesPage.recipeRowCheckbox("TERIYAKI SAL").click();
    await recipesPage.recipeRowCheckbox("CHIX ANCHO").click();
    await recipesPage.recipeRowCheckbox("SAL HOI SIN").click();
    await recipesPage.recipeRowCheckbox("GOAT NUT SAL").click();

    await recipesPage.setDateSelectorInput(1, new Date("January 3 2024"));
    await recipesPage.sendToPlannerButton.click();
  }
);
