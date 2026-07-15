import { AlertCircle, FileJson } from 'lucide-react';
import { useDatabase } from '../hooks/useDatabase';
import type { Document } from '../engine/types';

function getResultCount(result: unknown): number | null {
  if (Array.isArray(result)) return result.length;
  if (result && typeof result === 'object' && 'insertedId' in (result as Document)) return 1;
  if (result && typeof result === 'object' && 'deletedCount' in (result as Document)) return (result as { deletedCount: number }).deletedCount;
  if (result && typeof result === 'object' && 'modifiedCount' in (result as Document)) return (result as { modifiedCount: number }).modifiedCount;
  if (result === null) return 0;
  if (typeof result === 'number') return result;
  return 1;
}

function formatResult(result: unknown): string {
  if (result === null || result === undefined) return 'null';
  return JSON.stringify(result, null, 2);
}

export function ResultsPanel() {
  const { result, error } = useDatabase();
  const count = result !== null ? getResultCount(result) : null;

  return (
    <div
      className="flex flex-col h-44 sm:h-56 md:h-64 shrink-0 border-t"
      style={{ borderColor: 'var(--border)' }}
    >
      <div
        className="flex items-center justify-between px-3 sm:px-4 py-2 border-b shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Results
        </span>
        {count !== null && !error && (
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {Array.isArray(result) ? `${count} document${count !== 1 ? 's' : ''}` : '1 result'}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-auto p-3 sm:p-4" style={{ background: 'var(--code-bg)' }}>
        {error ? (
          <div className="flex items-start gap-2 text-red-500 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <pre className="font-mono whitespace-pre-wrap break-words">{error}</pre>
          </div>
        ) : result === null ? (
          <div className="flex flex-col items-center justify-center h-full gap-2" style={{ color: 'var(--text-muted)' }}>
            <FileJson className="w-6 h-6 sm:w-8 sm:h-8 opacity-40" />
            <p className="text-xs sm:text-sm text-center px-4">Run a query to see results</p>
          </div>
        ) : (
          <pre
            className="font-mono text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words"
            style={{ color: 'var(--text)' }}
          >
            {formatResult(result)}
          </pre>
        )}
      </div>
    </div>
  );
}
