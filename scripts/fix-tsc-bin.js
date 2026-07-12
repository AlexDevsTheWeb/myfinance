import { readlinkSync, existsSync, symlinkSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = resolve(fileURLToPath(import.meta.url), '../../node_modules/.bin');
const tscBin = resolve(dir, 'tsc');
const typescriptBin = resolve(dir, '../typescript/bin/tsc');
const oldBin = resolve(dir, '../@typescript/old/bin/tsc');

if (existsSync(tscBin)) {
  const link = readlinkSync(tscBin);
  if (link !== '../typescript/bin/tsc' && existsSync(typescriptBin)) {
    unlinkSync(tscBin);
    symlinkSync('../typescript/bin/tsc', tscBin);
    console.log('fix-tsc-bin: relinked tsc -> typescript/bin/tsc (TS 7)');
  }
}
