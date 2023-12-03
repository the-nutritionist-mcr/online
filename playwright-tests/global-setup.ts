import { test as setup } from "@playwright/test";

setup("seed app", async ({ request }) => {
  await request.post("https://api.cypress.app.thenutritionistmcr.com/seed");
});
