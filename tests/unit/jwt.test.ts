import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';

const secret = 'test-secret';

describe('JWT signing', () => {
  it('signs and verifies candidate tokens', () => {
    const payload = { candidate_id: 'cand-001', job_id: 'job-123', exp: Math.floor(Date.now() / 1000) + 60 };
    const token = jwt.sign(payload, secret, { algorithm: 'HS256' });
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
    expect(decoded).toMatchObject({ candidate_id: 'cand-001', job_id: 'job-123' });
  });

  it('rejects expired tokens', () => {
    const payload = { candidate_id: 'cand-001', job_id: 'job-123', exp: Math.floor(Date.now() / 1000) - 10 };
    const token = jwt.sign(payload, secret, { algorithm: 'HS256' });
    expect(() => jwt.verify(token, secret, { algorithms: ['HS256'] })).toThrow();
  });
});
