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

			// If no Prettier configuration found, don't return any recommendation
			if (!configFile && !hasDependency) {
				return [];
			}

			// Generate recommendations based on the findings
			return this.generateRecommendations(configFile, hasDependency);
		} catch (error) {
			this.logger.error('Error scanning for Prettier configuration', error);
			return [];
		}
	}

	/**
	 * Helper method to check if a file exists
	 */
	private async fileExists(filePath: string): Promise<boolean> {
		try {
			await fs.access(filePath);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Find Prettier configuration file in the project
	 */
	private async findPrettierConfigFile(): Promise<string | undefined> {
		// Check for all config files one by one
		for (const fileName of this.configFileNames) {
			const filePath = path.join(this.rootPath, fileName);
			// eslint-disable-next-line no-await-in-loop
			const exists = await this.fileExists(filePath);
			if (exists) {
				return fileName;
			}
		}

		// Also check for a "prettier" key in package.json
		const packageJsonPath = path.join(this.rootPath, 'package.json');
		if (await this.fileExists(packageJsonPath)) {
			try {
				const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
				const packageJson = JSON.parse(packageJsonContent) as Record<
					string,
					unknown
				>;
				if (packageJson.prettier) {
					return 'package.json (prettier key)';
				}
			} catch (error) {
				this.logger.error('Error parsing package.json', error);
			}
		}

		return undefined;
	}

	/**
	 * Check if Prettier is a dependency in package.json
	 */
	private async hasPrettierDependency(): Promise<boolean> {
		const packageJsonPath = path.join(this.rootPath, 'package.json');
		if (await this.fileExists(packageJsonPath)) {
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
	 * Generate recommendations based on Prettier findings
	 */
	private generateRecommendations(
		configFile: string | undefined,
		hasDependency: boolean,
	): AiRule[] {
		const recommendations: AiRule[] = [];

		// Only add rules directly related to Prettier configuration
		if (configFile && hasDependency) {
			recommendations.push(
				{
					category: Category.Prettier,
					rule: 'Use Prettier for code formatting.',
				},
				{
					category: Category.Prettier,
					rule: `Prettier configuration found in: ${configFile}`,
				},
			);
		} else if (hasDependency) {
			recommendations.push({
				category: Category.Prettier,
				rule: 'Use Prettier for code formatting.',
			});
		}

		return recommendations;
	}
}
