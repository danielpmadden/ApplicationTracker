import { useTranslation } from 'react-i18next';
import { Dashboard } from '../components/Dashboard';

const DashboardPage = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-100">{t('dashboard.title')}</h2>
        <p className="text-sm text-slate-400">
          Keep candidates informed at every stage. Drag to update their journey.
        </p>
      </div>
      <Dashboard />
    </div>
  );
};

export default DashboardPage;
