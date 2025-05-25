import {existsSync} from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {Category, type AiRule} from '../../types.js';
import {BaseScanner} from '../base/base-scanner.js';

/**
 * Scanner to detect if NextJS is used in the project and extract configuration rules
 */
export class NextjsScanner extends BaseScanner {
	/**
	 * Scan the project to determine if NextJS is used and extract rules
	 */
	public async scan(): Promise<AiRule[]> {
		this.logger.debug('Scanning for NextJS');

		try {
			// Check if NextJS is used in the project
			if (await this.isNextjsProject()) {
				const rules: AiRule[] = [
					{
						category: Category.NextJs,
						rule: 'Use Next.js as the React framework.',
					},
				];

				// Extract configuration rules
				const configRules = await this.extractConfigRules();
				rules.push(...configRules);

				return rules;
			}

			// If NextJS is not used, return empty array
			return [];
		} catch (error) {
			this.logger.error('Error scanning for NextJS', error);
			return [];
		}
	}

	/**
	 * Check if NextJS is used in the project
	 */
	private async isNextjsProject(): Promise<boolean> {
		// Check for next.config.js or next.config.ts files
		const nextConfigFiles = [
			'next.config.js',
			'next.config.ts',
			'next.config.mjs',
			'next.config.cjs',
		];

		for (const configFile of nextConfigFiles) {
			const configPath = path.join(this.rootPath, configFile);
			if (existsSync(configPath)) {
				return true;
			}
		}

		// Check if next.js is in dependencies
		return this.hasDependency('next');
	}

	/**
	 * Check if package.json has a specific dependency
	 */
	private async hasDependency(dependencyName: string): Promise<boolean> {
		const packageJsonPath = path.join(this.rootPath, 'package.json');

		if (!existsSync(packageJsonPath)) {
			return false;
		}

		try {
			const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
			const packageJson = JSON.parse(packageJsonContent);

			// Check both dependencies and devDependencies
			return (
				packageJson.dependencies?.[dependencyName] !== undefined ||
				packageJson.devDependencies?.[dependencyName] !== undefined
			);
		} catch (error) {
			this.logger.error('Error reading package.json', error);
			return false;
		}
	}

	/**
	 * Extract configuration rules from NextJS config
	 */
	private async extractConfigRules(): Promise<AiRule[]> {
		const rules: AiRule[] = [];

		// Check for NextJS configuration file
		const nextConfigFiles = [
			'next.config.js',
			'next.config.ts',
			'next.config.mjs',
			'next.config.cjs',
		];

		let configFilePath: string | undefined;

		// Find the first existing config file
		for (const configFile of nextConfigFiles) {
			const filePath = path.join(this.rootPath, configFile);
			if (existsSync(filePath)) {
				configFilePath = filePath;
				break;
			}
		}

		if (!configFilePath) {
			return rules;
		}

		try {
			const fileContent = await fs.readFile(configFilePath, 'utf8');

			// Check for common Next.js configuration options
			// Check for React strict mode
			if (
				fileContent.includes('reactStrictMode') &&
				(fileContent.includes('reactStrictMode: true') ||
					fileContent.includes('reactStrictMode: true,') ||
					fileContent.includes('reactStrictMode:true') ||
					fileContent.includes('reactStrictMode=true'))
			) {
				rules.push({
					category: Category.NextJs,
					rule: 'Use React strict mode in Next.js.',
				});
			}

			// Check for standalone output mode
			if (
				fileContent.includes('output') &&
				(fileContent.includes("output: 'standalone'") ||
					fileContent.includes('output: "standalone"') ||
					fileContent.includes('output:"standalone"') ||
					fileContent.includes('output:"standalone",') ||
					fileContent.includes("output:'standalone'") ||
					fileContent.includes("output:'standalone',"))
			) {
				rules.push({
					category: Category.NextJs,
					rule: 'Use standalone output mode in Next.js.',
				});
			}

			// Check for i18n configuration
			if (fileContent.includes('i18n')) {
				rules.push({
					category: Category.NextJs,
					rule: 'Use internationalization (i18n) features in Next.js.',
				});
			}

			// Check for App Router configuration
			if (
				(fileContent.includes('appDir') ||
					(fileContent.includes('experimental') &&
						fileContent.includes('appDir'))) &&
				(fileContent.includes('appDir: true') ||
					fileContent.includes('appDir: true,') ||
					fileContent.includes('appDir:true') ||
					fileContent.includes('appDir:true,'))
			) {
				rules.push({
					category: Category.NextJs,
					rule: 'Use the App Router in Next.js.',
				});
			}

			// Detect if Next.js app directory structure is used
			const appDirectoryPath = path.join(this.rootPath, 'app');
			const sourceAppDirectoryPath = path.join(this.rootPath, 'src', 'app');

			if (existsSync(appDirectoryPath) || existsSync(sourceAppDirectoryPath)) {
				rules.push({
					category: Category.NextJs,
					rule: 'Use the App Router directory structure in Next.js.',
				});
			}

			// Detect if Pages Router is used
			const pagesDirectoryPath = path.join(this.rootPath, 'pages');
			const sourcePagesDirectoryPath = path.join(this.rootPath, 'src', 'pages');

			if (
				existsSync(pagesDirectoryPath) ||
				existsSync(sourcePagesDirectoryPath)
			) {
				rules.push({
					category: Category.NextJs,
					rule: 'Use the Pages Router directory structure in Next.js.',
				});
			}
		} catch (error) {
			this.logger.error(
				`Error analyzing Next.js config file: ${configFilePath}`,
				error,
			);
		}

		return rules;
	}
}
