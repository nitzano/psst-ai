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
	 * @param flat If true, all rules will be flattened without category headers
	 * @returns Formatted markdown string
	 */
	public buildMarkdown(flat?: boolean): string {
		if (flat) {
			return this.formatFlatMarkdown();
		}

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

	/**
	 * Format recommendations into flat markdown without categories
	 * @returns Formatted markdown string with all rules flattened
	 */
	private formatFlatMarkdown(): string {
		let content = '';
		const allRecommendations = new Set<string>();

		// Collect all unique recommendations
		for (const recommendation of this.recommendations) {
			if (recommendation.rule) {
				allRecommendations.add(recommendation.rule);
			} else {
				this.logger.warn(
					`Skipping recommendation with missing rule: ${JSON.stringify(recommendation)}`,
				);
			}
		}

		// Add each unique recommendation as a bullet point
		for (const recommendation of allRecommendations) {
			content += `- ${recommendation}\n`;
		}

		// Trim trailing whitespace
		return content.trim();
	}
}
