import fs from 'node:fs/promises';
import path from 'node:path';
import type {Recommendation} from '../types.js';
import {BaseScanner} from './base-scanner.js';

/**
 * Scanner to detect which package manager is used in the project
 */
export class PackageManagerScanner extends BaseScanner {
	private readonly packageManagerFiles = {
		npm: 'package-lock.json',
		yarn: 'yarn.lock',
		pnpm: 'pnpm-lock.yaml',
	};

	/**
	 * Scan the project to determine which package manager is used
	 */
	public async scan(): Promise<Recommendation[]> {
		this.logger.debug('Scanning for package manager');

		try {
			// First check if package.json has packageManager field
			const packageJsonPath = path.join(this.rootPath, 'package.json');
			const packageJsonExists = await this.fileExists(packageJsonPath);

			if (packageJsonExists) {
				const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
				const packageJson = JSON.parse(packageJsonContent) as Record<
					string,
					unknown
				>;

				if (
					packageJson.packageManager &&
					typeof packageJson.packageManager === 'string'
				) {
					const packageManagerName = packageJson.packageManager.split('@')[0];
					return [
						{
							category: 'Package Manager',
							recommendations: [
								`Use ${packageManagerName} as the package manager.`,
							],
						},
					];
				}
			}

			// If no packageManager field, check for lock files
			const lockFileEntries = Object.entries(this.packageManagerFiles);

			// Check all lock files in parallel
			const lockFileChecks = await Promise.all(
				lockFileEntries.map(async ([managerName, lockFile]) => {
					const lockFilePath = path.join(this.rootPath, lockFile);
					const exists = await this.fileExists(lockFilePath);
					return {managerName, exists};
				}),
			);

			// Find the first lock file that exists
			const foundManager = lockFileChecks.find((check) => check.exists);
			if (foundManager) {
				return [
					{
						category: 'Package Manager',
						recommendations: [
							`Use ${foundManager.managerName} as the package manager.`,
						],
					},
				];
			}

			// If no lock file found, assume npm
			return [
				{
					category: 'Package Manager',
					recommendations: ['Use npm as the package manager.'],
				},
			];
		} catch (error) {
			this.logger.error('Error scanning for package manager', error);
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
}
