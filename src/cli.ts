#!/usr/bin/env node

import path from 'node:path';
import process from 'node:process';
import {Scanner} from './scanners/scanner.js';

/**
 * Main function to handle CLI execution
 */
async function main(): Promise<void> {
	// Get path from CLI arguments or use current directory
	const pathToScan = process.argv[2] ?? process.cwd();
	const absolutePath = path.resolve(pathToScan);

	const scanner = new Scanner(absolutePath);
	await scanner.run();
}

// Run the application
try {
	await main();
} catch (error: unknown) {
	console.error('Error running application:', error);
	process.exit(1);
}
