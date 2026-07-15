import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import db from '../engine/database';
import { executeStatements } from '../engine/queryExecutor';
import type { Document, QueryResult } from '../engine/types';

interface DatabaseContextValue {
  loading: boolean;
  counts: Record<string, number>;
  collectionNames: string[];
  selectedCollection: string;
  setSelectedCollection: (name: string) => void;
  query: string;
  setQuery: (q: string) => void;
  result: QueryResult | null;
  error: string | null;
  runQuery: () => void;
  resetData: () => Promise<void>;
  addDocument: (collection: string, doc: Document) => void;
  addManyDocuments: (collection: string, docs: Document[]) => void;
}

const DatabaseContext = createContext<DatabaseContextValue | null>(null);

async function fetchSeedData(): Promise<Record<string, Document[]>> {
  const collections = ['users', 'products', 'orders'];
  const entries = await Promise.all(
    collections.map(async (name) => {
      const res = await fetch(`/data/${name}.json`);
      const data = (await res.json()) as Document[];
      return [name, data] as const;
    }),
  );
  return Object.fromEntries(entries);
}

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [selectedCollection, setSelectedCollection] = useState('users');
  const [query, setQuery] = useState('db.users.find({ age: { $gt: 25 } })');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [seedData, setSeedData] = useState<Record<string, Document[]> | null>(null);

  const refreshCounts = useCallback(() => {
    setCounts({ ...db.getCollectionCounts() });
  }, []);

  const loadSeed = useCallback(async () => {
    const data = seedData ?? (await fetchSeedData());
    if (!seedData) setSeedData(data);
    db.loadCollections(data);
    refreshCounts();
  }, [seedData, refreshCounts]);

  useEffect(() => {
    loadSeed().finally(() => {
      setLoading(false);
      const { result: res, error: err } = executeStatements('db.users.find({ age: { $gt: 25 } })');
      setResult(res);
      setError(err);
    });
  }, [loadSeed]);

  useEffect(() => {
    return db.subscribe(refreshCounts);
  }, [refreshCounts]);

  const runQuery = useCallback(() => {
    const { result: res, error: err } = executeStatements(query);
    setResult(res);
    setError(err);
    refreshCounts();
  }, [query, refreshCounts]);

  const resetData = useCallback(async () => {
    const data = await fetchSeedData();
    setSeedData(data);
    db.loadCollections(data);
    setResult(null);
    setError(null);
    refreshCounts();
  }, [refreshCounts]);

  const addDocument = useCallback(
    (collection: string, doc: Document) => {
      db.collection(collection).insertOne(doc);
      refreshCounts();
    },
    [refreshCounts],
  );

  const addManyDocuments = useCallback(
    (collection: string, docs: Document[]) => {
      db.collection(collection).insertMany(docs);
      refreshCounts();
    },
    [refreshCounts],
  );

  const collectionNames = useMemo(() => db.getCollectionNames(), [counts]);

  const value: DatabaseContextValue = {
    loading,
    counts,
    collectionNames,
    selectedCollection,
    setSelectedCollection,
    query,
    setQuery,
    result,
    error,
    runQuery,
    resetData,
    addDocument,
    addManyDocuments,
  };

  return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
}

export function useDatabase() {
  const ctx = useContext(DatabaseContext);
  if (!ctx) throw new Error('useDatabase must be used within DatabaseProvider');
  return ctx;
}
