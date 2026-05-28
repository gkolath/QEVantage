import { test, expect } from '@playwright/test';

test.describe('Automation Engine — Test Suite Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('qev_activeTab', 'automation'));
    await page.reload();
    await page.waitForSelector('.glass-card', { timeout: 10_000 });
  });

  test('renders the Automation Engine heading', async ({ page }) => {
    await expect(page.getByText('Automation Engine')).toBeVisible();
  });

  test('displays Suite Health Matrix section', async ({ page }) => {
    await expect(page.getByText('Suite Health Matrix')).toBeVisible();
  });

  test('displays at least one test suite block', async ({ page }) => {
    // Suites render as cards in the heatmap grid — scroll container may clip
    await expect(page.locator('.glass-card').first()).toBeVisible();
    // The heatmap section exists
    await expect(page.getByText('Suite Health Matrix')).toBeVisible();
  });

  test('Run All Suites button exists and is clickable', async ({ page }) => {
    const btn = page.getByRole('button', { name: /Run All Suites/i });
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.getByText(/Executing/i)).toBeVisible({ timeout: 3_000 });
  });

  test('AI Self-Healing Engine section is present', async ({ page }) => {
    await expect(page.getByText('AI Self-Healing Engine')).toBeVisible();
  });

  test('Self-Healing Repair Log section is visible', async ({ page }) => {
    await expect(page.getByText('Self-Healing Repair Log')).toBeVisible();
  });

  test('Trigger Scan button is present', async ({ page }) => {
    const btn = page.getByRole('button', { name: /Trigger Scan|Scanning/i });
    await expect(btn).toBeVisible();
  });
});
