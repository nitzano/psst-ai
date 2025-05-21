#!/usr/bin/env node

import path from 'node:path';
import process from 'node:process';
import {Command} from 'commander';
import {CodebaseScanner} from './scanners/codebase-scanner.js';
import {logger} from './services/logger.js';
import {packageInfo} from './services/package-info.js';

// Export types (for programmatic access when installed as dependency)
export type {AiRule, Category} from './types.js';

// Export builders
export {GithubCopilotOutputBuilder} from './builders/github-copilot-output-builder.js';

// Export scanners
export {BaseScanner} from './scanners/base-scanner.js';
export {CodebaseScanner as Scanner} from './scanners/codebase-scanner.js';
export {LintingScanner} from './scanners/linters/linting-scanner.js';
export {NodeVersionScanner} from './scanners/node-version-scanner.js';
export {PackageManagerScanner} from './scanners/package-manager-scanner.js';

// Export services
export {logger} from './services/logger.js';
export {packageInfo} from './services/package-info.js';

const cliLogger = logger.getLogger('CLI');

/**
 * Class to handle CLI operations
 */
export class CliHandler {
	private readonly program: Command;

	constructor() {
		this.program = new Command();
		this.setup();
	}

	/**
	 * Parse arguments and execute commands
	 */
	public async run(): Promise<void> {
		await this.program.parseAsync();
	}

	/**
	 * Setup the CLI program
	 */
	private setup(): void {
		// Get package version
		const version = packageInfo.getVersion();

		this.program
			.name('psst-ai')
			.description(
				'Generate coding instructions for AI assistants based on your codebase',
			)
			.version(version)
			.argument(
				'[directory]',
				'Directory to scan (defaults to current directory)',
			)
			.option('-o, --output <path>', 'Save output to a file')
			.option('-q, --quiet', 'Suppress console output')
			.option('-v, --verbose', 'Show verbose output')
			.action(
				async (
					directory?: string,
					options?: {
						output?: string;
						quiet?: boolean;
						verbose?: boolean;
					},
				) => {
					await this.runScan(directory, options);
				},
			);
	}

	/**
	 * Run the scan on the specified directory
	 * @param directory Directory to scan
	 * @param options Command options
	 */
	private async runScan(
		directory?: string,
		options?: {
			output?: string;
			quiet?: boolean;
			verbose?: boolean;
		},
	): Promise<void> {
		try {
			const pathToScan = directory ?? process.cwd();
			const absolutePath = path.resolve(pathToScan);

			if (options?.verbose) {
				cliLogger.info(`Starting scan of directory: ${absolutePath}`);
			}

			const scanner = new CodebaseScanner(absolutePath);
			const output = await scanner.getOutput();

			// Print the output to the console if not in quiet mode
			if (!options?.quiet) {
				console.log('\n--- 🤫 psst-ai Generated Instructions ---\n');
				console.log(output);
				console.log('\n--- End of Generated Instructions ---\n');
			}

			// Save output to file if specified
			if (options?.output) {
				const fs = await import('node:fs/promises');
				const outputPath = path.resolve(options.output);
				await fs.writeFile(outputPath, output, 'utf8');

				if (options?.verbose) {
					cliLogger.info(`Output saved to: ${outputPath}`);
				}
			}

			if (options?.verbose) {
				cliLogger.info('Scan completed');
			}
		} catch (error) {
			cliLogger.error('Error running psst-ai', error);
			process.exit(1);
		}
	}
}

// Create and run the CLI
const cli = new CliHandler();
await cli.run();
