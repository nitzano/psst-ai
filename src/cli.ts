#!/usr/bin/env node

import path from 'node:path';
import process from 'node:process';
import {Scanner} from './scanners/scanner.js';
import {logger} from './services/logger.js';

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
	await scanner.run();

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
