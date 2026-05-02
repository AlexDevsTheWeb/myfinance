import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJsonPath = join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

const version = packageJson.version;
const date = new Date().toISOString();
const commit = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();

const content = `// Auto-generated - do not edit
export const version = '${version}';
export const buildDate = '${date}';
export const commit = '${commit}';
`;

const versionPath = join(__dirname, '..', 'src', 'version.ts');
writeFileSync(versionPath, content);

console.log(`Generated version: ${version} (${commit})`);