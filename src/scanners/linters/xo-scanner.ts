import fs from 'node:fs/promises';
import path from 'node:path';
import {Category, type AiRule} from '../../types.js';
import {BaseScanner} from '../base/base-scanner.js';

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

			// If no XO configuration found, don't return any recommendations
			if (!configFile && !hasDependency) {
				return [];
			}

			// Get config either from package.json or external config file
			let config: Record<string, unknown> | undefined;

			// First try to get from external file
			if (configFile) {
				config = await this.readXoConfigFile(configFile);
			}

			// If no config from file, try package.json
			config ||= await this.getXoConfigFromPackageJson();

			// Initialize recommendations array
			const recommendations: AiRule[] = [];

			// Only add the useful rules (not redundant ones)
			if (hasDependency && config) {
				// Add essential recommendations that provide actionable information
				this.detectIndentation(config, recommendations);
				this.detectSemicolons(config, recommendations);
				this.detectPrettierIntegration(config, recommendations);
				this.detectIgnores(config, recommendations);
			}

			return recommendations;
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
				const packageJson = JSON.parse(packageJsonContent) as {
					dependencies?: Record<string, string>;
					devDependencies?: Record<string, string>;
					peerDependencies?: Record<string, string>;
				};

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
	 * Read and parse XO configuration file
	 */
	private async readXoConfigFile(
		configFile: string,
	): Promise<Record<string, unknown> | undefined> {
		try {
			const filePath = path.join(this.rootPath, configFile);
			const fileContent = await fs.readFile(filePath, 'utf8');

			// For JSON config files
			if (configFile.endsWith('.json') || configFile === '.xo-config') {
				return JSON.parse(fileContent) as Record<string, unknown>;
			}

			// For JS files, try to extract content - this is a simplified approach
			if (
				configFile.endsWith('.js') ||
				configFile.endsWith('.cjs') ||
				configFile.endsWith('.mjs')
			) {
				// Simple RegExp to extract common configuration patterns
				try {
					// Try to match module.exports pattern
					const moduleExportsMatch = /module\.exports\s*=\s*({[\s\S]*})/i.exec(
						fileContent,
					);
					if (moduleExportsMatch?.[1]) {
						// Clean the extracted text to make it valid JSON (basic approach)
						const cleanedContent = moduleExportsMatch[1]
							.replaceAll(/\/\/.*$/gm, '') // Remove single line comments
							.replaceAll(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
							.replaceAll(/,(\s*[}\]])/g, '$1') // Remove trailing commas
							.replaceAll(/(\w+):/g, '"$1":') // Quote property names
							.replaceAll("'", '"'); // Replace single quotes with double quotes

						return JSON.parse(cleanedContent) as Record<string, unknown>;
					}

					// Try to match export default pattern
					const exportDefaultMatch = /export\s+default\s*({[\s\S]*})/i.exec(
						fileContent,
					);
					if (exportDefaultMatch?.[1]) {
						const cleanedContent = exportDefaultMatch[1]
							.replaceAll(/\/\/.*$/gm, '')
							.replaceAll(/\/\*[\s\S]*?\*\//g, '')
							.replaceAll(/,(\s*[}\]])/g, '$1')
							.replaceAll(/(\w+):/g, '"$1":')
							.replaceAll("'", '"');

						return JSON.parse(cleanedContent) as Record<string, unknown>;
					}
				} catch (error) {
					this.logger.debug('Error parsing JS config file', error);
				}
			}
		} catch (error) {
			this.logger.error(`Error reading XO config file: ${configFile}`, error);
		}

		return undefined;
	}

	/**
	 * Detect indentation settings
	 */
	private detectIndentation(
		config: Record<string, unknown>,
		recommendations: AiRule[],
	): void {
		if (config.space !== undefined) {
			const indentation =
				config.space === true ||
				(typeof config.space === 'number' && config.space > 0)
					? `${typeof config.space === 'number' ? config.space : 2} spaces`
					: 'tabs';

			recommendations.push({
				category: Category.Xo,
				rule: `Use ${indentation} for indentation.`,
			});
		}
	}

	/**
	 * Detect semicolon settings
	 */
	private detectSemicolons(
		config: Record<string, unknown>,
		recommendations: AiRule[],
	): void {
		if (config.semicolon !== undefined) {
			const useSemicolons = Boolean(config.semicolon);
			recommendations.push({
				category: Category.Xo,
				rule: `${useSemicolons ? 'Use' : 'Do not use'} semicolons.`,
			});
		}
	}

	/**
	 * Detect Prettier integration
	 */
	private detectPrettierIntegration(
		config: Record<string, unknown>,
		recommendations: AiRule[],
	): void {
		if (config.prettier === true) {
			recommendations.push({
				category: Category.Xo,
				rule: 'Use XO with Prettier integration.',
			});
		}
	}

	/**
	 * Detect ignores configuration
	 */
	private detectIgnores(
		config: Record<string, unknown>,
		recommendations: AiRule[],
	): void {
		if (config.ignores && Array.isArray(config.ignores)) {
			const ignores = config.ignores as string[];
			if (ignores.length > 0) {
				recommendations.push({
					category: Category.Xo,
					rule: `Use ignores to exclude files: ${ignores.join(', ')}.`,
				});
			}
		}
	}
}
