export enum Category {
	PackageManager = 'Package Manager',
	NodeVersion = 'Node Version',
	Linting = 'Linting',
}

export type AiRule = {
	rules: string[];
	category?: Category;
};
