import typescript from "@rollup/plugin-typescript"
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve"
import terser from '@rollup/plugin-terser';

const production = !process.env.ROLLUP_WATCH

/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
    input: `src/main.ts`,

    output: {
        format: `cjs`,
        name: `code`,
        file: `dist/bundle.js`,
    },

    plugins: [
        typescript(),
        commonjs(),
        resolve({
            browser: true,
        }),
        production && terser()
    ]
}

export default config
