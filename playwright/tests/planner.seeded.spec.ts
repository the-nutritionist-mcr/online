import { test, expect } from "@playwright/test";
import { E2E } from "@tnmo/constants";
import { waitUntilCognitoUserDoesntExist } from "../helpers/wait-until-cognito-user-doesnt-exist";
import { createChargebeeCustomer } from "../helpers/chargebee/create-customer";
import { CustomersPage } from "../pages/customers";
import { deleteChargebeeCustomer } from "../helpers/chargebee/delete-customer";
import { login } from "../helpers/login";
import { addTestCard } from "../helpers/chargebee/add-test-card";
import { addSubscription } from "../helpers/chargebee/add-subscription";

test.beforeAll(async () => {
  await deleteChargebeeCustomer(E2E.e2eCustomer.username);
});

test.beforeEach(async ({ page }) => {
  await login(page, "cypress-test-user", "password");
});

test("When a user generates a plan using planning mode on the recipes page, that plan appears on the planner", async ({
  page,
}) => {
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
});
