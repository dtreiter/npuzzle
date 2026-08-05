import * as esbuild from 'esbuild';
import {
  access,
  copyFile,
  cp,
  mkdir,
  rm,
} from 'node:fs/promises';

const isWatch = process.argv.includes('--watch');

async function buildJsCss() {
  if (isWatch) {
    // Use the context API for rebuilding on file save
    const js = await esbuild.context({
      entryPoints: ['src/js/index.ts'],
      outfile: 'dist/bundle.js',
      bundle: true,
      minify: false,
      sourcemap: true,
      jsxFactory: 'm',
      jsxFragment: 'm.Fragment',
    });
    const css = await esbuild.context({
      entryPoints: ['src/css/index.css'],
      outfile: 'dist/bundle.css',
      bundle: true,
      minify: false,
      sourcemap: true,
    });

    await js.watch();
    await css.watch();
    console.log('Watching for changes...');
  } else {
    const js = esbuild.build({
      entryPoints: ['src/js/index.ts'],
      outfile: 'dist/bundle.js',
      bundle: true,
      minify: true,
      sourcemap: true,
      jsxFactory: 'm',
      jsxFragment: 'm.Fragment',
    });
    const css = esbuild.build({
      entryPoints: ['src/css/index.css'],
      outfile: 'dist/bundle.css',
      bundle: true,
      minify: true,
      sourcemap: true,
    });
    await Promise.all([js, css]);
    console.log('Build complete');
  }
}

async function build() {
  // Remove previous build if it exists.
  try {
    await access('dist');
    await rm('dist', {recursive: true});
  } catch {}

  await mkdir('dist');
  await copyFile('src/index.html', 'dist/index.html');

  await buildJsCss();
}

await build();
