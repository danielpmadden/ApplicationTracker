import statusMap from '../../config/status-map.json';
import { describe, expect, it } from 'vitest';

describe('status-map', () => {
  it('normalizes known statuses', () => {
    expect(statusMap['application_submitted']).toBe('received');
    expect(statusMap['interview_panel']).toBe('interviewing');
    expect(statusMap['offer_extended']).toBe('offer');
  });

  it('falls back to received when status missing', () => {
    const unknownStatus = statusMap['something_else'];
    expect(unknownStatus).toBeUndefined();
  });
});
