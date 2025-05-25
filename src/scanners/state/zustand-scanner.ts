import {existsSync} from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {Category, type AiRule} from '../../types.js';
import {BaseScanner} from '../base/base-scanner.js';

/**
 * Scanner to detect Zustand store patterns and configurations in a project
 */
export class ZustandScanner extends BaseScanner {
	/**
	 * Common Zustand store file patterns
	 */
	private readonly storeFilePatterns = [
		'**/store.{js,ts}',
		'**/stores/**/*.{js,ts}',
		'**/zustand/**/*.{js,ts}',
		'**/*store.{js,ts}',
		'**/*Store.{js,ts}',
	];

	/**
	 * Scan the project to determine if and how Zustand is configured
	 */
	public async scan(): Promise<AiRule[]> {
		this.logger.debug('Scanning for Zustand configuration');

		try {
			// Check if Zustand is a dependency
			const hasDependency = await this.hasZustandDependency();

			// If no Zustand dependency found, don't return any recommendations
			if (!hasDependency) {
				return [];
			}

			// Initialize recommendations array
			const recommendations: AiRule[] = [];

			// Add general Zustand usage guidelines
			recommendations.push({
				category: Category.Zustand,
				rule: 'Use Zustand for lightweight state management. Keep stores small and focused on specific domains.',
			});

			// Check for store files and analyze patterns
			const storeFiles = await this.findStoreFiles();
			if (storeFiles.length > 0) {
				await this.analyzeStoreFiles(storeFiles, recommendations);
			}

			// Check for middleware usage
			await this.checkMiddleware(recommendations);

			// Check for persistence patterns
			await this.checkPersistence(recommendations);

			return recommendations;
		} catch (error) {
			this.logger.error('Error scanning for Zustand configuration', error);
			return [];
		}
	}

	/**
	 * Check if Zustand is a dependency in package.json
	 */
	private async hasZustandDependency(): Promise<boolean> {
		try {
			const packageJsonPath = path.join(this.rootPath, 'package.json');
			const content = await fs.readFile(packageJsonPath, 'utf8');
			const packageJson = JSON.parse(content) as {
				dependencies?: Record<string, string>;
				devDependencies?: Record<string, string>;
			};

			const dependencyTypes = ['dependencies', 'devDependencies'] as const;
			for (const dependencyType of dependencyTypes) {
				const dependencies = packageJson[dependencyType];
				if (dependencies && 'zustand' in dependencies) {
					this.logger.debug(`Found Zustand in ${dependencyType}`);
					return true;
				}
			}
		} catch (error) {
			this.logger.error('Error reading package.json', error);
		}

		return false;
	}

	/**
	 * Find store files in the project
	 */
	private async findStoreFiles(): Promise<string[]> {
		const storeFiles: string[] = [];

		// Check common store file locations
		const commonPaths = [
			'src/store',
			'src/stores',
			'store',
			'stores',
			'lib/store',
			'lib/stores',
			'utils/store',
			'utils/stores',
		];

		const pathPromises = commonPaths.map(async (commonPath) => {
			const fullPath = path.join(this.rootPath, commonPath);
			if (existsSync(fullPath)) {
				try {
					const files = await this.getFilesRecursively(fullPath);
					return files.filter(
						(file) => file.endsWith('.js') || file.endsWith('.ts'),
					);
				} catch (error) {
					this.logger.error(`Error reading directory ${fullPath}`, error);
					return [];
				}
			}

			return [];
		});

		const pathResults = await Promise.all(pathPromises);
		for (const files of pathResults) {
			storeFiles.push(...files);
		}

		// Also check for files with 'store' in their name in src directory
		const sourcePath = path.join(this.rootPath, 'src');
		if (existsSync(sourcePath)) {
			try {
				const files = await this.getFilesRecursively(sourcePath);
				const storeNamedFiles = files.filter(
					(file) =>
						(file.includes('store') || file.includes('Store')) &&
						(file.endsWith('.js') || file.endsWith('.ts')),
				);
				storeFiles.push(...storeNamedFiles);
			} catch (error) {
				this.logger.error(`Error reading src directory`, error);
			}
		}

		return [...new Set(storeFiles)]; // Remove duplicates
	}

	/**
	 * Get all files recursively from a directory
	 */
	private async getFilesRecursively(directoryPath: string): Promise<string[]> {
		const files: string[] = [];

		try {
			const entries = await fs.readdir(directoryPath, {withFileTypes: true});

			const entryPromises = entries.map(async (entry) => {
				const fullPath = path.join(directoryPath, entry.name);

				if (entry.isDirectory()) {
					return this.getFilesRecursively(fullPath);
				}

				return [fullPath];
			});

			const entryResults = await Promise.all(entryPromises);
			for (const entryFiles of entryResults) {
				files.push(...entryFiles);
			}
		} catch (error) {
			this.logger.error(`Error reading directory ${directoryPath}`, error);
		}

		return files;
	}

