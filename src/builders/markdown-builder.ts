import {logger} from '../services/logger.js';
import {Category, type AiRule} from '../types.js';
import {formatCategoryTitle} from '../utils/category-formatter.js';

/**
 * Builder class to generate Markdown content from a list of AiRules
 */
export class MarkdownBuilder {
	private readonly logger = logger.getLogger('MarkdownBuilder');

	/**
	 * Constructor for MarkdownBuilder
	 * @param recommendations List of recommendations collected from scanners
	 */
	constructor(private readonly recommendations: AiRule[]) {
		this.logger.debug(
			`MarkdownBuilder initialized with ${recommendations.length} recommendations`,
		);
	}

	/**
	 * Build markdown content from the recommendations
	 * @returns Formatted markdown string
	 */
	public buildMarkdown(): string {
		// Group recommendations by category
		const categorizedRecommendations = this.categorizeRecommendations();

		// Create markdown content
		return this.formatMarkdown(categorizedRecommendations);
	}

	/**
	 * Group recommendations by their categories
	 * @returns Map of categories to their recommendations
	 */
	private categorizeRecommendations(): Map<string, string[]> {
		const categorizedRecommendations = new Map<string, string[]>();

		for (const recommendation of this.recommendations) {
			const categoryValue = recommendation.category ?? Category.General;
			const displayCategory = formatCategoryTitle(categoryValue);

			if (!categorizedRecommendations.has(displayCategory)) {
				categorizedRecommendations.set(displayCategory, []);
			}

			// Add the individual rule to the recommendations
			if (recommendation.rule) {
				categorizedRecommendations
					.get(displayCategory)
					?.push(recommendation.rule);
			} else {
				this.logger.warn(
					`Skipping recommendation with missing rule: ${JSON.stringify(recommendation)}`,
				);
			}
		}

		return categorizedRecommendations;
	}

	/**
	 * Format the categorized recommendations into markdown
	 * @param categorizedRecommendations Map of categories to their recommendations
	 * @returns Formatted markdown string
	 */
	private formatMarkdown(
		categorizedRecommendations: Map<string, string[]>,
	): string {
		let content = '';

		for (const [
			category,
			recommendations,
		] of categorizedRecommendations.entries()) {
			// Add unique recommendations (avoid duplicates)
			const uniqueRecommendations = [...new Set(recommendations)];

			if (uniqueRecommendations.length > 0) {
				// Add category header with a blank line after it
				content += `## ${category}\n\n`;

				// Add each recommendation as a bullet point under the category
				for (const recommendation of uniqueRecommendations) {
					content += `- ${recommendation}\n`;
				}

				// Add an extra newline after each category
				content += '\n';
			}
		}

		// Trim trailing whitespace
		return content.trim();
	}
}
