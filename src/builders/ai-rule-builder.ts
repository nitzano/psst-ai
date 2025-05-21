import fs from 'node:fs/promises';
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
	 * Start tag for AI instructions section
	 */
	protected get startTag(): string {
		return '<!-- PSST-AI-INSTRUCTIONS-START -->';
	}

	/**
	 * End tag for AI instructions section
	 */
	protected get endTag(): string {
		return '<!-- PSST-AI-INSTRUCTIONS-END -->';
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
	 * Generate the output content for the output file
	 * @param flat If true, flatten the output without categories
	 * @returns Formatted output content with recommendations
	 */
	public abstract generateOutputContent(flat?: boolean): string;

	/**
	 * Update file instructions by replacing content between start and end tags
	 * @param filePath Path to the file to update
	 */
	protected async updateFileInstructions(filePath: string): Promise<void> {
		try {
			// Read the file
			const fileContent = await fs.readFile(filePath, 'utf8');

			// Find the start and end tags
			const startIndex = fileContent.indexOf(this.startTag);
			const endIndex = fileContent.indexOf(this.endTag);

			if (startIndex === -1 || endIndex === -1) {
				this.logger.warn(`Could not find start or end tags in ${filePath}`);
				return;
			}

			// Generate the new content
			const contentToInsert = this.generateOutputContent(true);

			// Build the new file content
			const newContent =
				fileContent.slice(0, startIndex + this.startTag.length) +
				'\n' +
				contentToInsert +
				'\n' +
				fileContent.slice(endIndex);

			// Write the updated content back to the file
			await fs.writeFile(filePath, newContent, 'utf8');

			this.logger.info(`Updated AI instructions in ${filePath}`);
		} catch (error: unknown) {
			this.logger.error(`Error updating file instructions`, error as Error);
			throw error;
		}
	}
}
