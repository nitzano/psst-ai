import {existsSync} from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {Category, type AiRule} from '../../types.js';
import {BaseScanner} from '../base/base-scanner.js';

/**
 * Scanner to detect Prisma configuration and schema patterns in a project
 */
export class PrismaScanner extends BaseScanner {
	/**
	 * Common Prisma configuration file names
	 */
	private readonly configFileNames = ['schema.prisma', 'prisma/schema.prisma'];

	/**
	 * Scan the project to determine if and how Prisma is configured
	 */
	public async scan(): Promise<AiRule[]> {
		this.logger.debug('Scanning for Prisma configuration');

		try {
			// Check for Prisma schema files
			const schemaFile = await this.findPrismaSchemaFile();

			// Check if Prisma is a dependency
			const hasDependency = await this.hasPrismaDependency();

			// If no Prisma configuration found, don't return any recommendations
			if (!schemaFile && !hasDependency) {
				return [];
			}

			// Initialize recommendations array
			const recommendations: AiRule[] = [];

			// Add general Prisma usage guidelines
			if (hasDependency) {
				recommendations.push({
					category: Category.Prisma,
					rule: 'Use Prisma Client for type-safe database queries. Generate client after schema changes with `prisma generate`.',
				});
			}

			// Schema-specific recommendations
			if (schemaFile) {
				const schemaContent = await this.readSchemaFile(schemaFile);
				if (schemaContent) {
					this.detectDatabaseProvider(schemaContent, recommendations);
					this.detectPrismaFeatures(schemaContent, recommendations);
					this.detectDataModeling(schemaContent, recommendations);
					this.detectMigrations(recommendations);
				}
			}

			return recommendations;
		} catch (error) {
			this.logger.error('Error scanning for Prisma configuration', error);
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

	/**
	 * Find Prisma schema file in the project
	 */
	private async findPrismaSchemaFile(): Promise<string | undefined> {
		for (const fileName of this.configFileNames) {
			const filePath = path.join(this.rootPath, fileName);
			// eslint-disable-next-line no-await-in-loop
			const exists = await this.fileExists(filePath);
			if (exists) {
				return fileName;
			}
		}

		return undefined;
	}

	/**
	 * Check if Prisma is a dependency in package.json
	 */
	private async hasPrismaDependency(): Promise<boolean> {
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

			// Check dependencies, devDependencies
			const dependencyFields = ['dependencies', 'devDependencies'] as const;

			for (const field of dependencyFields) {
				if (
					packageJson[field] &&
					typeof packageJson[field] === 'object' &&
					packageJson[field] !== null
				) {
					const dependencies = packageJson[field] as Record<string, unknown>;
					if ('prisma' in dependencies || '@prisma/client' in dependencies) {
						this.logger.debug(`Found Prisma in ${field}`);
						return true;
					}
				}
			}
		} catch (error) {
			this.logger.error('Error reading package.json', error);
		}

		return false;
	}

	/**
	 * Read and return Prisma schema file content
	 */
	private async readSchemaFile(
		schemaFile: string,
	): Promise<string | undefined> {
		try {
			const filePath = path.join(this.rootPath, schemaFile);
			const content = await fs.readFile(filePath, 'utf8');
			return content;
		} catch (error) {
			this.logger.error(
				`Error reading Prisma schema file: ${schemaFile}`,
				error,
			);
			return undefined;
		}
	}

	/**
	 * Detect database provider and provide recommendations
	 */
	private detectDatabaseProvider(
		schemaContent: string,
		recommendations: AiRule[],
	): void {
		// Check for database providers
		if (schemaContent.includes('provider = "postgresql"')) {
			recommendations.push({
				category: Category.Prisma,
				rule: 'Using PostgreSQL database. Use UUID for primary keys and leverage PostgreSQL-specific features like arrays and JSON types.',
			});
		} else if (schemaContent.includes('provider = "mysql"')) {
			recommendations.push({
				category: Category.Prisma,
				rule: 'Using MySQL database. Be mindful of MySQL-specific limitations and use appropriate data types.',
			});
		} else if (schemaContent.includes('provider = "sqlite"')) {
			recommendations.push({
				category: Category.Prisma,
				rule: 'Using SQLite database. Ideal for development and testing. Consider migrating to PostgreSQL for production.',
			});
		} else if (schemaContent.includes('provider = "sqlserver"')) {
			recommendations.push({
				category: Category.Prisma,
				rule: 'Using SQL Server database. Leverage SQL Server-specific features and ensure proper connection pooling.',
			});
		} else if (schemaContent.includes('provider = "mongodb"')) {
			recommendations.push({
				category: Category.Prisma,
				rule: 'Using MongoDB database. Use embedded documents for one-to-many relationships and leverage MongoDB-specific features.',
			});
		}
	}

	/**
	 * Detect Prisma features and configuration
	 */
	private detectPrismaFeatures(
		schemaContent: string,
		recommendations: AiRule[],
	): void {
		// Check for preview features
		if (schemaContent.includes('previewFeatures')) {
			recommendations.push({
				category: Category.Prisma,
				rule: 'Using Prisma preview features. Be aware that these are experimental and may change in future versions.',
			});
		}

		// Check for multiple generators
		const generatorMatches = schemaContent.match(/generator\s+\w+/g);
		if (generatorMatches && generatorMatches.length > 1) {
			recommendations.push({
				category: Category.Prisma,
				rule: 'Using multiple generators. Ensure each generator serves a specific purpose and maintain consistent configuration.',
			});
		}

		// Check for custom output path
		if (schemaContent.includes('output')) {
			recommendations.push({
				category: Category.Prisma,
				rule: 'Using custom output path for generated client. Ensure the path is included in version control and build processes.',
			});
		}

		// Check for binaryTargets
		if (schemaContent.includes('binaryTargets')) {
			recommendations.push({
				category: Category.Prisma,
				rule: 'Using custom binary targets. Ensure all deployment platforms are covered and binaries are compatible.',
			});
		}
	}

	/**
	 * Detect data modeling patterns
	 */
	private detectDataModeling(
		schemaContent: string,
		recommendations: AiRule[],
	): void {
		// Check for relations
		if (schemaContent.includes('@relation')) {
			recommendations.push({
				category: Category.Prisma,
				rule: 'Using Prisma relations. Use descriptive relation names and consider the impact on queries and performance.',
			});
		}

		// Check for enums
		if (schemaContent.includes('enum ')) {
			recommendations.push({
				category: Category.Prisma,
				rule: 'Using Prisma enums. Keep enum values consistent and consider migration impact when adding new values.',
			});
		}

		// Check for indexes
		if (
			schemaContent.includes('@@index') ||
			schemaContent.includes('@@unique')
		) {
			recommendations.push({
				category: Category.Prisma,
				rule: "Using database indexes. Monitor query performance and ensure indexes align with your application's query patterns.",
			});
		}

		// Check for default values
		if (schemaContent.includes('@default(')) {
			recommendations.push({
				category: Category.Prisma,
				rule: 'Using default values in schema. Ensure defaults are appropriate for your business logic and consider using database functions.',
			});
		}

		// Check for composite IDs
		if (schemaContent.includes('@@id(')) {
			recommendations.push({
				category: Category.Prisma,
				rule: 'Using composite primary keys. Ensure the combination uniquely identifies records and consider query implications.',
			});
		}
	}

	/**
	 * Check for migrations directory and provide migration recommendations
	 */
	private detectMigrations(recommendations: AiRule[]): void {
		const migrationsPath = path.join(this.rootPath, 'prisma', 'migrations');
		if (existsSync(migrationsPath)) {
			recommendations.push({
				category: Category.Prisma,
				rule: 'Using Prisma migrations. Always review migration files before applying and use descriptive names. Run `prisma migrate dev` for development.',
			});
		}

		// Check for seed file
		const seedPath = path.join(this.rootPath, 'prisma', 'seed.ts');
		const seedJsPath = path.join(this.rootPath, 'prisma', 'seed.js');
		if (existsSync(seedPath) || existsSync(seedJsPath)) {
			recommendations.push({
				category: Category.Prisma,
				rule: 'Using Prisma seed file. Keep seed data minimal and representative of real-world scenarios for consistent development.',
			});
		}
	}
}
