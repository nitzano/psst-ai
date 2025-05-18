import {logger} from '../services/logger.js';

/**
 * Scanner class to handle scanning a directory
 */
export class Scanner {
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
