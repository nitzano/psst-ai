#!/usr/bin/env node

import path from 'node:path';
import process from 'node:process';
import {Scanner} from './scanners/scanner.js';
import {logger} from './services/logger.js';

// Export types (for programmatic access when installed as dependency)
export type {AiRule, Category} from './types.js';

// Export builders
export {GithubCopilotOutputBuilder} from './builders/github-copilot-output-builder.js';

// Export scanners
export {BaseScanner} from './scanners/base-scanner.js';
export {LintingScanner} from './scanners/linting-scanner.js';
export {NodeVersionScanner} from './scanners/node-version-scanner.js';
export {PackageManagerScanner} from './scanners/package-manager-scanner.js';
export {Scanner} from './scanners/scanner.js';

// Export services
export {logger} from './services/logger.js';

const cliLogger = logger.getLogger('CLI');

/**
 * Main function to handle CLI execution
 */
async function main(): Promise<void> {
	// Get path from CLI arguments or use current directory
	const pathToScan = process.argv[2] ?? process.cwd();
	const absolutePath = path.resolve(pathToScan);

	cliLogger.info(`Starting scan of directory: ${absolutePath}`);

	const scanner = new Scanner(absolutePath);
	const output = await scanner.getOutput();

	// Print the output to the console
	console.log('\n--- 🤫 psst-ai Generated Instructions ---\n');
	console.log(output);
	console.log('\n--- End of Generated Instructions ---\n');

	cliLogger.info('Scan completed');
}

// Run the application
try {
	await main();
	process.exit(0);
} catch (error) {
	cliLogger.error('Error running psst-ai', error);
	process.exit(1);
}
