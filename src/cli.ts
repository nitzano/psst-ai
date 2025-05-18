#!/usr/bin/env node

import path from 'node:path';
import process from 'node:process';
import {logger} from './logger.js';

/**
 * Scanner class to handle scanning a directory
 */
class Scanner {
	private readonly logger = logger.getLogger('Scanner');

	/**
	 * Constructor for Scanner
	 * @param pathToScan Path to scan (defaults to current directory)
	 */
	constructor(private readonly pathToScan: string) {
		this.logger.debug(`Scanner initialized with path: ${this.pathToScan}`);
	}

	/**
	 * Run the scanner
	 */
	public async run(): Promise<void> {
		this.logger.debug(`Scanning directory: ${this.pathToScan}`);
		// Future implementation of scanning logic
	}
}

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
