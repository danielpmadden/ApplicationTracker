import { test, expect } from '@playwright/test';

test('recruiter dashboard renders columns', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Recruiter Control Tower')).toBeVisible();
  await expect(page.getByText('Received')).toBeVisible();
  await expect(page.getByText('Interviewing')).toBeVisible();
});
