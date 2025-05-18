import {existsSync} from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {Category, type AiRule} from '../types.js';
import {BaseScanner} from './base-scanner.js';

/**
 * Scanner to detect which testing framework is used in the project
 */
export class TestingFrameworkScanner extends BaseScanner {
	// List of common testing frameworks to check for
	private readonly testFrameworks = [
		{
			name: 'jest',
			configFiles: [
				'jest.config.js',
				'jest.config.ts',
				'jest.config.json',
				'jest.setup.js',
				'jest.setup.ts',
			],
			scriptPattern: /jest/i,
		},
		{
			name: 'mocha',
			configFiles: ['.mocharc.js', '.mocharc.json', '.mocharc.yml'],
			scriptPattern: /mocha/i,
		},
		{
			name: 'vitest',
			configFiles: ['vitest.config.js', 'vitest.config.ts'],
			scriptPattern: /vitest/i,
		},
		{
			name: 'ava',
			configFiles: ['ava.config.js', 'ava.config.cjs'],
			scriptPattern: /ava/i,
		},
		{
			name: 'jasmine',
			configFiles: ['jasmine.json', 'spec/support/jasmine.json'],
			scriptPattern: /jasmine/i,
		},
		{
			name: 'karma',
			configFiles: ['karma.conf.js', 'karma.conf.ts'],
			scriptPattern: /karma/i,
		},
		{name: 'tape', configFiles: [], scriptPattern: /tape/i},
		{name: 'chai', configFiles: [], scriptPattern: null},
		{
			name: 'qunit',
			configFiles: ['qunit.config.js'],
			scriptPattern: /qunit/i,
		},
		{
			name: 'cypress',
			configFiles: ['cypress.config.js', 'cypress.config.ts', 'cypress.json'],
			scriptPattern: /cypress/i,
		},
		{
			name: 'playwright',
			configFiles: ['playwright.config.js', 'playwright.config.ts'],
			scriptPattern: /playwright/i,
		},
		{name: 'puppeteer', configFiles: [], scriptPattern: /puppeteer/i},
		{name: 'supertest', configFiles: [], scriptPattern: null},
		{name: 'testing-library', configFiles: [], scriptPattern: null},
		{name: 'enzyme', configFiles: [], scriptPattern: null},
		{
			name: 'storybook-testing',
			configFiles: ['.storybook/test-runner.js'],
			scriptPattern: /test-storybook/i,
		},
	];

	/**
	 * Scan the project to determine which testing framework is used
	 */
	public async scan(): Promise<AiRule[]> {
		this.logger.debug('Scanning for testing frameworks');

		try {
			const detectedFrameworks: string[] = [];

			// First check config files for each framework
			const configFilesPromises = this.testFrameworks.map(async (framework) =>
				this.hasConfigFiles(framework.name, framework.configFiles).then(
					(hasConfig) => {
						if (hasConfig) {
							detectedFrameworks.push(framework.name);
						}
					},
				),
			);
			await Promise.all(configFilesPromises);

			// Then check package.json for dependencies
			const dependenciesPromises = this.testFrameworks.map(async (framework) =>
				this.hasDependency(framework.name).then((hasDependency) => {
					if (hasDependency && !detectedFrameworks.includes(framework.name)) {
						detectedFrameworks.push(framework.name);
					}
				}),
			);
			await Promise.all(dependenciesPromises);

			// Check for test scripts in package.json
			await this.checkTestScripts(detectedFrameworks);

			// Check for framework-specific patterns in the project
			await this.checkForTestingPatterns(detectedFrameworks);

			// Generate recommendations based on detected frameworks
			return this.generateRecommendations(detectedFrameworks);
		} catch (error) {
			this.logger.error('Error scanning for testing frameworks', error);
			return [];
		}
	}

	/**
	 * Check if any configuration files for a framework exist
	 */
	private async hasConfigFiles(
		frameworkName: string,
		configFiles: string[],
	): Promise<boolean> {
		if (configFiles.length === 0) {
			return false;
		}

		for (const configFile of configFiles) {
			const configPath = path.join(this.rootPath, configFile);
			if (existsSync(configPath)) {
				this.logger.debug(`Found ${frameworkName} config file: ${configFile}`);
				return true;
			}
		}

		return false;
	}

