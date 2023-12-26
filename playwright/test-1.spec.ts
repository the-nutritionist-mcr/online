import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://cypress.app.thenutritionistmcr.com/');
  await page.getByRole('link', { name: 'Account' }).click();
  await page.getByLabel('Email').click();
  await page.getByLabel('Email').fill('cypress-test-user');
  await page.getByLabel('Email').press('Tab');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Customers' }).click();
  const row = 
  await page.getByRole('link', { name: 'Customer, E2E' }).click();
});