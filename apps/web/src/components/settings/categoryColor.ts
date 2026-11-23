/**
 * Deterministic category colour.
 *
 * Categories carry no colour in the data model, so the dot is derived from the
 * name: stable across sessions and devices, and never invents persisted state
 * that a rename would invalidate.
 */
const PALETTE = [
  '#06B6D4', // cyan
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // rose
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#3B82F6', // blue
  '#84CC16', // lime
];

export function categoryColor(name: string): string {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}
