/** @type {import('xo').Options} */
const xoConfig = {
	// Enable Prettier integration
	prettier: true,
	// Set Node.js environment
	envs: ['node'],
	// Apply XO to TypeScript files
	extensions: ['ts'],
	// Ignore the compiled output
	ignores: ['dist', 'examples'],
	// Configure TypeScript parser and options for TS files
	overrides: [
		{
			files: ['**/*.ts'],
			parser: '@typescript-eslint/parser',
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				project: './tsconfig.json',
			},
			plugins: ['@typescript-eslint'],
			// TypeScript-specific rules
			rules: {
				'@typescript-eslint/consistent-type-assertions': 'warn',
				'@typescript-eslint/no-unsafe-assignment': 'warn',
			},
		},
	],
	// Global rules (applied to both JS and TS)
	rules: {
		'max-depth': ['warn', 4],
	},
};

export default xoConfig;
