import { test, expect } from '@playwright/test';

test.describe('Release Management — RRS Engine & Pipeline', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('qev_activeTab', 'release'));
    await page.reload();
    await page.waitForSelector('.glass-card', { timeout: 10_000 });
  });

  test('renders Release Management heading', async ({ page }) => {
    await expect(page.getByText(/Release Management|Pillar 5/i).first()).toBeVisible();
  });

  test('RRS Score Breakdown section is visible', async ({ page }) => {
    await expect(page.getByText(/Release Readiness Score/i).first()).toBeVisible();
  });

  test('all 5 RRS dimensions are listed', async ({ page }) => {
    for (const dim of ['Functional Coverage', 'Automation Stability', 'Performance SLA', 'Security Risk', 'Regression Coverage']) {
      await expect(page.getByText(dim).first()).toBeVisible();
    }
  });

  test('vertical weight profile selector renders with options', async ({ page }) => {
    const select = page.locator('select').first();
    await expect(select).toBeVisible();
    const options = await select.locator('option').allTextContents();
    expect(options.length).toBeGreaterThanOrEqual(4);
  });

  test('Historical RRS Scores chart is visible', async ({ page }) => {
    await expect(page.getByText(/Historical RRS/i)).toBeVisible();
  });

  test('pipeline stepper shows all 5 stages', async ({ page }) => {
    // Use the specific pipeline-step-label span to avoid ambiguity with nav
    for (const stage of ['Code Push', 'QA Audit', 'UAT Gates', 'Rollout']) {
      await expect(page.locator('.pipeline-step-label', { hasText: stage }).first()).toBeVisible();
    }
    // Security stage label specifically scoped to pipeline stepper
    await expect(page.locator('.pipeline-step-label', { hasText: 'Security' })).toBeVisible();
  });

  test('Start Release Rollout button triggers pipeline animation', async ({ page }) => {
    const deployBtn = page.getByRole('button', { name: /Start Release Rollout/i });
    await expect(deployBtn).toBeVisible();
    await deployBtn.click();
    // Button changes to "Deploying..."
    await expect(page.getByRole('button', { name: /Deploying/i })).toBeVisible({ timeout: 3_000 });
  });

  test('View on GitHub Actions link is present', async ({ page }) => {
    const link = page.getByRole('link', { name: /GitHub Actions/i });
    await expect(link).toBeVisible();
    const href = await link.getAttribute('href');
    expect(href).toContain('github.com/gkolath/QEVantage/actions');
  });

  test('Evidence Audit Vaults section is present', async ({ page }) => {
    await expect(page.getByText(/Evidence Audit Vaults/i)).toBeVisible();
  });
});
