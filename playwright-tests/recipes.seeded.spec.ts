import { test, expect } from "@playwright/test";
import { login } from "./login";

test("when recipes link is clicked, a page is loaded which contains recipe data", async ({
  page,
}) => {
  await login(page, "cypress-test-user", "password");
  await page.reload();
  await page.getByRole("link", { name: "Recipes" }).click();
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
