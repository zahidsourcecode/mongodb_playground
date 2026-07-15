import { Collection } from './collection';
import type { Document } from './types';

type ChangeListener = () => void;

export class InMemoryDB {
  private collections = new Map<string, Document[]>();
  private listeners = new Set<ChangeListener>();

  collection(name: string): Collection {
    if (!this.collections.has(name)) {
      this.collections.set(name, []);
    }
    return new Collection(this, name);
  }

  getDocuments(name: string): Document[] {
    if (!this.collections.has(name)) {
      this.collections.set(name, []);
    }
    return this.collections.get(name)!;
  }

  setDocuments(name: string, docs: Document[]): void {
    this.collections.set(name, docs);
  }

  loadCollections(data: Record<string, Document[]>): void {
    this.collections.clear();
    Object.entries(data).forEach(([name, docs]) => {
      this.collections.set(name, docs.map((d) => ({ ...d })));
    });
    this.notifyChange();
  }

  getCollectionNames(): string[] {
    return Array.from(this.collections.keys());
  }

  getCollectionCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    this.collections.forEach((docs, name) => {
      counts[name] = docs.length;
    });
    return counts;
  }

  subscribe(listener: ChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyChange(): void {
    this.listeners.forEach((l) => l());
  }
}

const db = new InMemoryDB();

export function createDbProxy(dbInstance: InMemoryDB): InMemoryDB & Record<string, Collection> {
  return new Proxy(dbInstance, {
    get(target, prop) {
      if (prop in target || typeof prop === 'symbol') {
        const value = Reflect.get(target, prop);
        return typeof value === 'function' ? value.bind(target) : value;
      }
      if (typeof prop === 'string' && !prop.startsWith('_')) {
        return target.collection(prop);
      }
      return undefined;
    },
  }) as InMemoryDB & Record<string, Collection>;
}

export const dbProxy = createDbProxy(db);
export default db;
