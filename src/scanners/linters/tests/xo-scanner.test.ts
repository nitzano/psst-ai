import {describe, expect, it, vi, beforeEach} from 'vitest';
import {Category} from '../../../types.js';
import {XoScanner} from '../xo-scanner.js';

const mockFs = {
	access: vi.fn(),
	readFile: vi.fn(),
};

vi.mock('node:fs/promises', () => ({
	default: mockFs,
}));

vi.mock('node:fs', () => ({
	existsSync: (path: string) => !path.includes('nonexistent'),
}));

describe('XoScanner', () => {
	const testDirectory = '/test/dir';

	beforeEach(() => {
		// Reset mocks individually instead of using resetAllMocks
		mockFs.access.mockReset();
		mockFs.readFile.mockReset();
	});

	it('should detect XO configuration in standalone config file', async () => {
		// Mock file existence
		mockFs.access.mockImplementation(async (path: string) => {
			if (path.includes('xo.config.js')) {
				return;
			}

			throw new Error('File not found');
		});

		// Mock package.json with XO dependency
		mockFs.readFile.mockResolvedValue(
			JSON.stringify({
				devDependencies: {
					xo: '^0.54.0',
				},
			}),
		);

		const scanner = new XoScanner(testDirectory);
		const rules = await scanner.scan();

		expect(rules).toHaveLength(2);
		expect(rules[0]).toEqual({
			category: Category.Xo,
			rule: 'Use xo for linting.',
		});
		expect(rules[1]).toEqual({
			category: Category.Xo,
			rule: 'XO configuration found in: xo.config.js',
		});
	});

	it('should detect XO configuration in package.json', async () => {
		// Mock file existence
		mockFs.access.mockImplementation(async (path: string) => {
			if (path.includes('package.json')) {
				return;
			}

			throw new Error('File not found');
		});

		// Mock package.json with XO dependency and config
		mockFs.readFile.mockResolvedValue(
			JSON.stringify({
				devDependencies: {
					xo: '^0.54.0',
				},
				xo: {
					space: 2,
					semicolon: false,
				},
			}),
		);

		const scanner = new XoScanner(testDirectory);
		const rules = await scanner.scan();

		expect(rules).toHaveLength(4);
		expect(rules[0]).toEqual({
			category: Category.Xo,
			rule: 'Use xo for linting.',
		});
		expect(rules[1]).toEqual({
			category: Category.Xo,
			rule: 'XO configuration found in package.json',
		});
		expect(rules[2]).toEqual({
			category: Category.Xo,
			rule: 'Use 2 spaces for indentation.',
		});
		expect(rules[3]).toEqual({
			category: Category.Xo,
			rule: 'Do not use semicolons.',
		});
	});

	it('should return no rules when no XO config or dependencies are found', async () => {
		// Mock file non-existence
		mockFs.access.mockRejectedValue(new Error('File not found'));

		// Mock package.json without XO dependency
		mockFs.readFile.mockResolvedValue(
			JSON.stringify({
				devDependencies: {
					eslint: '^8.0.0',
				},
			}),
		);

		const scanner = new XoScanner(testDirectory);
		const rules = await scanner.scan();

		expect(rules).toHaveLength(0);
	});

	it('should handle errors gracefully', async () => {
		// Simulate errors
		mockFs.access.mockRejectedValue(new Error('Some error'));
		mockFs.readFile.mockRejectedValue(new Error('Some error'));

		const scanner = new XoScanner(testDirectory);
		const rules = await scanner.scan();

		expect(rules).toHaveLength(0);
	});
});
