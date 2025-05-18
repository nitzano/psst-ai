import {existsSync} from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {Category, type Recommendation} from '../types.js';
import {BaseScanner} from './base-scanner.js';

/**
 * Scanner to detect which package manager is used in the project
 */
export class PackageManagerScanner extends BaseScanner {
	/**
	 * Scan the project to determine which package manager is used
	 */
	public async scan(): Promise<Recommendation[]> {
		this.logger.debug('Scanning for package manager');

		try {
			// First check if package.json has packageManager field
			const packageManagerFromJson =
				await this.getPackageManagerFromPackageJson();
			if (packageManagerFromJson) {
				return [
					{
						category: Category.PackageManager,
						recommendations: [
							`Use ${packageManagerFromJson} as the package manager.`,
						],
					},
				];
			}

			// If no packageManager field, check for lock files
			if (this.isPnpm()) {
				return [
					{
						category: Category.PackageManager,
						recommendations: ['Use pnpm as the package manager.'],
					},
				];
			}

			if (this.isYarn()) {
				return [
					{
						category: Category.PackageManager,
						recommendations: ['Use yarn as the package manager.'],
					},
				];
			}

			if (this.isNpm()) {
				return [
					{
						category: Category.PackageManager,
						recommendations: ['Use npm as the package manager.'],
					},
				];
			}

			// If no lock file found, assume npm
			return [
				{
					category: Category.PackageManager,
					recommendations: ['Use npm as the package manager.'],
				},
			];
		} catch (error) {
			this.logger.error('Error scanning for package manager', error);
			return [];
		}
	}

	/**
	 * Check if npm is used based on lock file presence
	 */
	private isNpm(): boolean {
		const lockFilePath = path.join(this.rootPath, 'package-lock.json');
		return existsSync(lockFilePath);
	}

	/**
	 * Check if yarn is used based on lock file presence
	 */
	private isYarn(): boolean {
		const lockFilePath = path.join(this.rootPath, 'yarn.lock');
		return existsSync(lockFilePath);
	}

	/**
	 * Check if pnpm is used based on lock file presence
	 */
	private isPnpm(): boolean {
		const lockFilePath = path.join(this.rootPath, 'pnpm-lock.yaml');
		return existsSync(lockFilePath);
	}

	/**
	 * Check if package.json has packageManager field and return the name
	 */
	private async getPackageManagerFromPackageJson(): Promise<
		string | undefined
	> {
		const packageJsonPath = path.join(this.rootPath, 'package.json');
		const packageJsonExists = existsSync(packageJsonPath);

		if (!packageJsonExists) {
			return undefined;
		}

		try {
			const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
			const packageJson = JSON.parse(packageJsonContent) as Record<
				string,
				unknown
			>;

			if (
				packageJson.packageManager &&
				typeof packageJson.packageManager === 'string'
			) {
				return packageJson.packageManager.split('@')[0];
			}
		} catch (error) {
			this.logger.error('Error reading package.json', error);
		}

		return undefined;
	}
}
