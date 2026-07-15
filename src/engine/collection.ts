import { FindCursor } from './cursor';
import { applyUpdate, matchFilter } from './operators';
import type { AggregationStage, Document, QueryResult } from './types';
import type { InMemoryDB } from './database';

function generateId(): string {
  return crypto.randomUUID();
}

function ensureId(doc: Document): Document {
  if (!doc._id) return { _id: generateId(), ...doc };
  return { ...doc };
}

export class Collection {
  private db: InMemoryDB;
  private name: string;

  constructor(db: InMemoryDB, name: string) {
    this.db = db;
    this.name = name;
  }

  private get docs(): Document[] {
    return this.db.getDocuments(this.name);
  }

  insertOne(doc: Document): QueryResult {
    const document = ensureId(doc);
    this.docs.push(document);
    this.db.notifyChange();
    return { acknowledged: true, insertedId: String(document._id) };
  }

  insertMany(docs: Document[]): QueryResult {
    const insertedIds = docs.map((doc) => {
      const document = ensureId(doc);
      this.docs.push(document);
      return String(document._id);
    });
    this.db.notifyChange();
    return { acknowledged: true, insertedIds };
  }

  find(filter: Document = {}): FindCursor {
    const matched = this.docs.filter((doc) => matchFilter(doc, filter));
    return new FindCursor(matched);
  }

  findOne(filter: Document = {}): Document | null {
    return this.docs.find((doc) => matchFilter(doc, filter)) ?? null;
  }

