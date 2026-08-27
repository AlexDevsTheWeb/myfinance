/**
 * In-memory Firestore fake for testing Zustand store actions.
 *
 * Supports:
 * - doc(), collection(), withConverter()
 * - setDoc(), updateDoc(), deleteDoc(), getDocs()
 * - writeBatch() with set/update/delete + commit
 * - arrayUnion() (passthrough)
 * - onSnapshot() with immediate callback + listener tracking
 * - runTransaction() callback execution
 */

import type { FirestoreDataConverter, SnapshotOptions } from 'firebase/firestore';

// ── In-memory store ──────────────────────────────────────────────────────────

const store = new Map<string, Record<string, unknown>>();
const listeners = new Map<string, Set<(snap: FakeQuerySnapshot) => void>>();

export function _resetFakeFirestore() {
  store.clear();
  listeners.clear();
}

export function _seedDoc(path: string, docData: Record<string, unknown>) {
  store.set(path, { ...docData });
}

export function _getDocData(path: string): Record<string, unknown> | undefined {
  const d = store.get(path);
  return d ? { ...d } : undefined;
}

// ── Snapshot classes ─────────────────────────────────────────────────────────

class FakeQueryDocumentSnapshot {
  constructor(
    private _raw: Record<string, unknown>,
    public readonly ref: FakeDocumentReference,
    public readonly id: string,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  data(_options?: SnapshotOptions): Record<string, unknown> {
    return { ...this._raw };
  }

  get exists(): boolean {
    return true;
  }
}

class FakeQuerySnapshot {
  readonly metadata = { hasPendingWrites: false, fromCache: false };

  constructor(
    public readonly docs: FakeQueryDocumentSnapshot[],
    public readonly empty: boolean,
  ) {}

  exists(): boolean {
    return this.docs.length > 0;
  }

  data(): Record<string, unknown> | undefined {
    return this.docs[0]?.data();
  }

  forEach(callback: (doc: FakeQueryDocumentSnapshot) => void): void {
    this.docs.forEach(callback);
  }
}

// ── Reference classes ────────────────────────────────────────────────────────

class FakeDocumentReference {
  _converter: FirestoreDataConverter<unknown> | null = null;

  constructor(
    public readonly path: string,
    converter?: FirestoreDataConverter<unknown> | null,
  ) {
    if (converter) this._converter = converter;
  }

  get id(): string {
    return this.path.split('/').pop()!;
  }

  withConverter(converter: FirestoreDataConverter<unknown>): FakeDocumentReference {
    const ref = new FakeDocumentReference(this.path);
    ref._converter = converter;
    return ref;
  }

  onSnapshot(
    callback: (snap: FakeQuerySnapshot) => void,
  ): () => void {
    if (!listeners.has(this.path)) listeners.set(this.path, new Set());
    listeners.get(this.path)!.add(callback);

    // Emit current state immediately
    const docData = store.get(this.path);
    const snap = docData
      ? new FakeQuerySnapshot(
          [new FakeQueryDocumentSnapshot(docData, this, this.id)],
          false,
        )
      : new FakeQuerySnapshot([], true);
    callback(snap);

    return () => { listeners.get(this.path)?.delete(callback); };
  }
}

class FakeCollectionReference {
  _converter: FirestoreDataConverter<unknown> | null = null;

  constructor(public readonly path: string) {}

  withConverter(converter: FirestoreDataConverter<unknown>): FakeCollectionReference {
    const ref = new FakeCollectionReference(this.path);
    ref._converter = converter;
    return ref;
  }

  doc(id: string): FakeDocumentReference {
    return new FakeDocumentReference(`${this.path}/${id}`, this._converter);
  }

  get id(): string {
    return this.path.split('/').pop()!;
  }

