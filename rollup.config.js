import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import svelte from 'rollup-plugin-svelte';
import css from 'rollup-plugin-css-only';
import sveltePreprocess from 'svelte-preprocess';

const isProd = process.env.BUILD === 'production';

export default {
  input: 'src/main.ts',
  output: {
    dir: '.',
    sourcemap: 'inline',
    sourcemapExcludeSources: isProd,
    format: 'cjs',
    exports: 'auto',
  },
  external: ['obsidian'],
  plugins: [
    svelte({
      preprocess: sveltePreprocess({ sourceMap: !isProd }),
      compilerOptions: {
        dev: !isProd
      }
    }),
    css({ output: 'styles.css' }),
    typescript({
      sourceMap: true,
      inlineSources: !isProd
    }),
    nodeResolve({
      browser: true,
      dedupe: ['svelte'],
    }),
    commonjs(),
  ],
};
