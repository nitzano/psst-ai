import fs from 'node:fs/promises';
import path from 'node:path';
import type {AiRule} from '../types.js';
import {AiRuleBuilder} from './ai-rule-builder.js';
import {MarkdownBuilder} from './markdown-builder.js';

/**
 * Builder class to generate GitHub Copilot instructions from recommendations
 */
export class GithubCopilotOutputBuilder extends AiRuleBuilder {
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
	 * Generate the content for the output file
	 * @param flat If true, flatten the output without categories
	 * @returns Formatted markdown content with recommendations
	 */
	public generateOutputContent(flat?: boolean): string {
		// Use the MarkdownBuilder to generate the output content
		const markdownBuilder = new MarkdownBuilder(this.recommendations);
		return markdownBuilder.buildMarkdown(flat);
	}

	/**
	 * Update GitHub Copilot instructions in .github/copilot-instructions.md file
	 * by replacing the magic placeholder with generated content
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

				// Read the file contents
				const fileContent = await fs.readFile(githubFilePath, 'utf8');

				// Check if the magic placeholder exists
				if (fileContent.includes(this.magicPlaceholder)) {
					// Generate the content for replacement
					const outputContent = this.generateOutputContent();

					// Replace the placeholder with the generated content
					const updatedContent = fileContent.replace(
						this.magicPlaceholder,
						outputContent,
					);
					await fs.writeFile(githubFilePath, updatedContent, 'utf8');

					this.logger.info(
						`Updated GitHub Copilot instructions at ${githubFilePath}`,
					);
				} else {
					this.logger.warn(
						`Magic placeholder "${this.magicPlaceholder}" not found in ${githubFilePath}`,
					);
				}
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
