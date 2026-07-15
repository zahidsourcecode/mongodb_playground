import { useEffect, useRef } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { Play } from 'lucide-react';
import { useDatabase } from '../hooks/useDatabase';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useTheme } from '../hooks/useTheme';

export function QueryEditor() {
  const { query, setQuery, runQuery } = useDatabase();
  const { theme } = useTheme();
  const isMobile = useMediaQuery('(max-width: 639px)');
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runQuery();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [runQuery]);

  return (
    <div className="flex flex-col flex-1 min-h-[200px] sm:min-h-[240px]">
      <div
        className="flex items-center justify-between px-3 sm:px-4 py-2 border-b shrink-0 gap-2"
        style={{ borderColor: 'var(--border)' }}
      >
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Query Editor
        </span>
        <button
          onClick={runQuery}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-sm font-medium rounded-lg bg-primary text-white hover:opacity-90 transition-opacity shadow-sm shrink-0"
        >
          <Play className="w-4 h-4" />
          <span>Run</span>
          <kbd className="hidden md:inline text-xs opacity-70 ml-1">Ctrl+Enter</kbd>
        </button>
      </div>

      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language="javascript"
          value={query}
          onChange={(val) => setQuery(val ?? '')}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          onMount={(editor) => {
            editorRef.current = editor;
          }}
          options={{
            fontSize: isMobile ? 12 : 14,
            fontFamily: 'JetBrains Mono, Fira Code, monospace',
            minimap: { enabled: false },
            lineNumbers: isMobile ? 'off' : 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            padding: { top: isMobile ? 8 : 12 },
            automaticLayout: true,
            scrollbar: { vertical: 'auto', horizontal: 'auto' },
          }}
        />
      </div>
    </div>
  );
}
