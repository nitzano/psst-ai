import {z} from 'zod';

/**
 * CLI options type definition
 */
export type CliOptions = {
	output?: string;
	quiet?: boolean;
	verbose?: boolean;
	header?: boolean;
	file?: string;
};

/**
 * Zod schema for validating CLI options
 */
export const cliOptionsSchema = z.object({
	output: z.string().optional(),
	quiet: z.boolean().optional(),
	verbose: z.boolean().optional(),
	header: z.boolean().optional(),
	file: z.string().optional(),
});

/**
 * Validate CLI options against the schema
 * @param options Options to validate
 * @returns Validated options
 */
export function validateCliOptions(options: unknown): CliOptions {
	return cliOptionsSchema.parse(options);
}
