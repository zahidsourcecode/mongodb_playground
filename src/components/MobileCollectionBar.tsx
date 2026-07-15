import { useDatabase } from '../hooks/useDatabase';

export function MobileCollectionBar() {
  const { counts, collectionNames, selectedCollection, setSelectedCollection, setQuery } = useDatabase();

  return (
    <div
      className="lg:hidden flex gap-2 px-3 py-2 overflow-x-auto shrink-0 border-b"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      {collectionNames.map((name) => (
        <button
          key={name}
          onClick={() => {
            setSelectedCollection(name);
            setQuery(`db.${name}.find({})`);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border whitespace-nowrap shrink-0 transition-colors"
          style={{
            background: selectedCollection === name ? 'var(--primary-light)' : 'var(--code-bg)',
            borderColor: selectedCollection === name ? '#4EBDD3' : 'var(--border)',
            color: selectedCollection === name ? '#4EBDD3' : 'var(--text-muted)',
          }}
        >
          {name}
          <span
            className="px-1.5 py-0.5 rounded-full text-[10px]"
            style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}
          >
            {counts[name] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}
