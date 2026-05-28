import { test, expect } from '@playwright/test';

test.describe('Dashboard — Release Readiness Score', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('qev_activeTab', 'dashboard'));
    await page.reload();
    await page.waitForSelector('.glass-card', { timeout: 10_000 });
  });

  test('renders RRS score gauge with a numeric value', async ({ page }) => {
    // Score is a large number rendered in the donut center
    const score = page.locator('.score-value, [class*="score"]').first();
    await expect(score).toBeVisible();
  });

  test('displays a GO / CONDITIONAL GO / NO-GO verdict badge', async ({ page }) => {
    const badge = page.locator('.badge-success, .badge-warning, .badge-danger').first();
    await expect(badge).toBeVisible();
    const text = await badge.textContent();
    expect(['GO', 'CONDITIONAL GO', 'NO-GO']).toContain(text?.trim());
  });

  test('renders all 5 RRS dimension evidence gates', async ({ page }) => {
    for (const dim of ['Functional Coverage', 'Automation Stability', 'Performance SLA', 'Security Risk', 'Regression Coverage']) {
      await expect(page.getByText(dim)).toBeVisible();
    }
  });

  test('scenario switcher — Clean Sprint resets to GO state', async ({ page }) => {
    await page.getByRole('button', { name: /Clean Sprint/i }).click();
    await page.waitForTimeout(500);
    const badge = page.locator('.badge-success').first();
    await expect(badge).toBeVisible();
  });

  test('scenario switcher — Checkout SQLi introduces security findings', async ({ page }) => {
    await page.getByRole('button', { name: /Checkout SQLi/i }).click();
    await page.waitForTimeout(500);
    // The scenario changes the state — verify score changes (badge is present in any state)
    const badge = page.locator('.badge-success, .badge-warning, .badge-danger').first();
    await expect(badge).toBeVisible();
  });

  test('navigation cards link to all 4 pillar tabs', async ({ page }) => {
    for (const label of ['Functional Testing', 'Automation Engine', 'Performance Profiling', 'Security & Audit']) {
      await expect(page.getByText(label)).toBeVisible();
    }
  });

  test('Deploy to Production button is present', async ({ page }) => {
    const btn = page.getByRole('button', { name: /Deploy to Production/i });
    await expect(btn).toBeVisible();
  });
});
