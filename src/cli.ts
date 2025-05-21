#!/usr/bin/env node

import path from 'node:path';
import process from 'node:process';
import {Command} from 'commander';
import {VscodeBuilder} from './builders/github-copilot-output-builder.js';
import {CodebaseScanner} from './scanners/codebase-scanner.js';
import {logger} from './services/logger.js';
import {packageInfo} from './services/package-info.js';

/**
 * CLI options type definition
 */
export type CliOptions = {
	output?: string;
	quiet?: boolean;
	verbose?: boolean;
	flat?: boolean;
	editor?: string;
};

// Export types (for programmatic access when installed as dependency)
export type {AiRule, Category} from './types.js';

// Export builders
export {VscodeBuilder as GithubCopilotOutputBuilder} from './builders/github-copilot-output-builder.js';

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
			.option('-f, --flat', 'Flatten output without category headers')
			.option(
				'-e, --editor <type>',
				'Generate or update instructions for specific editor (vscode, cursor, github)',
			)
			.action(async (directory?: string, options?: CliOptions) => {
				await this.runScan(directory, options);
			});
	}

	/**
	 * Run the scan on the specified directory
	 * @param directory Directory to scan
	 * @param options Command options
	 */
	private async runScan(
		directory?: string,
		options?: CliOptions,
	): Promise<void> {
		try {
			const pathToScan = directory ?? process.cwd();
			const absolutePath = path.resolve(pathToScan);

			if (options?.verbose) {
				cliLogger.info(`Starting scan of directory: ${absolutePath}`);
			}

			const scanner = new CodebaseScanner(absolutePath);
			const output = await scanner.getOutput(options?.flat);

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

			// Handle editor-specific processing
			if (options?.editor) {
				await this.processEditorInstructions(
					absolutePath,
					options.editor,
					output,
				);
			}

			if (options?.verbose) {
				cliLogger.info('Scan completed');
			}
		} catch (error) {
			cliLogger.error('Error running psst-ai', error);
			process.exit(1);
		}
	}

	/**
	 * Process editor-specific instructions
	 * @param projectPath The absolute path to the project
	 * @param editorType The editor type (github, vscode, cursor)
	 * @param content The generated instructions content
	 */
	private async processEditorInstructions(
		projectPath: string,
		editorType: string,
		content: string,
	): Promise<void> {
		try {
			// Process based on editor type
			if (editorType.toLowerCase() === 'github') {
				// Get the scanner for rules
				const scanner = new CodebaseScanner(projectPath);
				const rules = await scanner.scan();

				// Create a GitHub Copilot output builder
				const outputBuilder = new VscodeBuilder(
					path.resolve(projectPath, 'output'),
					rules,
				);

				// Update GitHub Copilot instructions
				await outputBuilder.updateGitHubInstructions(projectPath);
			} else if (
				['vscode', 'cursor', 'windsurf'].includes(editorType.toLowerCase())
			) {
				cliLogger.info(
					`Support for ${editorType} instructions will be added in a future version`,
				);
			} else {
				cliLogger.warn(`Unknown editor type: ${editorType}`);
			}
		} catch (error) {
			cliLogger.error(`Error processing editor instructions`, error);
		}
	}
}

// Create and run the CLI
const cli = new CliHandler();
await cli.run();
