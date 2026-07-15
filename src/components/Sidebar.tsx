import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Search, X } from 'lucide-react';
import { mongoMethods } from '../data/methodsData';
import { useDatabase } from '../hooks/useDatabase';
import { AddDocumentModal } from './AddDocumentModal';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export function Sidebar({ isOpen, onClose, isMobile }: SidebarProps) {
  const { counts, collectionNames, selectedCollection, setSelectedCollection, setQuery } = useDatabase();
  const [methodsExpanded, setMethodsExpanded] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [methodFilter, setMethodFilter] = useState('');

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const handleCommandClick = (example: string) => {
    setQuery(example);
    if (isMobile) onClose();
  };

  const handleCollectionClick = (name: string) => {
    setSelectedCollection(name);
    setQuery(`db.${name}.find({})`);
    if (isMobile) onClose();
  };

  const filteredMethods = mongoMethods
    .map((cat) => ({
      ...cat,
      commands: cat.commands.filter(
        (cmd) =>
          cmd.name.toLowerCase().includes(methodFilter.toLowerCase()) ||
          cat.category.toLowerCase().includes(methodFilter.toLowerCase()),
      ),
    }))
    .filter((cat) => cat.commands.length > 0);

  return (
    <>
      <aside
        className={[
          'flex flex-col shrink-0 border-r overflow-hidden',
          'fixed lg:static inset-y-0 left-0 z-40',
          'w-[min(20rem,calc(100vw-1rem))] lg:w-72',
          'h-full lg:h-auto',
          'transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        {isMobile && (
          <div
            className="flex items-center justify-between px-4 py-3 border-b lg:hidden"
            style={{ borderColor: 'var(--border)' }}
          >
            <span className="text-sm font-semibold">Menu</span>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:text-primary"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div
          className="p-3 sm:p-4 border-b overflow-y-auto max-h-[40vh] lg:max-h-none shrink-0"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Collections
            </h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-primary text-white hover:opacity-90 transition-opacity"
            >
              <Plus className="w-3 h-3" />
              Add
            </button>
          </div>

          <ul className="space-y-1">
            {collectionNames.map((name) => (
              <li key={name}>
                <button
                  onClick={() => handleCollectionClick(name)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors"
                  style={{
                    background: selectedCollection === name ? 'var(--primary-light)' : 'transparent',
                    color: selectedCollection === name ? '#4EBDD3' : 'var(--text)',
                    borderLeft: selectedCollection === name ? '3px solid #4EBDD3' : '3px solid transparent',
                  }}
                >
                  <span className="font-medium">{name}</span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full"
                    style={{ background: 'var(--code-bg)', color: 'var(--text-muted)' }}
                  >
                    {counts[name] ?? 0}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <button
            onClick={() => setMethodsExpanded((prev) => !prev)}
            className="flex items-center justify-between w-full px-3 sm:px-4 py-3 border-b transition-colors hover:text-primary cursor-pointer shrink-0"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              MongoDB Methods
            </span>
            {methodsExpanded ? (
              <ChevronDown className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
            ) : (
              <ChevronRight className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
            )}
          </button>

          {methodsExpanded && (
            <div className="flex-1 flex flex-col overflow-hidden p-3 sm:p-4 min-h-0">
              <div className="relative mb-3 shrink-0">
                <Search
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  placeholder="Filter methods..."
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border outline-none focus:border-primary transition-colors"
                  style={{ background: 'var(--code-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
                {filteredMethods.map((cat) => (
                  <div key={cat.category} className="border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
                    <button
                      onClick={() => toggleCategory(cat.category)}
                      className="w-full flex items-center gap-2 px-1 py-2 text-sm font-medium transition-colors hover:text-primary cursor-pointer"
                      style={{ color: 'var(--text)' }}
                    >
                      {expandedCategories[cat.category] ? (
                        <ChevronDown className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
                      )}
                      {cat.category}
                    </button>

                    {expandedCategories[cat.category] && (
                      <div className="flex flex-wrap gap-1.5 px-1 pb-2">
                        {cat.commands.map((cmd) => (
                          <button
                            key={cmd.name}
                            onClick={() => handleCommandClick(cmd.example)}
                            title={`${cmd.description}\n\n${cmd.example}`}
                            className="command-pill px-2.5 py-1 text-xs font-mono rounded-md border transition-all hover:border-primary hover:text-primary"
                            style={{ background: 'var(--code-bg)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                          >
                            {cmd.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {showAddModal && <AddDocumentModal onClose={() => setShowAddModal(false)} />}
    </>
  );
}
