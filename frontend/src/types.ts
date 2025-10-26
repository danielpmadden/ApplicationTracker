export type TrackerStage = 'received' | 'inReview' | 'interviewing' | 'offer' | 'rejected';

export interface Candidate {
  id: string;
  name: string;
  initials: string;
  role: string;
  stage: TrackerStage;
  channel: 'email' | 'sms';
}

export interface CandidateStatusResponse {
  candidate: Candidate;
  timeline: Array<{
    stage: TrackerStage;
    timestamp: string;
  }>;
}
