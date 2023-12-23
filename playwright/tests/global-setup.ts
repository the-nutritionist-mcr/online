import { test as setup } from "@playwright/test";
import { login } from "../helpers/login";

setup("seed app", async ({ request }) => {
  await request.post("https://api.cypress.app.thenutritionistmcr.com/seed");
});
