export enum Category {
	General = 'general',
	PackageManager = 'package_manager',
	NodeVersion = 'node_version',
	Linting = 'linting',
	Testing = 'testing',
	Prettier = 'prettier',
	NextJs = 'nextjs',
}

export type AiRule = {
	rule: string;
	category?: Category;
};

// Re-export CLI options types
export {type CliOptions, validateCliOptions} from './types/cli-options.js';
