import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {logger} from './logger.js';

const serviceLogger = logger.getLogger('PackageInfo');

// Define type for package.json structure
type PackageJson = {
	[key: string]: unknown;
	version?: string;
};

/**
 * Get the current package version
 * @returns Package version
 */
export const getVersion = (): string => {
	try {
		// Get the directory path of the current module
		const __filename = fileURLToPath(import.meta.url);
		const __dirname = path.dirname(__filename);

		// Navigate to project root (2 levels up from services directory)
		const packageJsonPath = path.resolve(__dirname, '../../package.json');

		if (fs.existsSync(packageJsonPath)) {
			const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
			const packageJson = JSON.parse(packageJsonContent) as PackageJson;
			return packageJson.version ?? '1.0.0';
		}

		return '1.0.0';
	} catch (error) {
		serviceLogger.error('Failed to retrieve package version', error);
		return '1.0.0';
	}
};

// Export for backward compatibility
export const packageInfo = {
	getVersion,
};
