import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

function App() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <motion.h1
            className="text-xl font-bold tracking-tight md:text-2xl"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {t('app.title')}
          </motion.h1>
          <p className="text-sm text-slate-300">{t('app.subtitle')}</p>
        </div>
      </header>
      <main className="mx-auto flex max-w-6xl flex-1 flex-col px-6 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-slate-800 bg-slate-900/60 py-4">
        <div className="mx-auto max-w-6xl px-6 text-sm text-slate-400">
          {t('app.footer')}
        </div>
      </footer>
    </div>
  );
}

export default App;
