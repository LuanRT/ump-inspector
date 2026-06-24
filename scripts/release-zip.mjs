import { execSync } from 'node:child_process';
import { createWriteStream, existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';
import { fileURLToPath } from 'node:url';
import { ZipArchive } from 'archiver';

const rootDir = cwd();
const packageJsonPath = fileURLToPath(new URL('../package.json', import.meta.url));
const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

const releasesDir = join(rootDir, 'releases');
const zipName = `ump-inspector-v${pkg.version}.zip`;
const zipPath = join(releasesDir, zipName);

if (!existsSync(releasesDir)) {
  mkdirSync(releasesDir, { recursive: true });
}

if (existsSync(zipPath)) {
  rmSync(zipPath);
}

execSync('npm run build', { stdio: 'inherit' });

async function createZip() {
  const output = createWriteStream(zipPath);
  const archive = new ZipArchive({ zlib: { level: 9 } });

  const finalized = new Promise((resolve, reject) => {
    output.on('close', resolve);
    output.on('error', reject);
  });

  archive.on('warning', (error) => {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  });

  archive.on('error', (error) => {
    throw error;
  });

  archive.pipe(output);
  archive.file('popup.html', { name: 'popup.html' });
  archive.file('manifest.json', { name: 'manifest.json' });
  archive.directory('dist', 'dist');
  archive.directory('icons', 'icons');
  archive.file('LICENSE', { name: 'LICENSE' });
  archive.file('README.md', { name: 'README.md' });

  await archive.finalize();
  await finalized;
}

await createZip();

console.log(`Created ${zipPath}`);
