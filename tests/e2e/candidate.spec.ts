import jwt from 'jsonwebtoken';
import { test, expect } from '@playwright/test';

const candidateToken = () =>
  jwt.sign(
    {
      candidate_id: 'cand-001',
      job_id: 'job-123',
      exp: Math.floor(Date.now() / 1000) + 60
    },
    process.env.JWT_SECRET ?? 'insecure-default',
    { algorithm: 'HS256' }
  );

test('candidate tracker shows progress', async ({ page }) => {
  const token = candidateToken();
  await page.goto(`/track?t=${token}`);
  await expect(page.getByText('Your Application Journey')).toBeVisible();
  await expect(page.getByText('Application received', { exact: false })).toBeVisible();
});
