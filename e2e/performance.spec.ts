import { test, expect } from '@playwright/test';

test.describe('Performance Profiling — SLA & Telemetry', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('qev_activeTab', 'performance'));
    await page.reload();
    await page.waitForSelector('.glass-card', { timeout: 10_000 });
  });

  test('renders Performance tab heading', async ({ page }) => {
    // Heading contains "Performance" — could be "Pillar 3: Performance Profiling"
    await expect(page.getByText(/Performance/i).first()).toBeVisible();
  });

  test('displays build history chart with SVG', async ({ page }) => {
    const svg = page.locator('svg').first();
    await expect(svg).toBeVisible();
  });

  test('SLA threshold input is present', async ({ page }) => {
    const input = page.locator('input[type="range"], input[type="number"]').first();
    await expect(input).toBeVisible();
  });

  test('Live Telemetry toggle is visible', async ({ page }) => {
    // Toggle label: "Enable Live Feed" or "Live Telemetry Active"
    await expect(page.getByText(/Live.*Feed|Live.*Telemetry/i).first()).toBeVisible();
  });

  test('Load simulation buttons are present', async ({ page }) => {
    // Actual labels from TRANSLATIONS: "Black Friday Load", "Standard Load", "Inventory Sync"
    for (const label of ['Black Friday', 'Standard Load', 'Inventory Sync']) {
      await expect(page.getByText(new RegExp(label, 'i')).first()).toBeVisible();
    }
  });

  test('Performance metrics cards are visible', async ({ page }) => {
    // At least one glass-card should contain build metrics
    const cards = page.locator('.glass-card');
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('Anomaly log section is visible', async ({ page }) => {
    await expect(page.getByText(/Anomaly|anomalies/i).first()).toBeVisible();
  });
});