  updateOne(filter: Document, update: Document): QueryResult {
    const index = this.docs.findIndex((doc) => matchFilter(doc, filter));
    if (index === -1) return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
    this.docs[index] = applyUpdate(this.docs[index], update);
    this.db.notifyChange();
    return { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
  }

  updateMany(filter: Document, update: Document): QueryResult {
    let modifiedCount = 0;
    this.docs.forEach((doc, index) => {
      if (matchFilter(doc, filter)) {
        this.docs[index] = applyUpdate(doc, update);
        modifiedCount++;
      }
    });
    if (modifiedCount > 0) this.db.notifyChange();
    return { acknowledged: true, matchedCount: modifiedCount, modifiedCount };
  }

  deleteOne(filter: Document): QueryResult {
    const index = this.docs.findIndex((doc) => matchFilter(doc, filter));
    if (index === -1) return { acknowledged: true, deletedCount: 0 };
    this.docs.splice(index, 1);
    this.db.notifyChange();
    return { acknowledged: true, deletedCount: 1 };
  }

  deleteMany(filter: Document = {}): QueryResult {
    const before = this.docs.length;
    const remaining = this.docs.filter((doc) => !matchFilter(doc, filter));
    this.db.setDocuments(this.name, remaining);
    const deletedCount = before - remaining.length;
    if (deletedCount > 0) this.db.notifyChange();
    return { acknowledged: true, deletedCount };
  }

  countDocuments(filter: Document = {}): number {
    return this.docs.filter((doc) => matchFilter(doc, filter)).length;
  }

  drop(): QueryResult {
    this.db.setDocuments(this.name, []);
    this.db.notifyChange();
    return { ok: 1, dropped: this.name };
  }

  aggregate(pipeline: AggregationStage[]): Document[] {
    let results: Document[] = [...this.docs];

    for (const stage of pipeline) {
      if ('$match' in stage) {
        const filter = stage.$match as Document;
        results = results.filter((doc) => matchFilter(doc, filter));
      } else if ('$project' in stage) {
        const projection = stage.$project as Record<string, 0 | 1>;
        results = results.map((doc) => projectDocument(doc, projection));
      } else if ('$group' in stage) {
        results = groupDocuments(results, stage.$group as Document);
      } else if ('$sort' in stage) {
        const sortSpec = stage.$sort as Record<string, 1 | -1>;
        results = new FindCursor(results).sort(sortSpec).toArray();
      } else if ('$limit' in stage) {
        results = results.slice(0, stage.$limit as number);
      } else if ('$skip' in stage) {
        results = results.slice(stage.$skip as number);
      } else if ('$unwind' in stage) {
        const field = (stage.$unwind as string).replace(/^\$/, '');
        results = results.flatMap((doc) => {
          const value = doc[field];
          if (!Array.isArray(value)) return [];
          return value.map((item) => ({ ...doc, [field]: item }));
        });
      } else if ('$lookup' in stage) {
        const lookup = stage.$lookup as {
          from: string;
          localField: string;
          foreignField: string;
          as: string;
        };
        const foreignDocs = this.db.getDocuments(lookup.from);
        results = results.map((doc) => ({
          ...doc,
          [lookup.as]: foreignDocs.filter((f) => f[lookup.foreignField] === doc[lookup.localField]),
        }));
      } else if ('$sample' in stage) {
        const size = stage.$sample as { size: number };
        const shuffled = [...results].sort(() => Math.random() - 0.5);
        results = shuffled.slice(0, size.size);
      } else if ('$replaceRoot' in stage) {
        const newRoot = (stage.$replaceRoot as { newRoot: string | Document }).newRoot;
        results = results.map((doc) => {
          if (typeof newRoot === 'string' && newRoot.startsWith('$')) {
            const value = doc[newRoot.slice(1)];
            return typeof value === 'object' && value !== null ? (value as Document) : doc;
          }
          return newRoot as Document;
        });
      } else if ('$facet' in stage) {
        const facets = stage.$facet as Record<string, AggregationStage[]>;
        return [
          Object.fromEntries(
            Object.entries(facets).map(([name, subPipeline]) => [
              name,
              this.aggregate([{ $match: {} }, ...subPipeline]),
            ]),
          ),
        ];
      }
    }

    return results;
  }
}

function projectDocument(doc: Document, projection: Record<string, 0 | 1>): Document {
  const hasInclusion = Object.values(projection).some((v) => v === 1);

  if (hasInclusion) {
    const result: Document = {};
    Object.entries(projection).forEach(([key, val]) => {
      if (val === 1 && key in doc) result[key] = doc[key];
    });
    if (projection._id !== 0 && '_id' in doc) result._id = doc._id;
    return result;
  }

  const result = { ...doc };
  Object.entries(projection).forEach(([key, val]) => {
    if (val === 0) delete result[key];
  });
  return result;
}

function groupDocuments(docs: Document[], groupSpec: Document): Document[] {
  const idSpec = groupSpec._id;
  const groups = new Map<string, Document[]>();

  docs.forEach((doc) => {
    let key: string;
    if (idSpec === null) key = 'all';
    else if (typeof idSpec === 'string' && idSpec.startsWith('$')) {
      key = String(doc[idSpec.slice(1)] ?? 'null');
    } else {
      key = JSON.stringify(idSpec);
    }
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(doc);
  });

  return Array.from(groups.entries()).map(([key, groupDocs]) => {
    const result: Document = {
      _id: idSpec === null ? null : key === 'null' ? null : tryParseKey(key, idSpec),
    };

    Object.entries(groupSpec).forEach(([field, expr]) => {
      if (field === '_id') return;
      result[field] = evaluateAccumulator(groupDocs, expr as Document);
    });

    return result;
  });
}

function tryParseKey(key: string, idSpec: unknown): unknown {
  if (idSpec === null) return null;
  if (typeof idSpec === 'string' && idSpec.startsWith('$')) {
    const num = Number(key);
    return Number.isNaN(num) ? key : num;
  }
  try {
    return JSON.parse(key);
  } catch {
    return key;
  }
}

function evaluateAccumulator(docs: Document[], expr: Document): unknown {
  const entries = Object.entries(expr);
  if (entries.length === 0) return null;
  const [op, arg] = entries[0];

  const values = typeof arg === 'string' && arg.startsWith('$')
    ? docs.map((d) => d[arg.slice(1)]).filter((v) => typeof v === 'number') as number[]
    : [];

  switch (op) {
    case '$sum':
      return arg === 1 ? docs.length : values.reduce((a, b) => a + b, 0);
    case '$avg':
      return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    case '$min':
      return values.length ? Math.min(...values) : null;
    case '$max':
      return values.length ? Math.max(...values) : null;
    default:
      return null;
  }
}
