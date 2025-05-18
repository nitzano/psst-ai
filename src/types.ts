export enum Category {
	PackageManager = 'Package Manager',
	NodeVersion = 'Node Version',
	Linting = 'Linting',
}

export type Recommendation = {
	recommendations: string[];
	category?: Category;
};
