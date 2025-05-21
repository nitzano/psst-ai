import fs from 'node:fs/promises';
import path from 'node:path';
import {logger} from '../services/logger.js';
import type {AiRule} from '../types.js';
import {formatCategoryTitle} from '../utils/category-formatter.js';
import {MarkdownBuilder} from './markdown-builder.js';

/**
 * Builder class to generate GitHub Copilot instructions from recommendations
 */
export class GithubCopilotOutputBuilder {
	private readonly logger = logger.getLogger('GithubCopilotOutputBuilder');

	/**
	 * Constructor for GithubCopilotOutputBuilder
	 * @param outputPath Path to output directory
	 * @param recommendations List of recommendations collected from scanners
	 */
	constructor(
		private readonly outputPath: string,
		private readonly recommendations: AiRule[],
	) {
		this.logger.debug(
			`GithubCopilotOutputBuilder initialized with ${recommendations.length} recommendations`,
		);
	}

	/**
	 * Build the output file with all recommendations
	 */
	public async build(): Promise<void> {
		try {
			const outputContent = this.generateOutputContent();
			const outputFilePath = path.join(
				this.outputPath,
				'copilot-instructions.md',
			);

			// Ensure the output directory exists
			await fs.mkdir(this.outputPath, {recursive: true});

			// Write the file
			await fs.writeFile(outputFilePath, outputContent, 'utf8');

			this.logger.info(`Copilot instructions written to ${outputFilePath}`);
		} catch (error) {
			this.logger.error('Error building copilot instructions', error);
			throw error;
		}
	}

	/**
	 * Generate the content for the output file
	 * @returns Formatted markdown content with recommendations
	 */
	public generateOutputContent(): string {
		// Use the MarkdownBuilder to generate the output content
		const markdownBuilder = new MarkdownBuilder(this.recommendations);
		return markdownBuilder.buildMarkdown();
	}
}
