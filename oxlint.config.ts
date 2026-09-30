import { defineConfig } from 'oxlint';

export default defineConfig({
	plugins: ['typescript', 'unicorn', 'oxc'],

	env: {
		browser: true,
		node: true,
		svelte: true
	},

	ignorePatterns: ['.svelte-kit/**', 'build/**', 'dist/**', 'node_modules/**'],

	categories: {
		correctness: 'error',
		suspicious: 'warn'
	},

	rules: {
		'no-debugger': 'error',
		'no-console': 'warn',

		'typescript/no-explicit-any': 'warn',

		'unicorn/filename-case': 'off'
	}
});
