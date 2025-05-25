import {existsSync} from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {Category, type AiRule} from '../../types.js';
import {BaseScanner} from '../base/base-scanner.js';

/**
 * Scanner to detect Tailwind CSS configuration and usage patterns in a project
 */
export class TailwindScanner extends BaseScanner {
	/**
	 * Common Tailwind CSS configuration file names
	 */
	private readonly configFileNames = [
		'tailwind.config.js',
		'tailwind.config.ts',
		'tailwind.config.cjs',
		'tailwind.config.mjs',
	];

	/**
	 * Scan the project to determine if and how Tailwind CSS is configured
	 */
	public async scan(): Promise<AiRule[]> {
		this.logger.debug('Scanning for Tailwind CSS configuration');

		try {
			// Check for Tailwind CSS configuration files
			const configFile = await this.findTailwindConfigFile();

			// Check if Tailwind CSS is a dependency
			const hasDependency = await this.hasTailwindDependency();

			// If no Tailwind CSS configuration found, don't return any recommendations
			if (!configFile && !hasDependency) {
				return [];
			}

			// Initialize recommendations array
			const recommendations: AiRule[] = [];

			// Add general Tailwind CSS usage guidelines
			if (hasDependency) {
				recommendations.push({
					category: Category.Tailwind,
					rule: 'Use Tailwind CSS utility classes for styling. Keep custom CSS minimal and prefer utility-first approach.',
				});
			}

			// Configuration-specific recommendations
			if (configFile) {
				const configContent = await this.readConfigFile(configFile);
				if (configContent) {
					this.detectContentPaths(configContent, recommendations);
					this.detectThemeCustomization(configContent, recommendations);
					this.detectPlugins(configContent, recommendations);
					this.detectDarkModeConfiguration(configContent, recommendations);
					this.detectPurgeConfiguration(configContent, recommendations);
				}
			}

			return recommendations;
		} catch (error) {
			this.logger.error('Error scanning for Tailwind CSS configuration', error);
			return [];
		}
	}

	/**
	 * Find Tailwind CSS configuration file in the project
	 */
	private async findTailwindConfigFile(): Promise<string | undefined> {
		for (const fileName of this.configFileNames) {
			const filePath = path.join(this.rootPath, fileName);
			if (existsSync(filePath)) {
				this.logger.debug(`Found Tailwind config file: ${fileName}`);
				return fileName;
			}
		}

		return undefined;
	}

	/**
	 * Check if Tailwind CSS is a dependency in package.json
	 */
	private async hasTailwindDependency(): Promise<boolean> {
		const packageJsonPath = path.join(this.rootPath, 'package.json');
		if (!existsSync(packageJsonPath)) {
			return false;
		}

		try {
			const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
			const packageJson = JSON.parse(packageJsonContent) as Record<
				string,
				unknown
			>;

			const dependencyFields = [
				'dependencies',
				'devDependencies',
				'peerDependencies',
			];

			for (const field of dependencyFields) {
				if (packageJson[field] && typeof packageJson[field] === 'object') {
					const dependencies = packageJson[field] as Record<string, string>;
					if ('tailwindcss' in dependencies) {
						this.logger.debug(`Found Tailwind CSS in ${field}`);
						return true;
					}
				}
			}
		} catch (error) {
			this.logger.error('Error reading package.json', error);
		}

		return false;
	}

	/**
	 * Read and return Tailwind CSS configuration file content
	 */
	private async readConfigFile(
		configFile: string,
	): Promise<string | undefined> {
		try {
			const filePath = path.join(this.rootPath, configFile);
			const content = await fs.readFile(filePath, 'utf8');
			return content;
		} catch (error) {
			this.logger.error(
				`Error reading Tailwind config file: ${configFile}`,
				error,
			);
			return undefined;
		}
	}

	/**
	 * Detect content paths configuration
	 */
	private detectContentPaths(
		configContent: string,
		recommendations: AiRule[],
	): void {
		if (
			configContent.includes('content:') ||
			configContent.includes('purge:')
		) {
			recommendations.push({
				category: Category.Tailwind,
				rule: 'Configure content paths properly to ensure all HTML, JS, and template files are scanned for class names. This enables proper CSS purging.',
			});

			// Check for specific patterns
			if (configContent.includes('**/*.{html,js,ts,jsx,tsx}')) {
				recommendations.push({
					category: Category.Tailwind,
					rule: 'Using glob patterns for content scanning. Ensure all file extensions used in your project are included.',
				});
			}
		}
	}

