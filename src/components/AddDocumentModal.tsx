import { useState } from 'react';
import { X } from 'lucide-react';
import { useDatabase } from '../hooks/useDatabase';
import type { Document } from '../engine/types';

interface AddDocumentModalProps {
  onClose: () => void;
}

export function AddDocumentModal({ onClose }: AddDocumentModalProps) {
  const { collectionNames, selectedCollection, addDocument, addManyDocuments } = useDatabase();
  const [collection, setCollection] = useState(selectedCollection);
  const [mode, setMode] = useState<'form' | 'json'>('json');
  const [jsonInput, setJsonInput] = useState('{\n  "name": "New User",\n  "age": 25,\n  "role": "developer"\n}');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    setError(null);
    try {
      const parsed = JSON.parse(jsonInput) as Document | Document[];
      if (Array.isArray(parsed)) {
        addManyDocuments(collection, parsed);
      } else {
        addDocument(collection, parsed);
      }
      onClose();
    } catch {
      setError('Invalid JSON. Please check your syntax.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div
        className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-xl border shadow-2xl max-h-[90dvh] flex flex-col"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-base font-semibold">Add Document</h2>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Collection
            </label>
            <select
              value={collection}
              onChange={(e) => setCollection(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:border-primary"
              style={{ background: 'var(--code-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              {collectionNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            {(['json', 'form'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="px-3 py-1 text-xs rounded-md border transition-colors"
                style={{
                  background: mode === m ? 'var(--primary-light)' : 'transparent',
                  borderColor: mode === m ? '#4EBDD3' : 'var(--border)',
                  color: mode === m ? '#4EBDD3' : 'var(--text-muted)',
                }}
              >
                {m === 'json' ? 'JSON' : 'Form'}
              </button>
            ))}
          </div>

          {mode === 'json' ? (
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Document JSON (object or array)
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 text-sm font-mono rounded-lg border outline-none focus:border-primary resize-none"
                style={{ background: 'var(--code-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Use JSON mode to paste a document. Form mode coming soon — switch to JSON tab above.
            </p>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 px-4 sm:px-5 py-4 border-t shrink-0" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:opacity-90 transition-opacity"
          >
            Add Document
          </button>
        </div>
      </div>
    </div>
  );
}
