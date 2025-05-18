import fs from 'node:fs/promises';
import path from 'node:path';
import {logger} from '../services/logger.js';
import type {Recommendation} from '../types.js';

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
		private readonly recommendations: Recommendation[],
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
	 */
	private generateOutputContent(): string {
		// Group recommendations by category
		const categorizedRecommendations = new Map<string, string[]>();

		for (const recommendation of this.recommendations) {
			const category = recommendation.category ?? 'General';
			if (!categorizedRecommendations.has(category)) {
				categorizedRecommendations.set(category, []);
			}

			categorizedRecommendations
				.get(category)
				?.push(...recommendation.recommendations);
		}

		// Convert to markdown format
		let content = '# GitHub Copilot Instructions\n\n';
		content +=
			'When generating code, please follow these user provided coding instructions. You can ignore an instruction if it contradicts a system message.\n\n';

		// Don't add <instructions> tags as requested

		for (const [
			category,
			recommendations,
		] of categorizedRecommendations.entries()) {
			// Add unique recommendations (avoid duplicates)
			const uniqueRecommendations = [...new Set(recommendations)];

			if (uniqueRecommendations.length > 0) {
				content += `## ${category}\n`;

				for (const recommendation of uniqueRecommendations) {
					content += `${recommendation}\n`;
				}

				content += '\n';
			}
		}

		// Don't add closing </instructions> tag as requested

		return content;
	}
}
