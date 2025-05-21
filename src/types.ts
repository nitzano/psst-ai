export enum Category {
	PackageManager = 'package_manager',
	NodeVersion = 'node_version',
	Linting = 'linting',
	Testing = 'testing',
}

export type AiRule = {
	rules: string[];
	category?: Category;
};
