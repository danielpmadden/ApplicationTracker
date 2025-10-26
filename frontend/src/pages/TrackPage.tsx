import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Tracker from '../components/Tracker';
import type { CandidateStatusResponse } from '../types';

const TrackPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('t');
  const { t } = useTranslation();
  const [data, setData] = useState<CandidateStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!token) {
        setError(t('track.invalidToken'));
        return;
      }
      const response = await fetch(`/api/track?t=${encodeURIComponent(token)}`);
      if (!response.ok) {
        setError(t('track.invalidToken'));
        return;
      }
      const result = (await response.json()) as CandidateStatusResponse;
      setData(result);
    };

    void fetchStatus();
  }, [token, t]);

  if (error) {
    return <p className="text-sm text-rose-300">{error}</p>;
  }

  if (!data) {
    return <p className="text-slate-300">Loading…</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-slate-100">{t('track.title')}</h2>
      <Tracker data={data} />
    </div>
  );
};

export default TrackPage;
