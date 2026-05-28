import { test, expect } from '@playwright/test';

test.describe('Security & Audit — Findings and Compliance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('qev_activeTab', 'security'));
    await page.reload();
    await page.waitForSelector('.glass-card', { timeout: 10_000 });
  });

  test('renders Security Testing heading', async ({ page }) => {
    await expect(page.getByText(/Security/i).first()).toBeVisible();
  });

  test('compliance section shows SOC2, PCI-DSS, GDPR, OWASP', async ({ page }) => {
    for (const framework of ['SOC2', 'PCI', 'GDPR', 'OWASP']) {
      await expect(page.getByText(new RegExp(framework, 'i')).first()).toBeVisible();
    }
  });

  test('security findings list renders with severity badges', async ({ page }) => {
    const badge = page.locator('.badge').first();
    await expect(badge).toBeVisible();
  });

  test('SQL Injection finding is displayed', async ({ page }) => {
    // Use heading role to avoid strict mode — the h4 title
    await expect(page.getByRole('heading', { name: /SQL Injection/i })).toBeVisible();
  });

  test('JWT finding is displayed', async ({ page }) => {
    await expect(page.getByText(/JWT/i).first()).toBeVisible();
  });

  test('triage desk section is visible', async ({ page }) => {
    await expect(page.getByText(/Triage|triage/i).first()).toBeVisible();
  });

  test('SAST and DAST labels are present', async ({ page }) => {
    await expect(page.getByText('SAST').first()).toBeVisible();
    await expect(page.getByText('DAST').first()).toBeVisible();
  });
});
