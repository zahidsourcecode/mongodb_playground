import { FindCursor } from './cursor';
import db, { createDbProxy } from './database';
import type { QueryResult } from './types';

export function normalizeResult(result: unknown): QueryResult {
  if (result instanceof FindCursor) {
    return result.toArray();
  }
  if (result === undefined) return null;
  return result as QueryResult;
}

export function executeQuery(query: string): { result: QueryResult; error: string | null } {
  const trimmed = query.trim();
  if (!trimmed) {
    return { result: null, error: 'Please enter a query.' };
  }

  try {
    const dbProxy = createDbProxy(db);
    const fn = new Function('db', `"use strict"; return (${trimmed});`);
    const raw = fn(dbProxy);
    return { result: normalizeResult(raw), error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { result: null, error: message };
  }
}

export function executeStatements(code: string): { result: QueryResult; error: string | null } {
  const trimmed = code.trim();
  if (!trimmed) {
    return { result: null, error: 'Please enter a query.' };
  }

  const statements = trimmed
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('//'));

  if (statements.length === 0) {
    return { result: null, error: 'Please enter a query.' };
  }

  const lastStatement = statements[statements.length - 1];
  return executeQuery(lastStatement);
}
