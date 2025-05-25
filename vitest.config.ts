import {defineConfig} from 'vitest/config';

export default defineConfig({
	test: {
		exclude: [
			'**/node_modules/**',
			'**/dist/**',
			'**/examples/**', // Exclude all example directories since they contain different testing frameworks
		],
		globals: false, // Prefer explicit imports
	},
});
