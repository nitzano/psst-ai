export enum Category {
	General = 'general',
	PackageManager = 'package_manager',
	NodeVersion = 'node_version',
	Linting = 'linting',
	Xo = 'XO',
	Testing = 'testing',
	Prettier = 'prettier',
	NextJs = 'nextjs',
	Ava = 'ava',
	Jest = 'jest',
	Vue = 'vue',
	Prisma = 'prisma',
}

export type AiRule = {
	rule: string;
	category?: Category;
};

// Re-export CLI options types
export {validateCliOptions, type CliOptions} from './types/cli-options.js';
