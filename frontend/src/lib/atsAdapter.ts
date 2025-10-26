import statusMap from '../../../config/status-map.json';
import mockData from '../../../config/mock-candidates.json';
import type { Candidate, TrackerStage } from '../types';

interface AtsCandidateRecord {
  id: string;
  fullName: string;
  role: string;
  status: string;
  channel: 'email' | 'sms';
}

interface AdapterOptions {
  source?: 'mock';
}

const atsRecords = mockData as AtsCandidateRecord[];

const stageFromStatus = (status: string): TrackerStage => {
  const normalized = statusMap[status] ?? 'received';
  return normalized as TrackerStage;
};

export const loadCandidates = async (options: AdapterOptions = {}): Promise<Candidate[]> => {
  const { source = 'mock' } = options;
  switch (source) {
    case 'mock':
      return atsRecords.map((record) => ({
        id: record.id,
        name: record.fullName,
        initials: record.fullName
          .split(' ')
          .map((part) => part.charAt(0))
          .join('')
          .slice(0, 2)
          .toUpperCase(),
        role: record.role,
        stage: stageFromStatus(record.status),
        channel: record.channel
      }));
    default:
      throw new Error(`Unsupported source: ${source}`);
  }
};

export const getCandidate = async (candidateId: string): Promise<Candidate | undefined> => {
  const candidates = await loadCandidates();
  return candidates.find((candidate) => candidate.id === candidateId);
};

export const adapterMetadata = {
  supportedSources: ['mock'],
  statusMap
};
