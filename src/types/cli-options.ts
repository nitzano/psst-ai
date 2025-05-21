import {z} from 'zod';

/**
 * Editor types supported by the CLI
 */
export enum EditorType {
	Vscode = 'vscode',
	Cursor = 'cursor',
	Windsurf = 'windsurf',
	Github = 'github',
}

/**
 * Zod schema for validating editor type
 */
export const editorTypeSchema = z.nativeEnum(EditorType).optional();

/**
 * CLI options type definition
 */
export type CliOptions = {
	output?: string;
	quiet?: boolean;
	verbose?: boolean;
	flat?: boolean;
	editor?: EditorType | undefined;
};

/**
 * Zod schema for validating CLI options
 */
export const cliOptionsSchema = z.object({
	output: z.string().optional(),
	quiet: z.boolean().optional(),
	verbose: z.boolean().optional(),
	flat: z.boolean().optional(),
	editor: editorTypeSchema,
});

/**
 * Validate CLI options against the schema
 * @param options Options to validate
 * @returns Validated options
 */
export function validateCliOptions(options: unknown): CliOptions {
	return cliOptionsSchema.parse(options);
}