  onSnapshot(
    callback: (snap: FakeQuerySnapshot) => void,
  ): () => void {
    if (!listeners.has(this.path)) listeners.set(this.path, new Set());
    listeners.get(this.path)!.add(callback);

    const docs = _getCollectionDocs(this.path);
    callback(new FakeQuerySnapshot(docs, docs.length === 0));

    return () => { listeners.get(this.path)?.delete(callback); };
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function _getCollectionDocs(collPath: string): FakeQueryDocumentSnapshot[] {
  const prefix = collPath + '/';
  const docs: FakeQueryDocumentSnapshot[] = [];
  for (const [path, docData] of store) {
    if (path.startsWith(prefix) && !path.slice(prefix.length).includes('/')) {
      const id = path.split('/').pop()!;
      docs.push(new FakeQueryDocumentSnapshot(docData, new FakeDocumentReference(path), id));
    }
  }
  return docs;
}

function _applyConverter(
  ref: FakeDocumentReference | FakeCollectionReference,
  data: Record<string, unknown>,
): Record<string, unknown> {
  const converter = (ref as { _converter: FirestoreDataConverter<unknown> | null })._converter;
  if (converter) {
    return converter.toFirestore(data as never) as Record<string, unknown>;
  }
  return data;
}

function _cleanUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

function _notifyAll() {
  for (const [path, cbs] of listeners) {
    const isCollection = path.split('/').length % 2 === 0;
    if (isCollection) {
      const docs = _getCollectionDocs(path);
      const snap = new FakeQuerySnapshot(docs, docs.length === 0);
      for (const cb of cbs) cb(snap);
    } else {
      const docData = store.get(path);
      const id = path.split('/').pop()!;
      const snap = docData
        ? new FakeQuerySnapshot(
            [new FakeQueryDocumentSnapshot(docData, new FakeDocumentReference(path), id)],
            false,
          )
        : new FakeQuerySnapshot([], true);
      for (const cb of cbs) cb(snap);
    }
  }
}

// ── WriteBatch ───────────────────────────────────────────────────────────────

interface BatchOp {
  type: 'set' | 'update' | 'delete';
  ref: FakeDocumentReference;
  data?: Record<string, unknown>;
}

class FakeWriteBatch {
  private ops: BatchOp[] = [];

  set(ref: FakeDocumentReference, data: Record<string, unknown>): this {
    this.ops.push({ type: 'set', ref, data });
    return this;
  }

  update(ref: FakeDocumentReference, fields: Record<string, unknown>): this {
    this.ops.push({ type: 'update', ref, data: fields });
    return this;
  }

  delete(ref: FakeDocumentReference): this {
    this.ops.push({ type: 'delete', ref });
    return this;
  }

  async commit(): Promise<void> {
    for (const op of this.ops) {
      const path = op.ref.path;
      if (op.type === 'set') {
        const cleaned = _cleanUndefined(_applyConverter(op.ref, op.data!));
        const existing = store.get(path) || {};
        store.set(path, { ...existing, ...cleaned });
      } else if (op.type === 'update') {
        const existing = store.get(path) || {};
        const merged = { ...existing };
        for (const [k, v] of Object.entries(op.data!)) {
          if (v !== undefined) merged[k] = v;
        }
        store.set(path, merged);
      } else {
        store.delete(path);
      }
    }
    this.ops = [];
    _notifyAll();
  }
}

// ── Transaction ──────────────────────────────────────────────────────────────

class FakeTransactionDocumentSnapshot {
  constructor(
    private _data: Record<string, unknown> | null,
    public readonly ref: FakeDocumentReference,
    public readonly id: string,
  ) {}

  exists(): boolean {
    return this._data !== null;
  }

  data(): Record<string, unknown> | undefined {
    return this._data ? { ...this._data } : undefined;
  }
}

class FakeTransaction {
  async get(ref: FakeDocumentReference): Promise<FakeTransactionDocumentSnapshot> {
    const docData = store.get(ref.path);
    return new FakeTransactionDocumentSnapshot(docData ?? null, ref, ref.id);
  }

  set(ref: FakeDocumentReference, docData: Record<string, unknown>): void {
    const cleaned = _cleanUndefined(_applyConverter(ref, docData));
    store.set(ref.path, cleaned);
  }

  update(ref: FakeDocumentReference, fields: Record<string, unknown>): void {
    const existing = store.get(ref.path) || {};
    const merged = { ...existing };
    for (const [k, v] of Object.entries(fields)) {
      if (v !== undefined) merged[k] = v;
    }
    store.set(ref.path, merged);
  }

  delete(ref: FakeDocumentReference): void {
    store.delete(ref.path);
  }
}

// ── Firestore fake class ─────────────────────────────────────────────────────

class FakeFirestore {
  get _app() { return {} as never; }
}

// ── Exported API (mirrors firebase/firestore) ────────────────────────────────

export function doc(
  pathOrRef: FakeDocumentReference | FakeCollectionReference | FakeFirestore,
  ...segments: string[]
): FakeDocumentReference {
  let path: string;
  let converter: FirestoreDataConverter<unknown> | null | undefined;
  if (pathOrRef instanceof FakeDocumentReference || pathOrRef instanceof FakeCollectionReference) {
    path = pathOrRef.path + '/' + segments.join('/');
    converter = (pathOrRef as { _converter: FirestoreDataConverter<unknown> | null })._converter;
  } else {
    path = segments.join('/');
  }
  return new FakeDocumentReference(path, converter ?? null);
}

export function collection(
  pathOrRef: FakeDocumentReference | FakeFirestore,
  ...segments: string[]
): FakeCollectionReference {
  let path: string;
  if (pathOrRef instanceof FakeDocumentReference) {
    path = pathOrRef.path + '/' + segments.join('/');
  } else {
    path = segments.join('/');
  }
  return new FakeCollectionReference(path);
}

export async function setDoc(
  ref: FakeDocumentReference,
  docData: Record<string, unknown>,
): Promise<void> {
  const cleaned = _cleanUndefined(_applyConverter(ref, docData));
  const existing = store.get(ref.path) || {};
  store.set(ref.path, { ...existing, ...cleaned });
  _notifyAll();
}

export async function updateDoc(
  ref: FakeDocumentReference,
  fields: Record<string, unknown>,
): Promise<void> {
  const existing = store.get(ref.path) || {};
  const merged = { ...existing };
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined) merged[k] = v;
  }
  store.set(ref.path, merged);
  _notifyAll();
}

export async function deleteDoc(ref: FakeDocumentReference): Promise<void> {
  store.delete(ref.path);
  _notifyAll();
}

export async function getDocs(
  collRef: FakeCollectionReference,
): Promise<FakeQuerySnapshot> {
  const docs = _getCollectionDocs(collRef.path);
  return new FakeQuerySnapshot(docs, docs.length === 0);
}

export function writeBatch(): FakeWriteBatch {
  return new FakeWriteBatch();
}

export function arrayUnion(...items: unknown[]): unknown[] {
  return items;
}

export async function runTransaction(
  _firestore: FakeFirestore,
  fn: (transaction: FakeTransaction) => Promise<void>,
): Promise<void> {
  await fn(new FakeTransaction());
}

export { FakeWriteBatch };

// ── Standalone onSnapshot (matches firebase/firestore API) ───────────────────

export function onSnapshotOrQuery(
  refOrQuery: FakeDocumentReference | FakeCollectionReference,
  callback: (snap: FakeQuerySnapshot) => void,
): () => void {
  return refOrQuery.onSnapshot(callback);
}

// ── Singleton db ─────────────────────────────────────────────────────────────

const fakeDb = new FakeFirestore();
export { fakeDb as db };
