import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import typescript from 'rollup-plugin-typescript'

export default {
	input: `./test.ts`,
	output: {
		format: `cjs`,
	},
	plugins: [
		commonjs(),
		resolve({
			browser: true,
			extensions: [ `.js` ],
		}),
		typescript(),
	],
}
