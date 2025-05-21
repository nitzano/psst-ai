import {existsSync} from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {Category, type AiRule} from '../types.js';
import {BaseScanner} from './base-scanner.js';

/**
 * Scanner to detect Prettier configuration in a project
 */
export class PrettierScanner extends BaseScanner {
	/**
	 * Common Prettier configuration file names
	 */
	private readonly configFileNames = [
		'.prettierrc',
		'.prettierrc.json',
		'.prettierrc.yml',
		'.prettierrc.yaml',
		'.prettierrc.json5',
		'.prettierrc.js',
		'.prettierrc.cjs',
		'prettier.config.js',
		'prettier.config.cjs',
	];

	/**
	 * Scan the project to determine if and how Prettier is configured
	 */
	public async scan(): Promise<AiRule[]> {
		this.logger.debug('Scanning for Prettier configuration');

		try {
			// Check for Prettier configuration files
			const configFile = await this.findPrettierConfigFile();

			// Check if Prettier is a dependency
			const hasDependency = await this.hasPrettierDependency();

			// Check for integration with other tools
			const integrations = await this.checkIntegrations();

			// If no Prettier configuration found, don't return any recommendation
			if (!configFile && !hasDependency) {
				return [];
			}

			// Generate recommendations based on the findings
			return this.generateRecommendations(
				configFile,
				hasDependency,
				integrations,
			);
		} catch (error) {
			this.logger.error('Error scanning for Prettier configuration', error);
			return [];
		}
	}

	/**
	 * Find Prettier configuration file in the project
	 */
	private async findPrettierConfigFile(): Promise<string | undefined> {
		for (const fileName of this.configFileNames) {
			const filePath = path.join(this.rootPath, fileName);
			if (existsSync(filePath)) {
				return fileName;
			}
		}

		// Also check for a "prettier" key in package.json
		const packageJsonPath = path.join(this.rootPath, 'package.json');
		if (existsSync(packageJsonPath)) {
			try {
				const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
				const packageJson = JSON.parse(packageJsonContent);
				if (packageJson.prettier) {
					return 'package.json (prettier key)';
				}
			} catch (error) {
				this.logger.error('Error parsing package.json', error);
			}
		}

		return null;
	}

	/**
	 * Check if Prettier is a dependency in package.json
	 */
	private async hasPrettierDependency(): Promise<boolean> {
		const packageJsonPath = path.join(this.rootPath, 'package.json');
		if (existsSync(packageJsonPath)) {
			try {
				const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
				const packageJson = JSON.parse(packageJsonContent);

				const allDependencies = {
					...packageJson.dependencies,
					...packageJson.devDependencies,
				};

				return 'prettier' in allDependencies;
			} catch (error) {
				this.logger.error('Error parsing package.json', error);
			}
		}

		return false;
	}

	/**
	 * Check for integrations with other tools (ESLint, etc.)
	 */
	private async checkIntegrations(): Promise<string[]> {
		const integrations: string[] = [];
		const packageJsonPath = path.join(this.rootPath, 'package.json');

		if (existsSync(packageJsonPath)) {
			try {
				const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
				const packageJson = JSON.parse(packageJsonContent);

				const allDependencies = {
					...packageJson.dependencies,
					...packageJson.devDependencies,
				};

				// Check for ESLint integration
				if (
					'eslint-plugin-prettier' in allDependencies ||
					'eslint-config-prettier' in allDependencies
				) {
					integrations.push('eslint');
				}

				// Check for Stylelint integration
				if ('stylelint-config-prettier' in allDependencies) {
					integrations.push('stylelint');
				}
			} catch (error) {
				this.logger.error('Error parsing package.json', error);
			}
		}

		return integrations;
	}

	/**
	 * Generate recommendations based on Prettier findings
	 */
	private generateRecommendations(
		configFile: string | undefined,
		hasDependency: boolean,
		integrations: string[],
	): AiRule[] {
		const rules: string[] = [];

		// Main rule about using Prettier
		rules.push('Use Prettier for code formatting.');

		// Add specific configuration file info if found
		if (configFile) {
			rules.push(`Prettier configuration found in: ${configFile}`);
		} else if (hasDependency) {
			// If we have the dependency but no config, suggest adding a config
			rules.push('Add a Prettier configuration file like .prettierrc.');
		}

		// Mention integrations
		if (integrations.length > 0) {
			rules.push(`Prettier is integrated with: ${integrations.join(', ')}.`);
		}

		// If using ESLint but no integration found, suggest adding it
		if (!integrations.includes('eslint')) {
			const eslintConfigPath = path.join(this.rootPath, '.eslintrc');
			const hasEslint =
				existsSync(eslintConfigPath) ||
				existsSync(path.join(this.rootPath, '.eslintrc.js')) ||
				existsSync(path.join(this.rootPath, '.eslintrc.json'));

			if (hasEslint) {
				rules.push(
					'Consider adding eslint-config-prettier to avoid conflicts between ESLint and Prettier.',
				);
			}
		}

		return [
			{
				category: Category.Prettier,
				rules,
			},
		];
	}
}
