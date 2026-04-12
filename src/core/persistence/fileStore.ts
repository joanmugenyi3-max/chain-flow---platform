import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src', 'data', 'tenants');

function getFilePath(collection: string, tenantId: string): string {
  const dir = path.join(DATA_DIR, tenantId);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, `${collection}.json`);
}

export function readCollection<T>(collection: string, tenantId: string): T[] {
  const fp = getFilePath(collection, tenantId);
  if (!fs.existsSync(fp)) return [];
  try {
    return JSON.parse(fs.readFileSync(fp, 'utf-8')) as T[];
  } catch {
    return [];
  }
}

export function writeCollection<T>(collection: string, tenantId: string, data: T[]): void {
  const fp = getFilePath(collection, tenantId);
  fs.writeFileSync(fp, JSON.stringify(data, null, 2), 'utf-8');
}

export function findById<T extends { id: string }>(
  collection: string, tenantId: string, id: string
): T | null {
  const items = readCollection<T>(collection, tenantId);
  return items.find(i => i.id === id) ?? null;
}

export function upsertItem<T extends { id: string }>(
  collection: string, tenantId: string, item: T
): T {
  const items = readCollection<T>(collection, tenantId);
  const idx = items.findIndex(i => i.id === item.id);
  if (idx >= 0) items[idx] = item; else items.push(item);
  writeCollection(collection, tenantId, items);
  return item;
}

export function removeItem(collection: string, tenantId: string, id: string): void {
  const items = readCollection<{ id: string }>(collection, tenantId);
  writeCollection(collection, tenantId, items.filter(i => i.id !== id));
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
