import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const contentEntry = fileURLToPath(new URL('../src/content.ts', import.meta.url));
const injectedEntry = fileURLToPath(new URL('../src/capture/injected.ts', import.meta.url));
const popupEntry = fileURLToPath(new URL('../src/ui/popup.ts', import.meta.url));

function createBuildConfig({ entry, name, outFile, emptyOutDir }) {
  return {
    configFile: false,
    build: {
      outDir: 'dist',
      emptyOutDir,
      target: 'es2020',
      watch: process.env.VITE_WATCH ? {} : null,
      lib: {
        entry,
        name,
        formats: ['iife'],
        fileName: () => outFile,
      },
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            if (assetInfo.name && assetInfo.name.endsWith('.css')) {
              return 'content.bundle.css';
            }
            return 'assets/[name]-[hash][extname]';
          },
        },
      },
    },
  };
}

export async function runViteBuild() {
  await build(
    createBuildConfig({
      entry: contentEntry,
      name: 'UmpInspectorContent',
      outFile: 'content.bundle.js',
      emptyOutDir: true,
    })
  );

  await build(
    createBuildConfig({
      entry: injectedEntry,
      name: 'UmpInspectorInjected',
      outFile: 'injected.bundle.js',
      emptyOutDir: false,
    })
  );

  await build(
    createBuildConfig({
      entry: popupEntry,
      name: 'UmpInspectorPopup',
      outFile: 'popup.bundle.js',
      emptyOutDir: false,
    })
  );
}

await runViteBuild();