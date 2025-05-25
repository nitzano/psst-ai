import {existsSync} from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {Category, type AiRule} from '../../types.js';
import {BaseScanner} from '../base/base-scanner.js';

/**
 * Scanner to detect AVA configuration in a project and generate helpful AI recommendations
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

			// Add general AVA test writing guidelines
			recommendations.push({
				category: Category.Ava,
				rule: 'Import test from "ava" and use descriptive test names. Use t.is() for equality, t.true()/t.false() for booleans, t.throws() for error testing.',
			});

			// Only add configuration-specific rules when AVA is actually configured
			if (hasDependency && config) {
				// Add essential recommendations based on configuration
				this.detectFilePattern(config, recommendations);
				this.detectTestTypes(config, recommendations);
				this.detectAsync(config, recommendations);
				this.detectTypeScript(config, recommendations);
				this.detectRequire(config, recommendations);
				this.detectMatch(config, recommendations);
				this.detectTimeouts(config, recommendations);
			} else if (hasDependency) {
				// Basic recommendations when AVA is a dependency but no config
				recommendations.push({
					category: Category.Ava,
					rule: 'Place test files in test/ directory or alongside source files with .test.js or .spec.js suffix.',
				});
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
	 * Detect file pattern settings and provide helpful guidance
	 */
	private detectFilePattern(
		config: Record<string, unknown>,
		recommendations: AiRule[],
	): void {
		if (config.files && Array.isArray(config.files)) {
			const files = config.files as string[];
			if (files.length > 0) {
				const includePatterns = files.filter(
					(pattern) => !pattern.startsWith('!'),
				);
				const excludePatterns = files.filter((pattern) =>
					pattern.startsWith('!'),
				);

				if (includePatterns.length > 0) {
					recommendations.push({
						category: Category.Ava,
						rule: `Place test files in: ${includePatterns.join(', ')}. Use descriptive filenames ending with .test.js or .spec.js.`,
					});
				}

				if (excludePatterns.length > 0) {
					recommendations.push({
						category: Category.Ava,
						rule: `Avoid placing test files in: ${excludePatterns.map((p) => p.slice(1)).join(', ')}. These directories are excluded from test discovery.`,
					});
				}
			}
		} else {
			// Default AVA patterns
			recommendations.push({
				category: Category.Ava,
				rule: 'Place test files in test/ directory or alongside source files with .test.js or .spec.js suffix.',
			});
		}
	}

	/**
	 * Detect test types based on match patterns
	 */
	private detectTestTypes(
		config: Record<string, unknown>,
		recommendations: AiRule[],
	): void {
		if (config.match && Array.isArray(config.match)) {
			const matches = config.match as string[];
			const includePatterns = matches.filter((m) => !m.startsWith('!'));
			const excludePatterns = matches.filter((m) => m.startsWith('!'));

			if (includePatterns.some((p) => p.includes('integration'))) {
				recommendations.push({
					category: Category.Ava,
					rule: 'Write integration tests that test multiple components working together. Use "integration" in test names or filenames.',
				});
			}

			if (includePatterns.some((p) => p.includes('unit'))) {
				recommendations.push({
					category: Category.Ava,
					rule: 'Write unit tests that test individual functions or components in isolation. Use "unit" in test names or filenames.',
				});
			}

			if (excludePatterns.some((p) => p.includes('unit'))) {
				recommendations.push({
					category: Category.Ava,
					rule: 'Focus on integration tests rather than unit tests. Avoid "unit" in test names based on current configuration.',
				});
			}

			if (
				includePatterns.some(
					(p) => p.includes('e2e') || p.includes('end-to-end'),
				)
			) {
				recommendations.push({
					category: Category.Ava,
					rule: 'Write end-to-end tests that test complete user workflows. Use "e2e" or "end-to-end" in test names.',
				});
			}
		}
	}

	/**
	 * Detect async/await patterns
	 */
	private detectAsync(
		config: Record<string, unknown>,
		recommendations: AiRule[],
	): void {
		// Check for timeout configuration which suggests async tests
		if (config.timeout) {
			recommendations.push({
				category: Category.Ava,
				rule: 'Use async/await for asynchronous tests. AVA automatically handles promise-based tests. Consider using t.timeout() for individual test timeouts.',
			});
		}
	}

	/**
	 * Detect TypeScript configuration and provide guidance
	 */
	private detectTypeScript(
		config: Record<string, unknown>,
		recommendations: AiRule[],
	): void {
		if (config.typescript && typeof config.typescript === 'object') {
			const tsConfig = config.typescript as Record<string, unknown>;

			recommendations.push({
				category: Category.Ava,
				rule: 'Write tests in TypeScript. Import type ExecutionContext from "ava" for test context typing: test("name", (t: ExecutionContext) => { ... }).',
			});

			if (tsConfig.rewritePaths && typeof tsConfig.rewritePaths === 'object') {
				recommendations.push({
					category: Category.Ava,
					rule: 'Import from source paths (e.g., src/) in tests - AVA will automatically rewrite paths to compiled JavaScript.',
				});
			}
		}
	}

	/**
	 * Detect require configuration for setup files
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
					rule: `Setup files are automatically loaded: ${requires.join(', ')}. Use these for global test setup, mocks, or environment configuration.`,
				});
			}
		}
	}

	/**
	 * Detect timeout configuration
	 */
	private detectTimeouts(
		config: Record<string, unknown>,
		recommendations: AiRule[],
	): void {
		if (config.timeout !== undefined) {
			const timeout = config.timeout;
			recommendations.push({
				category: Category.Ava,
				rule: `Default test timeout is ${String(timeout)}. For longer-running tests, use t.timeout(ms) to override individual test timeouts.`,
			});
		}
	}

	/**
	 * Detect match configuration for test selection
	 */
	private detectMatch(
		config: Record<string, unknown>,
		recommendations: AiRule[],
	): void {
		if (config.match && Array.isArray(config.match)) {
			const matches = config.match as string[];
			const includePatterns = matches.filter((m) => !m.startsWith('!'));
			const excludePatterns = matches.filter((m) => m.startsWith('!'));

			if (includePatterns.length > 0) {
				recommendations.push({
					category: Category.Ava,
					rule: `Tests must match patterns: ${includePatterns.join(', ')}. Include these keywords in test names to ensure they run.`,
				});
			}

			if (excludePatterns.length > 0) {
				recommendations.push({
					category: Category.Ava,
					rule: `Avoid these patterns in test names: ${excludePatterns.map((p) => p.slice(1)).join(', ')}. Tests matching these patterns will be skipped.`,
				});
			}
		}
	}
}
