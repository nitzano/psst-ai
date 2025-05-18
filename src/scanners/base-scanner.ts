import {logger} from '../services/logger.js';
import type {AiRule} from '../types.js';

/**
 * Base scanner class that all scanners should extend
 */
export abstract class BaseScanner {
	protected readonly logger = logger.getLogger(this.constructor.name);

	/**
	 * Constructor for BaseScanner
	 * @param rootPath Path to scan (defaults to current directory)
	 */
	constructor(protected readonly rootPath: string) {
		this.logger.debug(
			`${this.constructor.name} initialized with path: ${this.rootPath}`,
		);
	}

	/**
	 * Run the scanner and return recommendations
	 */
	public abstract scan(): Promise<AiRule[]>;
}