	/**
	 * Analyze store files for patterns and best practices
	 */
	private async analyzeStoreFiles(
		storeFiles: string[],
		recommendations: AiRule[],
	): Promise<void> {
		const patterns = {
			hasImmerMiddleware: false,
			hasDevtools: false,
			hasPersist: false,
			hasSlicing: false,
			hasAsync: false,
		};

		const filePromises = storeFiles.map(async (file) => {
			try {
				const content = await fs.readFile(file, 'utf8');
				return {file, content};
			} catch (error) {
				this.logger.error(`Error reading store file ${file}`, error);
				return {file, content: ''};
			}
		});

		const fileResults = await Promise.all(filePromises);

		for (const {file, content} of fileResults) {
			if (!content) continue;

			// Check for create function usage
			if (content.includes('create(') || content.includes('create<')) {
				recommendations.push({
					category: Category.Zustand,
					rule: 'Use descriptive names for your stores and organize them by domain or feature.',
				});
			}

			// Check for middleware usage
			if (content.includes('immer')) {
				patterns.hasImmerMiddleware = true;
			}

			if (content.includes('devtools')) {
				patterns.hasDevtools = true;
			}

			if (content.includes('persist')) {
				patterns.hasPersist = true;
			}

			// Check for store slicing
			if (
				content.includes('...') &&
				(content.includes('slice') || content.includes('Slice'))
			) {
				patterns.hasSlicing = true;
			}

			// Check for async patterns
			if (
				content.includes('async') ||
				content.includes('await') ||
				content.includes('Promise')
			) {
				patterns.hasAsync = true;
			}

			// Check for TypeScript usage
			if (
				file.endsWith('.ts') &&
				(content.includes('interface') || content.includes('type'))
			) {
				recommendations.push({
					category: Category.Zustand,
					rule: 'Use TypeScript interfaces to define your store state shape for better type safety.',
				});
			}

			// Check for subscription patterns
			if (content.includes('subscribe')) {
				recommendations.push({
					category: Category.Zustand,
					rule: 'Use Zustand subscriptions sparingly. Prefer React hooks (useStore) for component updates.',
				});
			}
		}

		// Add recommendations based on detected patterns
		this.addPatternRecommendations(patterns, recommendations);
	}

	/**
	 * Add recommendations based on detected patterns
	 */
	private addPatternRecommendations(
		patterns: {
			hasImmerMiddleware: boolean;
			hasDevtools: boolean;
			hasPersist: boolean;
			hasSlicing: boolean;
			hasAsync: boolean;
		},
		recommendations: AiRule[],
	): void {
		if (patterns.hasImmerMiddleware) {
			recommendations.push({
				category: Category.Zustand,
				rule: 'Using Immer middleware. Good for complex state updates, but consider performance impact for simple updates.',
			});
		}

		if (patterns.hasDevtools) {
			recommendations.push({
				category: Category.Zustand,
				rule: 'Using Redux DevTools integration. Excellent for debugging state changes in development.',
			});
		}

		if (patterns.hasPersist) {
			recommendations.push({
				category: Category.Zustand,
				rule: 'Using persist middleware. Be mindful of what data you persist and handle migration strategies for schema changes.',
			});
		}

		if (patterns.hasSlicing) {
			recommendations.push({
				category: Category.Zustand,
				rule: 'Using store slicing pattern. Good for organizing large stores, but ensure slices are cohesive and well-defined.',
			});
		}

		if (patterns.hasAsync) {
			recommendations.push({
				category: Category.Zustand,
				rule: 'Handling async operations in stores. Consider loading states, error handling, and avoid race conditions.',
			});
		}
	}

	/**
	 * Check for middleware usage patterns
	 */
	private async checkMiddleware(recommendations: AiRule[]): Promise<void> {
		// Check if middleware packages are installed
		const middlewarePackages = ['zustand/middleware', 'immer'];

		const middlewarePromises = middlewarePackages.map(async (package_) => ({
			package: package_,
			hasDependency: await this.hasDependency(package_),
		}));

		const middlewareResults = await Promise.all(middlewarePromises);

		for (const {package: package_, hasDependency} of middlewareResults) {
			if (hasDependency) {
				recommendations.push({
					category: Category.Zustand,
					rule: `Using ${package_}. Ensure middleware is applied in the correct order and understand performance implications.`,
				});
			}
		}
	}

	/**
	 * Check for persistence patterns
	 */
	private async checkPersistence(recommendations: AiRule[]): Promise<void> {
		// Check package.json for persistence-related dependencies
		const persistencePackages = ['zustand/middleware'];

		const persistencePromises = persistencePackages.map(async (package_) =>
			this.hasDependency(package_),
		);

		const persistenceResults = await Promise.all(persistencePromises);
		const hasPersistenceSetup = persistenceResults.some(Boolean);

		if (hasPersistenceSetup) {
			recommendations.push({
				category: Category.Zustand,
				rule: 'When using persistence, implement proper error handling and consider data migration strategies for schema changes.',
			});
		}
	}

	/**
	 * Check if a dependency exists in package.json
	 */
	private async hasDependency(dependency: string): Promise<boolean> {
		try {
			const packageJsonPath = path.join(this.rootPath, 'package.json');
			const content = await fs.readFile(packageJsonPath, 'utf8');
			const packageJson = JSON.parse(content) as {
				dependencies?: Record<string, string>;
				devDependencies?: Record<string, string>;
			};

			const dependencyTypes = ['dependencies', 'devDependencies'] as const;
			for (const dependencyType of dependencyTypes) {
				const dependencies = packageJson[dependencyType];
				if (dependencies && dependency in dependencies) {
					return true;
				}
			}
		} catch (error) {
			this.logger.error('Error reading package.json', error);
		}

		return false;
	}
}
