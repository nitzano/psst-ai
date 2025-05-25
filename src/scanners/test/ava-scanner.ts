import {existsSync} from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {Category, type AiRule} from '../../types.js';
import {BaseScanner} from '../base/base-scanner.js';

/**
 * Scanner to detect AVA configuration in a project
 */
export class AvaScanner extends BaseScanner {
	/**
	 * Common AVA configuration file names
	 */
	private readonly configFileNames = [
		'ava.config.js',
		'ava.config.cjs',
		'ava.config.mjs',
	];

	/**
	 * Scan the project to determine if and how AVA is configured
	 */
	public async scan(): Promise<AiRule[]> {
		this.logger.debug('Scanning for AVA configuration');

		try {
			// Check for AVA configuration files
			const configFile = await this.findAvaConfigFile();

			// Check if AVA is a dependency
			const hasDependency = await this.hasAvaDependency();

			// If no AVA configuration found, don't return any recommendations
			if (!configFile && !hasDependency) {
				return [];
			}

			// Get config either from package.json or external config file
			let config: Record<string, unknown> | undefined;

			// First try to get from external file
			if (configFile) {
				config = await this.readAvaConfigFile(configFile);
			}

			// If no config from file, try package.json
			config ||= await this.getAvaConfigFromPackageJson();

			// Initialize recommendations array
			const recommendations: AiRule[] = [];

			// Only add useful rules when AVA is actually configured
			if (hasDependency && config) {
				// Add essential recommendations based on configuration
				this.detectFilePattern(config, recommendations);
				this.detectConcurrency(config, recommendations);
				this.detectTimeout(config, recommendations);
				this.detectTypeScript(config, recommendations);
				this.detectRequire(config, recommendations);
				this.detectBabel(config, recommendations);
				this.detectMatch(config, recommendations);
				this.detectVerbose(config, recommendations);
				this.detectWatchMode(config, recommendations);
			}

			return recommendations;
		} catch (error) {
			this.logger.error('Error scanning for AVA configuration', error);
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
	 * Find AVA configuration file in the project
	 */
	private async findAvaConfigFile(): Promise<string | undefined> {
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
	 * Check if AVA is a dependency in package.json
	 */
	private async hasAvaDependency(): Promise<boolean> {
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

			// Check devDependencies and dependencies for ava
			const dependencyFields = ['dependencies', 'devDependencies'] as const;

			for (const field of dependencyFields) {
				if (
					packageJson[field] &&
					typeof packageJson[field] === 'object' &&
					packageJson[field] !== null &&
					'ava' in (packageJson[field] as Record<string, unknown>)
				) {
					return true;
				}
			}
		} catch (error) {
			this.logger.error('Error reading package.json', error);
		}

		return false;
	}

	/**
	 * Extract AVA configuration from package.json
	 */
	private async getAvaConfigFromPackageJson(): Promise<
		Record<string, unknown> | undefined
	> {
		const packageJsonPath = path.join(this.rootPath, 'package.json');
		if (!existsSync(packageJsonPath)) {
			return undefined;
		}

		try {
			const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
			const packageJson = JSON.parse(packageJsonContent) as Record<
				string,
				unknown
			>;

			// Check if there's an 'ava' section in package.json
			if (
				packageJson.ava &&
				typeof packageJson.ava === 'object' &&
				packageJson.ava !== null
			) {
				return packageJson.ava as Record<string, unknown>;
			}
		} catch (error) {
			this.logger.error('Error reading package.json', error);
		}

		return undefined;
	}

	/**
	 * Read and parse AVA configuration file
	 */
	private async readAvaConfigFile(
		configFile: string,
	): Promise<Record<string, unknown> | undefined> {
		try {
			const filePath = path.join(this.rootPath, configFile);
			const fileContent = await fs.readFile(filePath, 'utf8');

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
			this.logger.error(`Error reading AVA config file: ${configFile}`, error);
		}

		return undefined;
	}

	/**
	 * Detect file pattern settings
	 */
	private detectFilePattern(
		config: Record<string, unknown>,
		recommendations: AiRule[],
	): void {
		if (config.files && Array.isArray(config.files)) {
			const files = config.files as string[];
			if (files.length > 0) {
				recommendations.push({
					category: Category.Ava,
					rule: `Configure test file patterns: ${files.join(', ')}.`,
				});
			}
		}
	}

	/**
	 * Detect concurrency settings
	 */
	private detectConcurrency(
		config: Record<string, unknown>,
		recommendations: AiRule[],
	): void {
		if (config.concurrency !== undefined) {
			const concurrency = config.concurrency;
			if (typeof concurrency === 'number') {
				recommendations.push({
					category: Category.Ava,
					rule: `Set test concurrency to ${concurrency}.`,
				});
			} else if (concurrency === false) {
				recommendations.push({
					category: Category.Ava,
					rule: 'Disable test concurrency (run tests serially).',
				});
			}
		}
	}

	/**
	 * Detect timeout settings
	 */
	private detectTimeout(
		config: Record<string, unknown>,
		recommendations: AiRule[],
	): void {
		if (config.timeout !== undefined) {
			const timeout = config.timeout;
			if (typeof timeout === 'string' || typeof timeout === 'number') {
				recommendations.push({
					category: Category.Ava,
					rule: `Set test timeout to ${timeout}.`,
				});
			}
		}
	}

	/**
	 * Detect TypeScript configuration
	 */
	private detectTypeScript(
		config: Record<string, unknown>,
		recommendations: AiRule[],
	): void {
		if (config.typescript && typeof config.typescript === 'object') {
			const tsConfig = config.typescript as Record<string, unknown>;

			if (tsConfig.rewritePaths && typeof tsConfig.rewritePaths === 'object') {
				recommendations.push({
					category: Category.Ava,
					rule: 'Configure TypeScript path rewriting for AVA.',
				});
			}

			if (tsConfig.compile !== false) {
				recommendations.push({
					category: Category.Ava,
					rule: 'Enable TypeScript compilation for AVA tests.',
				});
			}
		}
	}

	/**
	 * Detect require configuration
	 */
	private detectRequire(
		config: Record<string, unknown>,
		recommendations: AiRule[],
	): void {
		if (config.require && Array.isArray(config.require)) {
			const requires = config.require as string[];
			if (requires.length > 0) {
				recommendations.push({
					category: Category.Ava,
					rule: `Configure required modules: ${requires.join(', ')}.`,
				});
			}
		}
	}

	/**
	 * Detect Babel configuration
	 */
	private detectBabel(
		config: Record<string, unknown>,
		recommendations: AiRule[],
	): void {
		if (config.babel && typeof config.babel === 'object') {
			const babelConfig = config.babel as Record<string, unknown>;

			if (babelConfig.testOptions || babelConfig.extensions) {
				recommendations.push({
					category: Category.Ava,
					rule: 'Configure Babel for AVA tests.',
				});
			}
		}
	}

	/**
	 * Detect match configuration
	 */
	private detectMatch(
		config: Record<string, unknown>,
		recommendations: AiRule[],
	): void {
		if (config.match && Array.isArray(config.match)) {
			const matches = config.match as string[];
			if (matches.length > 0) {
				recommendations.push({
					category: Category.Ava,
					rule: `Configure test matching patterns: ${matches.join(', ')}.`,
				});
			}
		}
	}

	/**
	 * Detect verbose mode
	 */
	private detectVerbose(
		config: Record<string, unknown>,
		recommendations: AiRule[],
	): void {
		if (config.verbose === true) {
			recommendations.push({
				category: Category.Ava,
				rule: 'Enable verbose test output in AVA.',
			});
		}
	}

	/**
	 * Detect watch mode configuration
	 */
	private detectWatchMode(
		config: Record<string, unknown>,
		recommendations: AiRule[],
	): void {
		if (config.watchMode && typeof config.watchMode === 'object') {
			const watchConfig = config.watchMode as Record<string, unknown>;

			if (
				watchConfig.ignoreChanges &&
				Array.isArray(watchConfig.ignoreChanges)
			) {
				const ignored = watchConfig.ignoreChanges as string[];
				if (ignored.length > 0) {
					recommendations.push({
						category: Category.Ava,
						rule: `Configure watch mode to ignore: ${ignored.join(', ')}.`,
					});
				}
			}
		}
	}
}
