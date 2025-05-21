export enum Category {
	PackageManager = 'package_manager',
	NodeVersion = 'node_version',
	Linting = 'linting',
	Testing = 'testing',
	Prettier = 'prettier',
}

export type AiRule = {
	rule: string;
	category?: Category;
};
