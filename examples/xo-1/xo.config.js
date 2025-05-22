/**
 * XO configuration file
 * @see https://github.com/xojs/xo#config
 */
module.exports = {
	// Use 2 spaces for indentation
	space: 2,
	
	// Use semicolons
	semicolon: true,
	
	// Enable TypeScript support
	typescript: true,
	
	// Environments
	envs: [
		'node',
		'browser'
	],
	
	// Rules overrides
	rules: {
		// Disable some rules that might be too strict
		'unicorn/no-null': 'off',
		'unicorn/prevent-abbreviations': 'off',
		'import/no-anonymous-default-export': 'off',
		// Add any custom rules here
	},
	
	// Files to ignore
	ignores: [
		'dist',
		'node_modules',
		'coverage'
	]
}
