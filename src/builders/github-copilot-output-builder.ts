import fs from 'node:fs/promises';
import path from 'node:path';
import type {AiRule} from '../types.js';
import {AiRuleBuilder} from './ai-rule-builder.js';
import {MarkdownBuilder} from './markdown-builder.js';
import type {RuleDetector} from './rule-detector.js';

/**
 * Builder class to generate GitHub Copilot instructions from recommendations
 */
export class VscodeBuilder extends AiRuleBuilder implements RuleDetector {
	/**
	 * Build the output file with all recommendations
	 */
	public async build(): Promise<void> {
		try {
			const outputContent = this.generateOutputContent();
			const outputFilePath = path.join(
				this.outputPath,
				'copilot-instructions.md',
			);

			// Ensure the output directory exists
			await fs.mkdir(this.outputPath, {recursive: true});

			// Write the file
			await fs.writeFile(outputFilePath, outputContent, 'utf8');

			this.logger.info(`Copilot instructions written to ${outputFilePath}`);
		} catch (error: unknown) {
			this.logger.error('Error building copilot instructions', error as Error);
			throw error;
		}
	}

	/**
	 * Generate output content as markdown
	 * @param noHeader If true, flatten the output without category headers
	 * @returns Formatted markdown string
	 */
	public generateOutputContent(noHeader?: boolean): string {
		const markdownBuilder = new MarkdownBuilder(this.recommendations);
		return markdownBuilder.buildMarkdown(noHeader);
	}

	/**
	 * Get the detected AI rules
	 * @returns List of detected AI rules
	 */
	public getDetectedRules(): AiRule[] {
		return this.recommendations;
	}

	/**
	 * Update GitHub Copilot instructions in .github/copilot-instructions.md file
	 * by replacing the content between start and end tags with generated content
	 * @param projectPath The absolute path to the project
	 * @returns Promise that resolves when the file is updated or rejects with an error
	 */
	public async updateGitHubInstructions(projectPath: string): Promise<void> {
		try {
			const githubFilePath = path.join(
				projectPath,
				'.github',
				'copilot-instructions.md',
			);

			try {
				// Check if the file exists
				await fs.access(githubFilePath);

				// Update file using the parent class method
				await this.updateFileInstructions(githubFilePath);

				this.logger.info(
					`Updated GitHub Copilot instructions at ${githubFilePath}`,
				);
			} catch (error: unknown) {
				this.logger.warn(
					`Could not process GitHub Copilot instructions at ${githubFilePath}`,
					error as Error,
				);
				throw error;
			}
		} catch (error: unknown) {
			this.logger.error(
				`Error updating GitHub Copilot instructions`,
				error as Error,
			);
			throw error;
		}
	}
}
