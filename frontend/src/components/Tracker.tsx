import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Card } from './ui/card';
import type { CandidateStatusResponse, TrackerStage } from '../types';

const stageOrder: TrackerStage[] = ['received', 'inReview', 'interviewing', 'offer', 'rejected'];

const StageNode = ({ stage, active }: { stage: TrackerStage; active: boolean }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center text-center text-xs text-slate-300">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
          active ? 'border-emerald-400 bg-emerald-500/10 text-emerald-200' : 'border-slate-700 bg-slate-900/60 text-slate-500'
        }`}
      >
        {stageOrder.indexOf(stage) + 1}
      </div>
      <p className="mt-2 max-w-[120px] text-xs leading-snug">{t(`track.stages.${stage}`)}</p>
    </div>
  );
};

const ProgressBar = ({ stage }: { stage: TrackerStage }) => {
  const stageIndex = stageOrder.indexOf(stage);
  const progressPercent = (stageIndex / (stageOrder.length - 1)) * 100;
  return (
    <div className="relative h-2 w-full rounded-full bg-slate-800">
      <motion.div
        className="absolute left-0 top-0 h-full rounded-full bg-emerald-400"
        initial={{ width: 0 }}
        animate={{ width: `${progressPercent}%` }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />
    </div>
  );
};

interface TrackerProps {
  data: CandidateStatusResponse;
}

export const Tracker = ({ data }: TrackerProps) => {
  const { candidate, timeline } = data;
  const currentStage = candidate.stage;
  const timelineMap = new Map(timeline.map((item) => [item.stage, item.timestamp]));

  return (
    <Card className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-slate-400">Tracking for</p>
          <p className="text-lg font-semibold text-slate-100">{candidate.name}</p>
          <p className="text-xs text-slate-500">{candidate.role}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-lg font-bold text-emerald-200">
            {candidate.initials}
          </span>
          <div className="text-xs text-slate-400">
            <p className="font-semibold uppercase tracking-wide text-emerald-300">Current Stage</p>
            <p className="text-slate-200">{t(`track.stages.${currentStage}`)}</p>
          </div>
        </div>
      </div>
      <ProgressBar stage={currentStage} />
      <div className="grid gap-4 md:grid-cols-5">
        {stageOrder.map((stage) => (
          <StageNode key={stage} stage={stage} active={stageOrder.indexOf(stage) <= stageOrder.indexOf(currentStage)} />
        ))}
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
        <p className="mb-2 font-semibold text-slate-100">Timeline</p>
        <ul className="space-y-2">
          {stageOrder.map((stage) => (
            <li key={stage} className="flex items-center justify-between">
              <span className="text-slate-400">{t(`track.stages.${stage}`)}</span>
              <span className="text-slate-500">{timelineMap.get(stage) ?? '—'}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};

export default Tracker;
