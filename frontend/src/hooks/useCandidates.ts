import type { TrackerStage } from '../types';

export interface FetchCandidatesResponse {
  candidates: Array<{
    id: string;
    name: string;
    initials: string;
    role: string;
    stage: TrackerStage;
    channel: 'email' | 'sms';
  }>;
}

export const fetchCandidates = async (): Promise<FetchCandidatesResponse> => {
  const response = await fetch('/api/status/all');
  if (!response.ok) {
    throw new Error('Failed to load candidates');
  }
  return (await response.json()) as FetchCandidatesResponse;
};

export const updateCandidateStage = async ({
  candidateId,
  stage
}: {
  candidateId: string;
  stage: TrackerStage;
}): Promise<void> => {
  const response = await fetch(`/api/status/${candidateId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ stage })
  });
  if (!response.ok) {
    throw new Error('Failed to update candidate');
  }
};
