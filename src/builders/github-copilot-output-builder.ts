import fs from 'node:fs/promises';
import path from 'node:path';
import {logger} from '../services/logger.js';
import type {AiRule} from '../types.js';
import {
	formatCategoryTitle,
	formatToDisplayTitle,
} from '../utils/category-formatter.js';

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
		// Group recommendations by category
		const categorizedRecommendations = new Map<string, string[]>();

		for (const recommendation of this.recommendations) {
			const categoryValue = recommendation.category ?? 'general';
			const displayCategory = recommendation.category
				? formatCategoryTitle(recommendation.category)
				: 'General';

			if (!categorizedRecommendations.has(displayCategory)) {
				categorizedRecommendations.set(displayCategory, []);
			}

			// Ensure recommendation.rules is an array before spreading
			if (Array.isArray(recommendation.rules)) {
				categorizedRecommendations
					.get(displayCategory)
					?.push(...recommendation.rules);
			} else {
				this.logger.warn(
					`Skipping recommendation with invalid rules: ${JSON.stringify(recommendation)}`,
				);
			}
		}

		// Create markdown format with headers for each category
		let content = '';

		// Don't add <instructions> tags as requested

		for (const [
			category,
			recommendations,
		] of categorizedRecommendations.entries()) {
			// Add unique recommendations (avoid duplicates)
			const uniqueRecommendations = [...new Set(recommendations)];

			if (uniqueRecommendations.length > 0) {
				// Add category header
				content += `## ${category}\n`;

				// Add each recommendation under the category
				for (const recommendation of uniqueRecommendations) {
					content += `${recommendation}\n`;
				}

				// Add an extra newline after each category
				content += '\n';
			}
		}

		// Trim trailing whitespace
		content = content.trim();

		// Don't add closing </instructions> tag as requested

		return content;
	}
}
