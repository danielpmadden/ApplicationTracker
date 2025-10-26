import { describe, expect, it } from 'vitest';

describe('ATS adapter contract', () => {
  it('loads mock candidates with normalized stages', async () => {
    const { loadCandidates, adapterMetadata } = await import('../../frontend/src/lib/atsAdapter');
    const candidates = await loadCandidates();
    expect(candidates.length).toBeGreaterThan(0);
    const normalizedStages = new Set(Object.values(adapterMetadata.statusMap));
    for (const candidate of candidates) {
      expect(normalizedStages.has(candidate.stage)).toBe(true);
    }
  });
});
