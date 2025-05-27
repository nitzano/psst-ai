import {existsSync} from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {Category, type AiRule} from '../../types.js';
import {BaseScanner} from '../base/base-scanner.js';

/**
 * Scanner to detect Go version requirements and build constraints
 * This scanner checks go.mod files and build tags for Go version information
 */
export class GoVersionScanner extends BaseScanner {
	/**
	 * Scan the project to determine Go version requirements and constraints
	 */
	public async scan(): Promise<AiRule[]> {
		this.logger.debug('Scanning for Go version requirements');

		try {
			// Check if this is a Go project by looking for go.mod
			if (!(await this.isGoProject())) {
				return [];
			}

			const recommendations: AiRule[] = [];

			// Check go.mod for Go version
			const goModuleVersion = await this.getGoVersionFromGoMod();
			if (goModuleVersion) {
				recommendations.push({
					category: Category.Go,
					rule: `Use Go version ${goModuleVersion} as specified in go.mod.`,
				});

				// Add version-specific recommendations
				this.addVersionSpecificRecommendations(
					goModuleVersion,
					recommendations,
				);
			}

			// Check for build constraints
			const buildConstraints = await this.getBuildConstraints();
			if (buildConstraints.length > 0) {
				recommendations.push({
					category: Category.Go,
					rule: `Found build constraints: ${buildConstraints.join(', ')}. Ensure compatibility across target Go versions.`,
				});
			}

			// Add general Go version best practices
			if (recommendations.length > 0) {
				recommendations.push({
					category: Category.Go,
					rule: 'Keep Go version up to date with the latest stable release for security and performance improvements.',
				});
			}

			return recommendations;
		} catch (error) {
			this.logger.error('Error scanning for Go version requirements', error);
			return [];
		}
	}

	/**
	 * Check if this is a Go project
	 */
	private async isGoProject(): Promise<boolean> {
		const goModulePath = path.join(this.rootPath, 'go.mod');
		return existsSync(goModulePath);
	}

	/**
	 * Extract Go version from go.mod file
	 */
	private async getGoVersionFromGoMod(): Promise<string | undefined> {
		const goModulePath = path.join(this.rootPath, 'go.mod');

		if (!existsSync(goModulePath)) {
			return undefined;
		}

		try {
			const goModuleContent = await fs.readFile(goModulePath, 'utf8');

			// Look for "go X.Y" or "go X.Y.Z" line
			const goVersionMatch = /^go\s+(\d+(?:\.\d+){1,2})/m.exec(goModuleContent);

			if (goVersionMatch) {
				return goVersionMatch[1];
			}

			return undefined;
		} catch (error) {
			this.logger.error('Error reading go.mod file', error);
			return undefined;
		}
	}

	/**
	 * Find build constraints in Go files
	 */
	private async getBuildConstraints(): Promise<string[]> {
		const constraints = new Set<string>();

		try {
			// Find all .go files
			const goFiles = await this.findGoFiles();

			// Check each file for build constraints
			const constraintPromises = goFiles.map(async (goFile) =>
				this.extractBuildConstraintsFromFile(goFile),
			);

			const fileConstraintsArrays = await Promise.all(constraintPromises);

			for (const fileConstraints of fileConstraintsArrays) {
				for (const constraint of fileConstraints) {
					constraints.add(constraint);
				}
			}
		} catch (error) {
			this.logger.error('Error finding build constraints', error);
		}

		return Array.from(constraints);
	}

	/**
	 * Find all .go files in the project
	 */
	private async findGoFiles(): Promise<string[]> {
		const goFiles: string[] = [];

		try {
			const files = await this.getFilesRecursively(this.rootPath);
			return files.filter((file) => file.endsWith('.go'));
		} catch (error) {
			this.logger.error('Error finding Go files', error);
			return [];
		}
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

				// Skip vendor, node_modules, and .git directories
				if (
					entry.isDirectory() &&
					['vendor', 'node_modules', '.git'].includes(entry.name)
				) {
					return [];
				}

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
	 * Extract build constraints from a Go file
	 */
	private async extractBuildConstraintsFromFile(
		filePath: string,
	): Promise<string[]> {
		const constraints: string[] = [];

		try {
			const content = await fs.readFile(filePath, 'utf8');
			const lines = content.split('\n');

			// Look for build constraints at the top of the file
			for (const line of lines.slice(0, 10)) {
				// Only check first 10 lines
				const trimmedLine = line.trim();

				// Old style build constraints: // +build
				const oldBuildMatch = /^\/\/\s*\+build\s+(.+)/.exec(trimmedLine);
				if (oldBuildMatch) {
					constraints.push(`+build ${oldBuildMatch[1]}`);
				}

				// New style build constraints: //go:build
				const newBuildMatch = /^\/\/go:build\s+(.+)/.exec(trimmedLine);
				if (newBuildMatch) {
					constraints.push(`go:build ${newBuildMatch[1]}`);
				}

				// Break if we hit actual code (not comments or whitespace)
				if (
					trimmedLine &&
					!trimmedLine.startsWith('//') &&
					!trimmedLine.startsWith('package')
				) {
					break;
				}
			}
		} catch (error) {
			this.logger.error(`Error reading Go file ${filePath}`, error);
		}

		return constraints;
	}

	/**
	 * Add version-specific recommendations
	 */
	private addVersionSpecificRecommendations(
		version: string,
		recommendations: AiRule[],
	): void {
		const majorMinor = version.split('.').slice(0, 2).join('.');
		const majorVersion = Number.parseInt(version.split('.')[0], 10);
		const minorVersion = Number.parseInt(version.split('.')[1], 10);

		// Recommendations for different Go versions
		if (majorVersion === 1) {
			if (minorVersion >= 21) {
				recommendations.push({
					category: Category.Go,
					rule: 'Go 1.21+ includes enhanced slices package and other performance improvements.',
				});
			}

			if (minorVersion >= 20) {
				recommendations.push({
					category: Category.Go,
					rule: 'Go 1.20+ supports workspace mode and improved fuzzing capabilities.',
				});
			}

			if (minorVersion >= 18) {
				recommendations.push({
					category: Category.Go,
					rule: 'Go 1.18+ supports generics. Consider using them for type-safe code.',
				});
			}

			if (minorVersion >= 16) {
				recommendations.push({
					category: Category.Go,
					rule: 'Go 1.16+ supports embed directive for static files.',
				});
			}

			if (minorVersion < 18) {
				recommendations.push({
					category: Category.Go,
					rule: 'Consider upgrading to Go 1.18+ to use generics and other modern features.',
				});
			}
		}

		// General modern Go practices
		if (majorVersion >= 1 && minorVersion >= 11) {
			recommendations.push({
				category: Category.Go,
				rule: 'Use go mod for dependency management instead of GOPATH.',
			});
		}
	}
}
