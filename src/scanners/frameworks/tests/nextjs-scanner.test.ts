import fs from 'node:fs';
import path from 'node:path';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {Category} from '../../../types.js';
import {NextjsScanner} from '../nextjs-scanner.js';

// Mock fs and path modules
vi.mock('node:fs');
vi.mock('node:fs/promises');
vi.mock('node:path');

describe('NextjsScanner', () => {
	// Reset mocks between tests
	beforeEach(() => {
		vi.resetAllMocks();

		// Mock path.join to return predictable paths
		vi.mocked(path.join).mockImplementation((...paths) => paths.join('/'));
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should detect NextJS from next.config.js', async () => {
		// Setup
		const rootPath = '/test';
		const scanner = new NextjsScanner(rootPath);

		// Mock existsSync to return true for next.config.js
		vi.mocked(fs.existsSync).mockImplementation((path) => {
			return path === '/test/next.config.js';
		});

		// Mock fs.readFile to return a basic config
		vi.mocked(fs.promises.readFile).mockResolvedValue(`
			module.exports = {
				reactStrictMode: true,
			}
		`);

		// Execute
		const rules = await scanner.scan();

		// Assert
		expect(rules).toHaveLength(2);
		expect(rules[0]).toEqual({
			category: Category.NextJs,
			rule: 'Use Next.js as the React framework.',
		});
		expect(rules[1]).toEqual({
			category: Category.NextJs,
			rule: 'Use React strict mode in Next.js.',
		});
	});

	it('should detect NextJS from package.json dependency', async () => {
		// Setup
		const rootPath = '/test';
		const scanner = new NextjsScanner(rootPath);

		// Mock existsSync to return false for config but true for package.json
		vi.mocked(fs.existsSync).mockImplementation((path) => {
			return path === '/test/package.json';
		});

		// Mock fs.readFile to return package.json with next dependency
		vi.mocked(fs.promises.readFile).mockResolvedValue(
			JSON.stringify({
				dependencies: {
					next: '^13.0.0',
				},
			}),
		);

		// Execute
		const rules = await scanner.scan();

		// Assert
		expect(rules).toHaveLength(1);
		expect(rules[0]).toEqual({
			category: Category.NextJs,
			rule: 'Use Next.js as the React framework.',
		});
	});

	it('should detect App Router directory structure', async () => {
		// Setup
		const rootPath = '/test';
		const scanner = new NextjsScanner(rootPath);

		// Mock existsSync to return true for next.config.js and app directory
		vi.mocked(fs.existsSync).mockImplementation((path) => {
			return path === '/test/next.config.js' || path === '/test/app';
		});

		// Mock fs.readFile to return a basic config
		vi.mocked(fs.promises.readFile).mockResolvedValue(`
			module.exports = {
				reactStrictMode: true,
			}
		`);

		// Execute
		const rules = await scanner.scan();

		// Assert
		expect(rules).toHaveLength(3);
		expect(rules).toContainEqual({
			category: Category.NextJs,
			rule: 'Use the App Router directory structure in Next.js.',
		});
	});

	it('should detect Pages Router directory structure', async () => {
		// Setup
		const rootPath = '/test';
		const scanner = new NextjsScanner(rootPath);

		// Mock existsSync to return true for next.config.js and pages directory
		vi.mocked(fs.existsSync).mockImplementation((path) => {
			return path === '/test/next.config.js' || path === '/test/pages';
		});

		// Mock fs.readFile to return a basic config
		vi.mocked(fs.promises.readFile).mockResolvedValue(`
			module.exports = {
				reactStrictMode: true,
			}
		`);

		// Execute
		const rules = await scanner.scan();

		// Assert
		expect(rules).toHaveLength(3);
		expect(rules).toContainEqual({
			category: Category.NextJs,
			rule: 'Use the Pages Router directory structure in Next.js.',
		});
	});

	it('should return empty array when NextJS is not detected', async () => {
		// Setup
		const rootPath = '/test';
		const scanner = new NextjsScanner(rootPath);

		// Mock existsSync to return false for all files
		vi.mocked(fs.existsSync).mockReturnValue(false);

		// Execute
		const rules = await scanner.scan();

		// Assert
		expect(rules).toHaveLength(0);
	});
});
