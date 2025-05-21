import fs from 'node:fs/promises';
import path from 'node:path';
import {Category, type AiRule} from '../types.js';
import {BaseScanner} from './base-scanner.js';

/**
 * Scanner to detect if the project uses .nvmrc for Node.js version management
 */
export class NvmrcScanner extends BaseScanner {
	/**
	 * Scan the project to determine if .nvmrc is used
	 */
	public async scan(): Promise<AiRule[]> {
		this.logger.debug('Scanning for .nvmrc file');

		try {
			// Check for .nvmrc file
			const nvmrcPath = path.join(this.rootPath, '.nvmrc');
			if (await this.fileExists(nvmrcPath)) {
				const nvmrcContent = await fs.readFile(nvmrcPath, 'utf8');
				const nodeVersion = nvmrcContent.trim();
				return [
					{
						category: Category.NodeVersion,
						rule: `Use the nodejs version specified in the .nvmrc file (${nodeVersion}).`,
					},
				];
			}

			// No .nvmrc file found
			return [];
		} catch (error) {
			this.logger.error('Error scanning for .nvmrc file', error);
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
