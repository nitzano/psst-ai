import {existsSync} from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {Category, type AiRule} from '../types.js';
import {BaseScanner} from './base-scanner.js';

/**
 * Scanner to detect which linting tool is used in the project
 */
export class LintingScanner extends BaseScanner {
	/**
	 * Scan the project to determine which linting tool is used
	 */
	public async scan(): Promise<AiRule[]> {
		this.logger.debug('Scanning for linting tools');

		try {
			// Check if xo is used
			if (await this.hasXo()) {
				return [
					{
						category: Category.Linting,
						rule: 'Use xo for linting.',
					},
				];
			}

			// Check if eslint is used
			if (await this.hasEslint()) {
				return [
					{
						category: Category.Linting,
						rule: 'Use eslint for linting.',
					},
				];
			}

			// Check if tslint is used
			if (await this.hasTslint()) {
				return [
					{
						category: Category.Linting,
						rule: 'Use tslint for linting.',
					},
				];
			}

			// If no linting tool detected, don't return any recommendation
			return [];
		} catch (error) {
			this.logger.error('Error scanning for linting tools', error);
			return [];
		}
	}

	/**
	 * Check if xo is used
	 */
	private async hasXo(): Promise<boolean> {
		// Check for xo config file
		const xoConfigPath = path.join(this.rootPath, 'xo.config.js');
		if (existsSync(xoConfigPath)) {
			return true;
		}

		// Check package.json for xo dependency
		return this.hasDependency('xo');
	}

	/**
	 * Check if eslint is used
	 */
	private async hasEslint(): Promise<boolean> {
		// Check for eslint config files
		const eslintConfigFiles = [
			'.eslintrc',
			'.eslintrc.js',
			'.eslintrc.json',
			'.eslintrc.yml',
			'.eslintrc.yaml',
		];

		for (const configFile of eslintConfigFiles) {
			const configPath = path.join(this.rootPath, configFile);
			if (existsSync(configPath)) {
				return true;
			}
		}

		// Check package.json for eslint dependency
		return this.hasDependency('eslint');
	}

	/**
	 * Check if tslint is used
	 */
	private async hasTslint(): Promise<boolean> {
		// Check for tslint config file
		const tslintConfigPath = path.join(this.rootPath, 'tslint.json');
		if (existsSync(tslintConfigPath)) {
			return true;
		}

		// Check package.json for tslint dependency
		return this.hasDependency('tslint');
	}

	/**
	 * Check if package.json has a specific dependency
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
					return true;
				}
			}
		} catch (error) {
			this.logger.error('Error reading package.json', error);
		}

		return false;
	}
}