	/**
	 * Detect theme customization
	 */
	private detectThemeCustomization(
		configContent: string,
		recommendations: AiRule[],
	): void {
		if (configContent.includes('theme:')) {
			recommendations.push({
				category: Category.Tailwind,
				rule: 'Customizing Tailwind theme. Use extend property to add custom values while preserving default theme values.',
			});

			// Check for theme extensions
			if (configContent.includes('extend:')) {
				recommendations.push({
					category: Category.Tailwind,
					rule: 'Using theme.extend to add custom design tokens. This preserves Tailwind defaults while adding project-specific values.',
				});
			}

			// Check for color customization
			if (configContent.includes('colors:')) {
				recommendations.push({
					category: Category.Tailwind,
					rule: 'Customizing color palette. Define semantic color names and consider accessibility when creating custom colors.',
				});
			}

			// Check for spacing customization
			if (
				configContent.includes('spacing:') ||
				configContent.includes('padding:') ||
				configContent.includes('margin:')
			) {
				recommendations.push({
					category: Category.Tailwind,
					rule: 'Customizing spacing scale. Maintain consistency with design system and use appropriate scale ratios.',
				});
			}

			// Check for font customization
			if (configContent.includes('fontFamily:')) {
				recommendations.push({
					category: Category.Tailwind,
					rule: 'Customizing font families. Include appropriate font fallbacks and consider loading performance.',
				});
			}
		}
	}

	/**
	 * Detect plugins configuration
	 */
	private detectPlugins(
		configContent: string,
		recommendations: AiRule[],
	): void {
		if (configContent.includes('plugins:')) {
			recommendations.push({
				category: Category.Tailwind,
				rule: 'Using Tailwind plugins. Keep plugins updated and only include those you actively use to minimize bundle size.',
			});

			// Check for official plugins
			if (configContent.includes('@tailwindcss/forms')) {
				recommendations.push({
					category: Category.Tailwind,
					rule: 'Using @tailwindcss/forms plugin. This provides better default styling for form elements.',
				});
			}

			if (configContent.includes('@tailwindcss/typography')) {
				recommendations.push({
					category: Category.Tailwind,
					rule: 'Using @tailwindcss/typography plugin. Use prose classes for rich text content and blog posts.',
				});
			}

			if (configContent.includes('@tailwindcss/aspect-ratio')) {
				recommendations.push({
					category: Category.Tailwind,
					rule: 'Using @tailwindcss/aspect-ratio plugin. Useful for maintaining consistent aspect ratios for images and videos.',
				});
			}

			if (configContent.includes('@tailwindcss/line-clamp')) {
				recommendations.push({
					category: Category.Tailwind,
					rule: 'Using @tailwindcss/line-clamp plugin. Great for truncating text content to a specific number of lines.',
				});
			}
		}
	}

	/**
	 * Detect dark mode configuration
	 */
	private detectDarkModeConfiguration(
		configContent: string,
		recommendations: AiRule[],
	): void {
		if (configContent.includes('darkMode:')) {
			if (configContent.includes("darkMode: 'class'")) {
				recommendations.push({
					category: Category.Tailwind,
					rule: 'Using class-based dark mode. Toggle dark mode by adding/removing the "dark" class on the html or body element.',
				});
			} else if (configContent.includes("darkMode: 'media'")) {
				recommendations.push({
					category: Category.Tailwind,
					rule: 'Using media query-based dark mode. Dark mode automatically follows system preference.',
				});
			} else if (configContent.includes("darkMode: 'selector'")) {
				recommendations.push({
					category: Category.Tailwind,
					rule: 'Using selector-based dark mode. Define a custom selector for dark mode activation.',
				});
			}
		}
	}

	/**
	 * Detect purge/content configuration for CSS optimization
	 */
	private detectPurgeConfiguration(
		configContent: string,
		recommendations: AiRule[],
	): void {
		if (
			configContent.includes('purge:') &&
			!configContent.includes('content:')
		) {
			recommendations.push({
				category: Category.Tailwind,
				rule: 'Using legacy purge configuration. Consider migrating to the newer "content" configuration for better performance.',
			});
		}

		// Check for safelist
		if (configContent.includes('safelist:')) {
			recommendations.push({
				category: Category.Tailwind,
				rule: 'Using safelist to prevent purging of specific classes. Use sparingly and prefer dynamic class detection when possible.',
			});
		}

		// Check for blocklist
		if (configContent.includes('blocklist:')) {
			recommendations.push({
				category: Category.Tailwind,
				rule: 'Using blocklist to prevent specific classes from being generated. Useful for removing unused default utilities.',
			});
		}
	}
}
