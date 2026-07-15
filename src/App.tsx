import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { MobileCollectionBar } from './components/MobileCollectionBar';
import { QueryEditor } from './components/QueryEditor';
import { ResultsPanel } from './components/ResultsPanel';
import { Sidebar } from './components/Sidebar';
import { DatabaseProvider, useDatabase } from './hooks/useDatabase';
import { useMediaQuery } from './hooks/useMediaQuery';
import { ThemeProvider } from './hooks/useTheme';

function Playground() {
  const { loading } = useDatabase();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isDesktop) setSidebarOpen(false);
  }, [isDesktop]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen && !isDesktop ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen, isDesktop]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[100dvh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Loading sample data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[100dvh]">
      <Header onMenuClick={() => setSidebarOpen(true)} showMenu={!isDesktop} />
      <MobileCollectionBar />

      <div className="flex flex-1 min-h-0 relative">
        {sidebarOpen && !isDesktop && (
          <button
            type="button"
            aria-label="Close sidebar"
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-[2px] lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <Sidebar
          isOpen={isDesktop || sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={!isDesktop}
        />

        <main className="flex flex-col flex-1 min-h-0 min-w-0 w-full">
          <QueryEditor />
          <ResultsPanel />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <DatabaseProvider>
        <Playground />
      </DatabaseProvider>
    </ThemeProvider>
  );
}
