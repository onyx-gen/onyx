import process from 'node:process'
import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import { getBabelOutputPlugin } from '@rollup/plugin-babel'

const production = !process.env.ROLLUP_WATCH

/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
  input: `src/main.ts`,

  output: {
    format: `cjs`,
    name: `code`,
    file: `dist/code.js`,
  },

  plugins: [
    typescript(),
    commonjs(),
    resolve({
      browser: true,
    }),
    getBabelOutputPlugin({
      presets: ['@babel/preset-env'],
    }),
    production && terser(),
  ],
}

export default config
