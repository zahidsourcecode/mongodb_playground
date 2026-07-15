export type Document = Record<string, unknown>;

export type QueryResult =
  | Document
  | Document[]
  | { acknowledged: boolean; insertedId?: string; insertedIds?: string[] }
  | { acknowledged: boolean; matchedCount: number; modifiedCount: number }
  | { acknowledged: boolean; deletedCount: number }
  | { ok: number; dropped?: string }
  | number
  | string[]
  | null;

export interface AggregationStage {
  [key: string]: unknown;
}
