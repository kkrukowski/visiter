import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('https://visiter.onrender.com/');

  await expect(page).toHaveTitle("Logowanie | Visiter");
});

test('img load after LogIn', async ({ page }) => {
  await page.goto('https://visiter.onrender.com/');

  await page.getByPlaceholder("E-mail").fill("test@test.com");

  await page.getByPlaceholder("Hasło").fill("12345");
  
  await page.getByRole("button").click();
  await page.waitForURL('https://visiter.onrender.com/login');

  await expect(page.getByAltText("Visiter")).toBeVisible();
});

test('page js script works', async ({ page }) => {
  await page.goto('https://visiter.onrender.com/');

  await page.getByPlaceholder("E-mail").fill("test@test.com");

  await page.getByPlaceholder("Hasło").fill("12345");
  
  await page.getByRole("button").click();
  await page.waitForURL('https://visiter.onrender.com/login');
  
  await page.getByText("MOJA FIRMA").click()
  await page.waitForURL('https://visiter.onrender.com/business/myBusiness/63ac27805d355ccaf2212654');

  await expect(page.locator(".modal").first()).toBeHidden();
  await page.locator("#addWorker").click();
  await expect(page.locator(".modal").first()).toBeVisible();
});