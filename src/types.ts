export enum Category {
	PackageManager = 'Package Manager',
	NodeVersion = 'Node Version',
	Linting = 'Linting',
	Testing = 'Testing',
}

export type AiRule = {
	rules: string[];
	category?: Category;
};
