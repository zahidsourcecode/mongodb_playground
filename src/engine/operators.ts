import type { Document } from './types';

function getNestedValue(doc: Document, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Document)) {
      return (acc as Document)[key];
    }
    return undefined;
  }, doc);
}

function compareValues(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b));
}

function matchesOperator(fieldValue: unknown, operator: unknown): boolean {
  if (operator === null || typeof operator !== 'object' || Array.isArray(operator)) {
    return false;
  }

  const ops = operator as Record<string, unknown>;

  if ('$eq' in ops) return fieldValue === ops.$eq;
  if ('$ne' in ops) return fieldValue !== ops.$ne;
  if ('$gt' in ops) return compareValues(fieldValue, ops.$gt) > 0;
  if ('$gte' in ops) return compareValues(fieldValue, ops.$gte) >= 0;
  if ('$lt' in ops) return compareValues(fieldValue, ops.$lt) < 0;
  if ('$lte' in ops) return compareValues(fieldValue, ops.$lte) <= 0;
  if ('$in' in ops) return Array.isArray(ops.$in) && ops.$in.includes(fieldValue);
  if ('$nin' in ops) return Array.isArray(ops.$nin) && !ops.$nin.includes(fieldValue);
  if ('$exists' in ops) return ops.$exists ? fieldValue !== undefined : fieldValue === undefined;
  if ('$regex' in ops) {
    const pattern = ops.$regex;
    const flags = typeof ops.$options === 'string' ? ops.$options : '';
    if (pattern instanceof RegExp) return pattern.test(String(fieldValue ?? ''));
    return new RegExp(String(pattern), flags).test(String(fieldValue ?? ''));
  }
  if ('$type' in ops) {
    const expected = ops.$type;
    if (expected === 'number') return typeof fieldValue === 'number';
    if (expected === 'string') return typeof fieldValue === 'string';
    if (expected === 'boolean') return typeof fieldValue === 'boolean';
    if (expected === 'array') return Array.isArray(fieldValue);
    if (expected === 'object') return typeof fieldValue === 'object' && fieldValue !== null && !Array.isArray(fieldValue);
  }
  if ('$not' in ops) return !matchesOperator(fieldValue, ops.$not);
  if ('$all' in ops) {
    return Array.isArray(fieldValue) && Array.isArray(ops.$all) && ops.$all.every((v) => fieldValue.includes(v));
  }
  if ('$size' in ops) return Array.isArray(fieldValue) && fieldValue.length === ops.$size;
  if ('$elemMatch' in ops) {
    if (!Array.isArray(fieldValue)) return false;
    return fieldValue.some((item) => {
      if (item !== null && typeof item === 'object') {
        return matchFilter(item as Document, ops.$elemMatch as Document);
      }
      return matchesPrimitiveOperator(item, ops.$elemMatch as Document);
    });
  }

  return false;
}

function matchesPrimitiveOperator(value: unknown, filter: Document): boolean {
  const entries = Object.entries(filter);
  if (entries.length !== 1) return false;
  const [op, expected] = entries[0];
  switch (op) {
    case '$gt':
      return compareValues(value, expected) > 0;
    case '$gte':
      return compareValues(value, expected) >= 0;
    case '$lt':
      return compareValues(value, expected) < 0;
    case '$lte':
      return compareValues(value, expected) <= 0;
    case '$eq':
      return value === expected;
    case '$ne':
      return value !== expected;
    default:
      return false;
  }
}

export function matchFilter(doc: Document, filter: Document): boolean {
  if (!filter || Object.keys(filter).length === 0) return true;

  if ('$and' in filter && Array.isArray(filter.$and)) {
    return filter.$and.every((sub) => matchFilter(doc, sub as Document));
  }
  if ('$or' in filter && Array.isArray(filter.$or)) {
    return filter.$or.some((sub) => matchFilter(doc, sub as Document));
  }
  if ('$nor' in filter && Array.isArray(filter.$nor)) {
    return !filter.$nor.some((sub) => matchFilter(doc, sub as Document));
  }
  if ('$expr' in filter) {
    return evaluateExpr(doc, filter.$expr as Document);
  }

  return Object.entries(filter).every(([key, value]) => {
    if (key.startsWith('$')) return true;
    const fieldValue = getNestedValue(doc, key);
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      const obj = value as Record<string, unknown>;
      const hasOperator = Object.keys(obj).some((k) => k.startsWith('$'));
      if (hasOperator) return matchesOperator(fieldValue, value);
    }
    if (Array.isArray(value)) return Array.isArray(fieldValue) && JSON.stringify(fieldValue) === JSON.stringify(value);
    return fieldValue === value;
  });
}

function evaluateExpr(doc: Document, expr: Document): boolean {
  const entries = Object.entries(expr);
  if (entries.length === 0) return true;
  const [op, args] = entries[0];
  if (!Array.isArray(args)) return false;

  const resolved = args.map((arg) => resolveExprValue(doc, arg));

  switch (op) {
    case '$gt':
      return compareValues(resolved[0], resolved[1]) > 0;
    case '$gte':
      return compareValues(resolved[0], resolved[1]) >= 0;
    case '$lt':
      return compareValues(resolved[0], resolved[1]) < 0;
    case '$lte':
      return compareValues(resolved[0], resolved[1]) <= 0;
    case '$eq':
      return resolved[0] === resolved[1];
    case '$ne':
      return resolved[0] !== resolved[1];
    default:
      return false;
  }
}

function resolveExprValue(doc: Document, value: unknown): unknown {
  if (typeof value === 'string' && value.startsWith('$')) {
    return getNestedValue(doc, value.slice(1));
  }
  return value;
}

export function applyUpdate(doc: Document, update: Document): Document {
  const result = { ...doc };

  if ('$set' in update && typeof update.$set === 'object' && update.$set) {
    Object.entries(update.$set as Document).forEach(([key, value]) => {
      setNestedValue(result, key, value);
    });
  }
  if ('$unset' in update && typeof update.$unset === 'object' && update.$unset) {
    Object.keys(update.$unset as Document).forEach((key) => {
      deleteNestedValue(result, key);
    });
  }
  if ('$inc' in update && typeof update.$inc === 'object' && update.$inc) {
    Object.entries(update.$inc as Document).forEach(([key, value]) => {
      const current = getNestedValue(result, key);
      const num = typeof current === 'number' ? current : 0;
      const inc = typeof value === 'number' ? value : 0;
      setNestedValue(result, key, num + inc);
    });
  }

  return result;
}

function setNestedValue(obj: Document, path: string, value: unknown): void {
  const keys = path.split('.');
  let current: Document = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
      current[key] = {};
    }
    current = current[key] as Document;
  }
  current[keys[keys.length - 1]] = value;
}

function deleteNestedValue(obj: Document, path: string): void {
  const keys = path.split('.');
  let current: Document = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') return;
    current = current[key] as Document;
  }
  delete current[keys[keys.length - 1]];
}
