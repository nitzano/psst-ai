import path from 'node:path';
import {GithubCopilotOutputBuilder} from '../builders/github-copilot-output-builder.js';
import {logger} from '../services/logger.js';
import type {Recommendation} from '../types.js';
import {LintingScanner} from './linting-scanner.js';
import {NodeVersionScanner} from './node-version-scanner.js';
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

		// Collect recommendations from sub-scanners
		const recommendations = await this.scan();

		// Generate output file
		const outputBuilder = new GithubCopilotOutputBuilder(
			this.outputPath,
			recommendations,
		);
		await outputBuilder.build();

		this.logger.info('Scan completed successfully');
	}

	/**
	 * Scan the directory using all available sub-scanners
	 */
	public async scan(): Promise<Recommendation[]> {
		this.logger.debug('Running all sub-scanners');

		const scanners = [
			new PackageManagerScanner(this.pathToScan),
			new NodeVersionScanner(this.pathToScan),
			new LintingScanner(this.pathToScan),
			// Add more scanners here as they are implemented
		];

		const allRecommendations: Recommendation[] = [];

		// Run all scanners and collect their recommendations
		for (const scanner of scanners) {
			try {
				const scannerName = scanner.constructor.name;
				this.logger.debug(`Running scanner: ${scannerName}`);

				// eslint-disable-next-line no-await-in-loop
				const recommendations = await scanner.scan();
				allRecommendations.push(...recommendations);

				this.logger.debug(
					`Scanner ${scannerName} found ${recommendations.length} recommendations`,
				);
			} catch (error) {
				this.logger.error(
					`Error running scanner ${scanner.constructor.name}`,
					error,
				);
				// Continue with other scanners even if one fails
			}
		}

		this.logger.info(
			`Found a total of ${allRecommendations.length} recommendations`,
		);
		return allRecommendations;
	}
}
