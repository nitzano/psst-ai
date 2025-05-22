import {existsSync} from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {Category, type AiRule} from '../../types.js';
import {BaseScanner} from '../base-scanner.js';

/**
 * Scanner to detect XO linting configuration in a project
 */
export class XoScanner extends BaseScanner {
	/**
	 * Common XO configuration file names
	 */
	private readonly configFileNames = [
		'xo.config.js',
		'xo.config.cjs',
		'xo.config.mjs',
		'.xo-config.js',
		'.xo-config',
		'.xo-config.json',
	];

	/**
	 * Scan the project to determine if and how XO is configured
	 */
	public async scan(): Promise<AiRule[]> {
		this.logger.debug('Scanning for XO configuration');

		try {
			// Check for XO configuration files
			const configFile = await this.findXoConfigFile();

			// Check if XO is a dependency
			const hasDependency = await this.hasXoDependency();

			// If no XO configuration found, don't return any recommendation
			if (!configFile && !hasDependency) {
				return [];
			}

			// Check for XO configuration in package.json
			const packageJsonConfig = await this.getXoConfigFromPackageJson();

			// Generate recommendations based on the findings
			return this.generateRecommendations(
				configFile,
				hasDependency,
				packageJsonConfig,
			);
		} catch (error) {
			this.logger.error('Error scanning for XO configuration', error);
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
	 * Find XO configuration file in the project
	 */
	private async findXoConfigFile(): Promise<string | undefined> {
		// Check for all config files one by one
		for (const fileName of this.configFileNames) {
			const filePath = path.join(this.rootPath, fileName);
			// eslint-disable-next-line no-await-in-loop
			const exists = await this.fileExists(filePath);
			if (exists) {
				return fileName;
			}
		}

		return undefined;
	}

	/**
	 * Check if XO is a dependency in package.json
	 */
	private async hasXoDependency(): Promise<boolean> {
		const packageJsonPath = path.join(this.rootPath, 'package.json');
		if (await this.fileExists(packageJsonPath)) {
			try {
				const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
				const packageJson = JSON.parse(packageJsonContent);

				const allDependencies = {
					...packageJson.dependencies,
					...packageJson.devDependencies,
					...packageJson.peerDependencies,
				};

				return 'xo' in allDependencies;
			} catch (error) {
				this.logger.error('Error parsing package.json', error);
			}
		}

		return false;
	}

	/**
	 * Extract XO configuration from package.json
	 */
	private async getXoConfigFromPackageJson(): Promise<
		Record<string, unknown> | undefined
	> {
		const packageJsonPath = path.join(this.rootPath, 'package.json');
		if (await this.fileExists(packageJsonPath)) {
			try {
				const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
				const packageJson = JSON.parse(packageJsonContent) as Record<
					string,
					unknown
				>;

				if (packageJson.xo && typeof packageJson.xo === 'object') {
					return packageJson.xo as Record<string, unknown>;
				}
			} catch (error) {
				this.logger.error('Error parsing package.json', error);
			}
		}

		return undefined;
	}

	/**
	 * Generate recommendations based on XO findings
	 */
	private generateRecommendations(
		configFile: string | undefined,
		hasDependency: boolean,
		packageJsonConfig: Record<string, unknown> | undefined,
	): AiRule[] {
		const recommendations: AiRule[] = [];

		// Add main rule for using XO
		if (hasDependency) {
			recommendations.push({
				category: Category.XoLinting,
				rule: 'Use xo for linting.',
			});

			// Add rule for configuration location
			if (configFile) {
				recommendations.push({
					category: Category.XoLinting,
					rule: `XO configuration found in: ${configFile}`,
				});
			} else if (packageJsonConfig) {
				recommendations.push({
					category: Category.XoLinting,
					rule: 'XO configuration found in package.json',
				});
			}

			// Add rules for specific XO config options
			if (packageJsonConfig) {
				this.addConfigRules(packageJsonConfig, recommendations);
			}
		}

		return recommendations;
	}

	/**
	 * Add specific rules based on XO configuration
	 */
	private addConfigRules(
		config: Record<string, unknown>,
		recommendations: AiRule[],
	): void {
		// Check for space vs tabs
		if (config.space !== undefined) {
			const indentation =
				config.space === true ||
				(typeof config.space === 'number' && config.space > 0)
					? `${typeof config.space === 'number' ? config.space : 2} spaces`
					: 'tabs';

			recommendations.push({
				category: Category.XoLinting,
				rule: `Use ${indentation} for indentation.`,
			});
		}

		// Check for semicolons setting
		if (config.semicolon !== undefined) {
			const useSemicolons = Boolean(config.semicolon);
			recommendations.push({
				category: Category.XoLinting,
				rule: `${useSemicolons ? 'Use' : 'Do not use'} semicolons.`,
			});
		}

		// Check for prettier integration
		if (config.prettier !== undefined) {
			recommendations.push({
				category: Category.XoLinting,
				rule: 'Use XO with Prettier integration.',
			});
		}

		// Check for specific environments
		if (config.envs && Array.isArray(config.envs)) {
			const environments = config.envs as string[];
			if (environments.length > 0) {
				recommendations.push({
					category: Category.XoLinting,
					rule: `XO configured for environments: ${environments.join(', ')}.`,
				});
			}
		}

		// Check for TypeScript support
		if (config.typescript !== undefined) {
			recommendations.push({
				category: Category.XoLinting,
				rule: 'Use XO with TypeScript support.',
			});
		}
	}
}
