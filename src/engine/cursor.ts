import type { Document } from './types';

export class FindCursor {
  private docs: Document[];

  constructor(docs: Document[]) {
    this.docs = [...docs];
  }

  sort(spec: Record<string, 1 | -1> = {}): FindCursor {
    const entries = Object.entries(spec);
    if (entries.length === 0) return this;

    this.docs.sort((a, b) => {
      for (const [field, direction] of entries) {
        const aVal = a[field];
        const bVal = b[field];
        if (aVal === bVal) continue;
        const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        return direction === -1 ? -cmp : cmp;
      }
      return 0;
    });
    return this;
  }

  limit(n: number): FindCursor {
    this.docs = this.docs.slice(0, n);
    return this;
  }

  skip(n: number): FindCursor {
    this.docs = this.docs.slice(n);
    return this;
  }

  toArray(): Document[] {
    return [...this.docs];
  }

  [Symbol.iterator](): Iterator<Document> {
    return this.docs[Symbol.iterator]();
  }
}
