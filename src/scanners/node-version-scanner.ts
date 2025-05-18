// Filepath: /home/nitzano/work/psst-ai/src/scanners/node-version-scanner.ts
import fs from 'node:fs/promises';
import path from 'node:path';
import {Category, type AiRule} from '../types.js';
import {BaseScanner} from './base-scanner.js';

/**
 * Scanner to detect which Node.js version is used in the project
 */
export class NodeVersionScanner extends BaseScanner {
	/**
	 * Scan the project to determine which Node.js version is used
	 */
	public async scan(): Promise<AiRule[]> {
		this.logger.debug('Scanning for Node.js version');

		try {
			// Note: .nvmrc check is now handled by NvmrcScanner

			// Check package.json for engines field
			const packageJsonPath = path.join(this.rootPath, 'package.json');
			if (await this.fileExists(packageJsonPath)) {
				const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
				const packageJson = JSON.parse(packageJsonContent) as Record<
					string,
					unknown
				>;

				if (
					packageJson.engines &&
					typeof packageJson.engines === 'object' &&
					packageJson.engines !== null &&
					'node' in packageJson.engines
				) {
					const nodeEngines = packageJson.engines as Record<string, unknown>;
					const nodeVersion = String(nodeEngines.node);

					return [
						{
							category: Category.NodeVersion,
							rules: [
								`Use Node.js version ${nodeVersion} as specified in package.json.`,
							],
						},
					];
				}
			}

			// If no version specified, recommend using LTS
			return [
				{
					category: Category.NodeVersion,
					rules: ['Use the latest LTS version of Node.js.'],
				},
			];
		} catch (error) {
			this.logger.error('Error scanning for Node.js version', error);
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
