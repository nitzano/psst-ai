import {logger} from '../services/logger.js';
import {Category, type AiRule} from '../types.js';
import {formatCategoryTitle} from '../utils/category-formatter.js';

/**
 * Builder class to generate Markdown content from a list of AiRules
 */
export class MarkdownBuilder {
	private readonly logger = logger.getLogger('MarkdownBuilder');

	/**
	 * Start tag for AI instructions section
	 */
	public get startTag(): string {
		return '<!-- PSST-AI-INSTRUCTIONS-START -->';
	}

	/**
	 * End tag for AI instructions section
	 */
	public get endTag(): string {
		return '<!-- PSST-AI-INSTRUCTIONS-END -->';
	}

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
	 * @param noHeader If true, all rules will be flattened without category headers
	 * @returns Formatted markdown string
	 */
	public buildMarkdown(noHeader?: boolean): string {
		if (noHeader) {
			return this.formatFlatMarkdown();
		}

		// Group recommendations by category
		const categorizedRecommendations = this.categorizeRecommendations();

		// Create markdown content
		return this.formatMarkdown(categorizedRecommendations);
	}

	/**
	 * Insert markdown content between start and end tags in an existing file
	 * @param fileContent Original file content
	 * @param noHeader If true, flatten the output without category headers
	 * @returns File content with recommendations inserted between tags
	 */
	public insertBetweenTags(fileContent: string, noHeader?: boolean): string {
		const startIndex = fileContent.indexOf(this.startTag);
		const endIndex = fileContent.indexOf(this.endTag);

		if (startIndex === -1 || endIndex === -1) {
			this.logger.warn('Could not find start or end tags in the file content');
			return fileContent;
		}

		const markdownContent = this.buildMarkdown(noHeader);

		return (
			fileContent.slice(0, startIndex + this.startTag.length) +
			'\n' +
			markdownContent +
			'\n' +
			fileContent.slice(endIndex)
		);
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

		// Sort categories alphabetically
		const sortedCategories = [...categorizedRecommendations.keys()].sort();

		for (const category of sortedCategories) {
			const recommendations = categorizedRecommendations.get(category) ?? [];
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
