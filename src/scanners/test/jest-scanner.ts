import {existsSync} from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {Category, type AiRule} from '../../types.js';
import {BaseScanner} from '../base/base-scanner.js';

/**
 * Scanner to detect Jest configuration in a project and generate helpful AI recommendations
 */
export class JestScanner extends BaseScanner {
	/**
	 * Common Jest configuration file names
	 */
	private readonly configFileNames = [
		'jest.config.js',
		'jest.config.ts',
		'jest.config.json',
		'jest.config.mjs',
		'jest.config.cjs',
	];

	/**
	 * Scan the project to determine if and how Jest is configured
	 */
	public async scan(): Promise<AiRule[]> {
		this.logger.debug('Scanning for Jest configuration');

		try {
			// Check for Jest configuration files
			const configFile = await this.findJestConfigFile();

			// Check if Jest is a dependency
			const hasDependency = await this.hasJestDependency();

			// If no Jest configuration found, don't return any recommendations
			if (!configFile && !hasDependency) {
				return [];
			}

			// Get config either from package.json or external config file
			let config: Record<string, unknown> | undefined;

			// First try to get from external file
			if (configFile) {
				config = await this.readJestConfigFile(configFile);
			}

			// If no config from file, try package.json
			config ||= await this.getJestConfigFromPackageJson();

			// Initialize recommendations array
			const recommendations: AiRule[] = [];

			// Add general Jest test writing guidelines
			recommendations.push({
				category: Category.Jest,
				rule: 'Use describe() blocks to group related tests, test() or it() for individual test cases. Use expect() assertions for test expectations.',
			});

			// Only add configuration-specific rules when Jest is actually configured
			if (hasDependency && config) {
				// Add essential recommendations based on configuration
				this.detectTestEnvironment(config, recommendations);
				this.detectSetupFiles(config, recommendations);
				this.detectTransform(config, recommendations);
				this.detectCoverage(config, recommendations);
				this.detectModuleNameMapper(config, recommendations);
				this.detectTestMatch(config, recommendations);
				this.detectTimers(config, recommendations);
			} else if (hasDependency) {
				// Basic recommendations when Jest is a dependency but no config
				recommendations.push({
					category: Category.Jest,
					rule: 'Place test files in __tests__ directory or alongside source files with .test.js or .spec.js suffix.',
				});
			}

			return recommendations;
		} catch (error) {
			this.logger.error('Error scanning for Jest configuration', error);
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
	 * Find Jest configuration file in the project
	 */
	private async findJestConfigFile(): Promise<string | undefined> {
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
	 * Check if Jest is a dependency in package.json
	 */
	private async hasJestDependency(): Promise<boolean> {
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

			// Check dependencies, devDependencies, and peerDependencies
			const dependencyFields = [
				'dependencies',
				'devDependencies',
				'peerDependencies',
			] as const;

			for (const field of dependencyFields) {
				if (
					packageJson[field] &&
					typeof packageJson[field] === 'object' &&
					packageJson[field] !== null
				) {
					const dependencies = packageJson[field] as Record<string, unknown>;
					// Check for jest and related packages
					if (
						'jest' in dependencies ||
						'@types/jest' in dependencies ||
						'ts-jest' in dependencies ||
						'babel-jest' in dependencies
					) {
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
	 * Extract Jest configuration from package.json
	 */
	private async getJestConfigFromPackageJson(): Promise<
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

			// Jest configuration in package.json
			if (
				packageJson.jest &&
				typeof packageJson.jest === 'object' &&
				packageJson.jest !== null
			) {
				return packageJson.jest as Record<string, unknown>;
			}
		} catch (error) {
			this.logger.error('Error reading Jest config from package.json', error);
		}

		return undefined;
	}

	/**
	 * Read and parse Jest configuration file
	 */
	private async readJestConfigFile(
		configFile: string,
	): Promise<Record<string, unknown> | undefined> {
		try {
			const filePath = path.join(this.rootPath, configFile);
			const fileContent = await fs.readFile(filePath, 'utf8');

			// For JSON files, parse directly
			if (configFile.endsWith('.json')) {
				return JSON.parse(fileContent) as Record<string, unknown>;
			}

			// For JS/TS files, try to extract content - this is a simplified approach
			if (
				configFile.endsWith('.js') ||
				configFile.endsWith('.ts') ||
				configFile.endsWith('.mjs') ||
				configFile.endsWith('.cjs')
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
					const exportDefaultMatch = /export\s+default\s+({[\s\S]*})/i.exec(
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
				} catch (parseError) {
					this.logger.warn(
						`Could not parse Jest config file content: ${configFile}`,
						parseError,
					);
				}
			}
		} catch (error) {
			this.logger.error(`Error reading Jest config file: ${configFile}`, error);
		}

		return undefined;
	}

	/**
	 * Detect test environment configuration
	 */
	private detectTestEnvironment(
		config: Record<string, unknown>,
		recommendations: AiRule[],
	): void {
		if (config.testEnvironment && typeof config.testEnvironment === 'string') {
			const environment = config.testEnvironment;

			if (environment === 'node') {
				recommendations.push({
					category: Category.Jest,
					rule: 'Tests run in Node.js environment. Use Node.js APIs and avoid browser-specific code.',
				});
			} else if (environment === 'jsdom') {
				recommendations.push({
					category: Category.Jest,
					rule: 'Tests run in jsdom environment. DOM APIs are available for testing React/Vue components.',
				});
			} else if (environment.includes('happy-dom')) {
				recommendations.push({
					category: Category.Jest,
					rule: 'Tests run in happy-dom environment. Fast DOM simulation available for component testing.',
				});
			}
		}
	}

	/**
	 * Detect setup files configuration
	 */
	private detectSetupFiles(
		config: Record<string, unknown>,
		recommendations: AiRule[],
	): void {
		if (config.setupFiles && Array.isArray(config.setupFiles)) {
			const setupFiles = config.setupFiles as string[];
			if (setupFiles.length > 0) {
				recommendations.push({
					category: Category.Jest,
					rule: `Setup files are loaded before each test file: ${setupFiles.join(', ')}. Use these for global test configuration and polyfills.`,
				});
			}
		}

		if (config.setupFilesAfterEnv && Array.isArray(config.setupFilesAfterEnv)) {
			const setupFilesAfterEnv = config.setupFilesAfterEnv as string[];
			if (setupFilesAfterEnv.length > 0) {
				recommendations.push({
					category: Category.Jest,
					rule: `Setup files loaded after test environment: ${setupFilesAfterEnv.join(', ')}. Use these for test framework configuration like jest-dom matchers.`,
				});
			}
		}
	}

	/**
	 * Detect transform configuration
	 */
	private detectTransform(
		config: Record<string, unknown>,
		recommendations: AiRule[],
	): void {
		if (config.transform && typeof config.transform === 'object') {
			const transform = config.transform as Record<string, unknown>;

			// Check for TypeScript support
			const hasTypeScriptTransform = Object.values(transform).some(
				(value) =>
					typeof value === 'string' &&
					(value.includes('ts-jest') || value.includes('babel-jest')),
			);

			if (hasTypeScriptTransform) {
				recommendations.push({
					category: Category.Jest,
					rule: 'Write tests in TypeScript. Import types from @types/jest for better type safety: import { expect, test, describe } from "@jest/globals".',
				});
			}

			// Check for Babel transform
			const hasBabelTransform = Object.values(transform).some(
				(value) => typeof value === 'string' && value.includes('babel-jest'),
			);

			if (hasBabelTransform) {
				recommendations.push({
					category: Category.Jest,
					rule: 'Use modern JavaScript syntax in tests. Babel transforms ES6+ code for Jest.',
				});
			}
		}
	}

	/**
	 * Detect coverage configuration
	 */
	private detectCoverage(
		config: Record<string, unknown>,
		recommendations: AiRule[],
	): void {
		if (config.collectCoverage === true) {
			recommendations.push({
				category: Category.Jest,
				rule: 'Code coverage is enabled. Write comprehensive tests to achieve good coverage metrics.',
			});
		}

		if (
			config.coverageThreshold &&
			typeof config.coverageThreshold === 'object'
		) {
			recommendations.push({
				category: Category.Jest,
				rule: 'Coverage thresholds are enforced. Ensure tests meet the configured coverage requirements.',
			});
		}

		if (
			config.collectCoverageFrom &&
			Array.isArray(config.collectCoverageFrom)
		) {
			const coverageFrom = config.collectCoverageFrom as string[];
			recommendations.push({
				category: Category.Jest,
				rule: `Coverage collected from: ${coverageFrom.join(', ')}. Focus testing efforts on these files.`,
			});
		}
	}

	/**
	 * Detect module name mapper configuration
	 */
	private detectModuleNameMapper(
		config: Record<string, unknown>,
		recommendations: AiRule[],
	): void {
		if (
			config.moduleNameMapper &&
			typeof config.moduleNameMapper === 'object'
		) {
			const mapper = config.moduleNameMapper as Record<string, unknown>;
			const mappings = Object.keys(mapper);

			if (mappings.length > 0) {
				recommendations.push({
					category: Category.Jest,
					rule: `Module path mapping is configured. Use mapped paths in imports: ${mappings.slice(0, 3).join(', ')}${mappings.length > 3 ? '...' : ''}.`,
				});
			}

			// Check for CSS/asset mocking
			const hasCssMocking = mappings.some(
				(key) =>
					key.includes('css') || key.includes('scss') || key.includes('sass'),
			);
			if (hasCssMocking) {
				recommendations.push({
					category: Category.Jest,
					rule: 'CSS/style imports are mocked in tests. Focus on component logic rather than styling in unit tests.',
				});
			}
		}
	}

	/**
	 * Detect test match patterns
	 */
	private detectTestMatch(
		config: Record<string, unknown>,
		recommendations: AiRule[],
	): void {
		if (config.testMatch && Array.isArray(config.testMatch)) {
			const testMatch = config.testMatch as string[];
			recommendations.push({
				category: Category.Jest,
				rule: `Test files must match patterns: ${testMatch.join(', ')}. Name test files accordingly.`,
			});
		}

		if (
			config.testPathIgnorePatterns &&
			Array.isArray(config.testPathIgnorePatterns)
		) {
			const ignorePatterns = config.testPathIgnorePatterns as string[];
			recommendations.push({
				category: Category.Jest,
				rule: `Test paths to avoid: ${ignorePatterns.join(', ')}. Don't place test files in these directories.`,
			});
		}
	}

	/**
	 * Detect timer and async configuration
	 */
	private detectTimers(
		config: Record<string, unknown>,
		recommendations: AiRule[],
	): void {
		if (config.fakeTimers && typeof config.fakeTimers === 'object') {
			recommendations.push({
				category: Category.Jest,
				rule: 'Fake timers are configured. Use jest.advanceTimersByTime() and jest.runAllTimers() to control time in tests.',
			});
		}

		if (config.testTimeout && typeof config.testTimeout === 'number') {
			const timeout = config.testTimeout;
			recommendations.push({
				category: Category.Jest,
				rule: `Test timeout is set to ${timeout}ms. Use async/await for asynchronous tests and ensure they complete within the timeout.`,
			});
		}
	}
}
