import {describe, expect, it} from 'vitest';
import {MarkdownBuilder} from '../markdown-builder.js';
import {Category, type AiRule} from '../../types.js';
import {formatCategoryTitle} from '../../utils/category-formatter.js';

describe('MarkdownBuilder', () => {
	describe('Categories order', () => {
		it('should order categories alphabetically in output markdown', () => {
			// Create test rules with categories in non-alphabetical order
			const testRules: AiRule[] = [
				{rule: 'Use linting rule', category: Category.Linting},
				{rule: 'Use package manager', category: Category.PackageManager},
				{rule: 'Use Node.js version', category: Category.NodeVersion},
				{rule: 'Use general guideline', category: Category.General},
				{rule: 'Use testing framework', category: Category.Testing},
				{rule: 'Use Prettier', category: Category.Prettier},
			];

			// Generate markdown using MarkdownBuilder
			const markdownBuilder = new MarkdownBuilder(testRules);
			const markdownOutput = markdownBuilder.buildMarkdown();

			// Extract category headers from the markdown
			const categoryHeaders: string[] = [];
			const lines = markdownOutput.split('\n');
			for (const line of lines) {
				if (line.startsWith('##')) {
					categoryHeaders.push(line.replace('##', '').trim());
				}
			}

			// Get display titles for all used categories
			const expectedCategories = Object.values(Category)
				.map((category) => formatCategoryTitle(category))
				.sort();

			// Filter to only include categories that appear in our test rules
			const expectedCategoriesInOutput = expectedCategories.filter((category) =>
				categoryHeaders.includes(category),
			);

			// Check if the categories in output are in alphabetical order
			expect(categoryHeaders).toEqual(expectedCategoriesInOutput);

			// Verify that the categories are in the same order as they would be if sorted alphabetically
			const sortedCategoryHeaders = [...categoryHeaders].sort();
			expect(categoryHeaders).toEqual(sortedCategoryHeaders);
		});
	});
});
