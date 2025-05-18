import path from 'node:path';
import {GithubCopilotOutputBuilder} from '../builders/github-copilot-output-builder.js';
import {logger} from '../services/logger.js';
import type {AiRule} from '../types.js';
import {LintingScanner} from './linting-scanner.js';
import {NodeVersionScanner} from './node-version-scanner.js';
import {NvmrcScanner} from './nvmrc-scanner.js';
import {PackageManagerScanner} from './package-manager-scanner.js';

/**
 * Scanner class to handle scanning a directory
 */
export class Scanner {
	private readonly logger = logger.getLogger('Scanner');
	private readonly outputPath: string;

	/**
	 * Constructor for Scanner
	 * @param pathToScan Path to scan (defaults to current directory)
	 */
	constructor(private readonly pathToScan: string) {
		this.logger.debug(`Scanner initialized with path: ${this.pathToScan}`);
		this.outputPath = path.resolve(this.pathToScan, 'output');
	}

	/**
	 * Run the scanner
	 */
	public async run(): Promise<void> {
		this.logger.debug(`Scanning directory: ${this.pathToScan}`);

		// Collect rules from sub-scanners
		const rules = await this.scan();

		// Generate output file
		const outputBuilder = new GithubCopilotOutputBuilder(
			this.outputPath,
			rules,
		);
		await outputBuilder.build();

		this.logger.info('Scan completed successfully');
	}

	/**
	 * Scan the directory using all available sub-scanners
	 */
	public async scan(): Promise<AiRule[]> {
		this.logger.debug('Running all sub-scanners');

		const scanners = [
			new PackageManagerScanner(this.pathToScan),
			new NodeVersionScanner(this.pathToScan),
			new NvmrcScanner(this.pathToScan),
			new LintingScanner(this.pathToScan),
			// Add more scanners here as they are implemented
		];

		const allRules: AiRule[] = [];

		// Run all scanners and collect their rules
		for (const scanner of scanners) {
			try {
				const scannerName = scanner.constructor.name;
				this.logger.debug(`Running scanner: ${scannerName}`);

				// eslint-disable-next-line no-await-in-loop
				const rules = await scanner.scan();
				// Type assertion to ensure rules is properly typed as AiRule[]
				const typedRules = rules as AiRule[];
				allRules.push(...typedRules);

				this.logger.debug(`Scanner ${scannerName} found ${rules.length} rules`);
			} catch (error) {
				this.logger.error(
					`Error running scanner ${scanner.constructor.name}`,
					error,
				);
				// Continue with other scanners even if one fails
			}
		}

		this.logger.info(`Found a total of ${allRules.length} rules`);
		return allRules;
	}
}