	/**
	 * Check for framework-specific patterns in the project files
	 */
	private async checkForTestingPatterns(
		detectedFrameworks: string[],
	): Promise<void> {
		// Look for test directories
		const testDirectories = ['test', 'tests', '__tests__', 'spec', 'specs'];
		let hasTestDirectory = false;

		for (const directory of testDirectories) {
			const testDirectoryPath = path.join(this.rootPath, directory);
			if (existsSync(testDirectoryPath)) {
				hasTestDirectory = true;
				break;
			}
		}

		// If no testing frameworks detected but test directories exist,
		// we might need to analyze file content to detect framework
		if (detectedFrameworks.length === 0 && hasTestDirectory) {
			this.logger.debug(
				'Found test directories but no frameworks detected yet',
			);
			// Future enhancement: analyze test file content to detect framework
		}
	}

	/**
	 * Check if a dependency exists in package.json
	 */
	private async hasDependency(dependency: string): Promise<boolean> {
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
					packageJson[field] !== null &&
					dependency in (packageJson[field] as Record<string, unknown>)
				) {
					this.logger.debug(`Found ${dependency} in ${field}`);
					return true;
				}
			}
		} catch (error) {
			this.logger.error('Error reading package.json', error);
		}

		return false;
	}

	/**
	 * Check test scripts in package.json for testing framework clues
	 */
	private async checkTestScripts(detectedFrameworks: string[]): Promise<void> {
		const packageJsonPath = path.join(this.rootPath, 'package.json');
		if (!existsSync(packageJsonPath)) {
			return;
		}

		try {
			const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
			const packageJson = JSON.parse(packageJsonContent) as Record<
				string,
				unknown
			>;

			// Check scripts section for test commands
			if (
				packageJson.scripts &&
				typeof packageJson.scripts === 'object' &&
				packageJson.scripts !== null
			) {
				const scripts = packageJson.scripts as Record<string, string>;

				// Look at test related scripts
				const testScriptKeys = Object.keys(scripts).filter(
					(key) =>
						key === 'test' || key.includes('test:') || key.startsWith('test'),
				);

				for (const scriptKey of testScriptKeys) {
					const scriptValue = scripts[scriptKey];
					this.logger.debug(
						`Found test script: ${scriptKey} -> ${scriptValue}`,
					);

					// Check if script contains any of our known test frameworks
					for (const framework of this.testFrameworks) {
						if (framework.name === 'chai' || framework.name === 'supertest') {
							// Skip assertion libraries, they wouldn't be in scripts
							continue;
						}

						if (
							scriptValue.includes(framework.name) &&
							!detectedFrameworks.includes(framework.name)
						) {
							this.logger.debug(`Detected ${framework.name} from test script`);
							detectedFrameworks.push(framework.name);
						}
					}

					// Match against some common test runner command patterns
					if (
						/ts-jest/i.test(scriptValue) &&
						!detectedFrameworks.includes('jest')
					) {
						detectedFrameworks.push('jest');
					}

					if (
						/tsx?-node-test/i.test(scriptValue) &&
						!detectedFrameworks.includes('node:test')
					) {
						// Node.js built-in test runner
						detectedFrameworks.push('node:test');
					}
				}
			}
		} catch (error) {
			this.logger.error('Error checking test scripts in package.json', error);
		}
	}

	/**
	 * Generate recommendations based on detected frameworks
	 */
	private generateRecommendations(detectedFrameworks: string[]): AiRule[] {
		if (detectedFrameworks.length === 0) {
			return [];
		}

		const rules: string[] = [];

		// Main testing framework detection
		const mainFramework = this.getMainTestingFramework(detectedFrameworks);
		if (mainFramework) {
			rules.push(`Use ${mainFramework} testing framework.`);
		}

		// Report all detected testing frameworks
		for (const framework of detectedFrameworks) {
			if (framework !== mainFramework) {
				rules.push(`Detected testing tool: ${framework}`);
			}
		}

		return [
			{
				category: Category.Testing,
				rules,
			},
		];
	}

	/**
	 * Determine the main testing framework from the detected frameworks
	 */
	private getMainTestingFramework(
		detectedFrameworks: string[],
	): string | undefined {
		// Priority order for main frameworks (unit/integration testing)
		const mainFrameworkPriority = [
			'jest',
			'vitest',
			'mocha',
			'ava',
			'jasmine',
			'tape',
			'qunit',
		];

		for (const framework of mainFrameworkPriority) {
			if (detectedFrameworks.includes(framework)) {
				return framework;
			}
		}

		return detectedFrameworks[0] || undefined;
	}
}
