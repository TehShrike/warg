import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import typescript from 'rollup-plugin-typescript'

export default {
	input: `./index.ts`,
	output: [{
		format: `esm`,
		file: `./index.mjs`,
	}, {
		format: `cjs`,
		file: `./index.cjs`,
	}],
	plugins: [
		commonjs(),
		resolve({
			browser: true,
			extensions: [ `.js` ],
		}),
		typescript(),
	],
}
