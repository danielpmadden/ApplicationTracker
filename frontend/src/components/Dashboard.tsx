import { useDroppable, DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useState } from 'react';
import type { Candidate, TrackerStage } from '../types';
import { fetchCandidates, updateCandidateStage, type FetchCandidatesResponse } from '../hooks/useCandidates';

const columns: TrackerStage[] = ['received', 'inReview', 'interviewing', 'offer', 'rejected'];

interface ColumnProps {
  stage: TrackerStage;
  candidates: Candidate[];
}

const SortableCandidateCard = ({ candidate }: { candidate: Candidate }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: candidate.id
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 shadow hover:border-indigo-500 focus-within:border-indigo-500 focus:outline-none"
    >
      <p className="text-sm font-semibold text-slate-100">{candidate.name}</p>
      <p className="text-xs text-slate-400">{candidate.role}</p>
      <span className="mt-2 inline-flex items-center rounded-full bg-indigo-600/20 px-2 py-1 text-xs text-indigo-200">
        {candidate.channel.toUpperCase()}
      </span>
    </div>
  );
};

const Column = ({ stage, candidates }: ColumnProps) => {
  const { t } = useTranslation();
  const { setNodeRef } = useDroppable({ id: stage });
  return (
    <div className="flex h-full min-h-[280px] flex-1 flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
        {t(`dashboard.columns.${stage}`)}
      </h3>
      <div ref={setNodeRef} className="flex flex-1 flex-col gap-3">
        <SortableContext items={candidates.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {candidates.map((candidate) => (
            <SortableCandidateCard key={candidate.id} candidate={candidate} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

const AutomationPreview = ({ candidate, stage }: { candidate: Candidate | null; stage: TrackerStage | null }) => {
  const { t } = useTranslation();
  if (!candidate || !stage) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-400">
        {t('dashboard.automationPreview')}: —
      </div>
    );
  }

  return (
    <motion.div
      className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-sm text-indigo-100"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <p className="text-xs uppercase tracking-wide text-indigo-200/80">
        {t('dashboard.automationPreview')}
      </p>
      <p className="mt-2 text-sm">
        {t('dashboard.automationMessage', {
          channel: candidate.channel === 'sms' ? 'SMS' : 'email',
          name: candidate.name,
          stage: t(`dashboard.columns.${stage}`)
        })}
      </p>
    </motion.div>
  );
};

export const Dashboard = () => {
  const { data } = useQuery<FetchCandidatesResponse>({ queryKey: ['candidates'], queryFn: fetchCandidates });
  const queryClient = useQueryClient();
  const mutation = useMutation<void, Error, { candidateId: string; stage: TrackerStage }>({
    mutationFn: updateCandidateStage,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['candidates'] });
    }
  });
  const [preview, setPreview] = useState<{ candidate: Candidate | null; stage: TrackerStage | null }>({
    candidate: null,
    stage: null
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;
    if (!over || !data) return;
    const candidate = data.candidates.find((item) => item.id === active.id);
    const stage = over.id as TrackerStage;
    if (!candidate || candidate.stage === stage) return;
    setPreview({ candidate, stage });
    mutation.mutate({ candidateId: candidate.id, stage });
  };

  if (!data) {
    return <p className="text-slate-300">Loading…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid gap-4 md:grid-cols-5">
          {columns.map((stage) => (
            <Column
              key={stage}
              stage={stage}
              candidates={data.candidates.filter((candidate) => candidate.stage === stage)}
            />
          ))}
        </div>
      </DndContext>
      <AutomationPreview candidate={preview.candidate} stage={preview.stage} />
    </div>
  );
};

export default Dashboard;
