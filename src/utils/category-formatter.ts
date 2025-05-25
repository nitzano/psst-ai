import {Category} from '../types.js';

/**
 * Maps each Category enum value to its display title
 */
const categoryDisplayTitles: Record<Category, string> = {
	[Category.General]: 'General Guidelines',
	[Category.Prettier]: 'Prettier',
	[Category.PackageManager]: 'Package Manager',
	[Category.NodeVersion]: 'Node Version',
	[Category.Linting]: 'Linting',
	[Category.Testing]: 'Testing',
	[Category.NextJs]: 'Next.js',
	[Category.Xo]: 'XO',
	[Category.Ava]: 'AVA',
	[Category.Vue]: 'Vue.js',
};

/**
 * Formats a Category enum value to its display title
 * @param category The category enum value
 * @returns The formatted display title for the category
 */
export function formatCategoryTitle(category: Category): string {
	return categoryDisplayTitles[category] || category;
}

/**
 * Formats any string (including enum values) to display title format
 * Falls back to this method if no explicit mapping is found
 * @param value The value to format
 * @returns The formatted display title
 */
export function formatToDisplayTitle(value: string): string {
	// If the value is undefined or null, return empty string
	if (!value) {
		return '';
	}

	// Replace underscores with spaces and capitalize each word
	return value
		.split('_')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ');
}
