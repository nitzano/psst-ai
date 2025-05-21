import {logger} from '../services/logger.js';
import type {AiRule} from '../types.js';

/**
 * Base builder class for AI rule output generation
 */
export abstract class AiRuleBuilder {
	protected readonly logger = logger.getLogger(this.constructor.name);

	/**
	 * Magic placeholder used to identify where AI instructions should be inserted
	 */
	protected get magicPlaceholder(): string {
		return '<!-- PSST-AI-INSTRUCTIONS -->';
	}

	/**
	 * Constructor for AiRuleBuilder
	 * @param outputPath Path to output directory
	 * @param recommendations List of recommendations collected from scanners
	 */
	constructor(
		protected readonly outputPath: string,
		protected readonly recommendations: AiRule[],
	) {
		this.logger.debug(
			`${this.constructor.name} initialized with ${recommendations.length} recommendations`,
		);
	}

	/**
	 * Build the output file with all recommendations
	 */
	public abstract build(): Promise<void>;

	/**
	 * Generate the content for the output file
	 * @param flat If true, flatten the output without categories
	 * @returns Formatted output content with recommendations
	 */
	public abstract generateOutputContent(flat?: boolean): string;
}
