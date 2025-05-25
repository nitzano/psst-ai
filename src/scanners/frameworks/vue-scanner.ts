import {existsSync} from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {Category, type AiRule} from '../../types.js';
import {BaseScanner} from '../base/base-scanner.js';

/**
 * Scanner to detect Vue.js version and configuration patterns in a project
 */
export class VueScanner extends BaseScanner {
	/**
	 * Scan the project to determine if Vue.js is used and extract configuration rules
	 */
	public async scan(): Promise<AiRule[]> {
		this.logger.debug('Scanning for Vue.js');

		try {
			// Check if Vue.js is used in the project
			if (await this.isVueProject()) {
				const rules: AiRule[] = [];

				// Determine Vue version and add appropriate rule
				const vueVersion = await this.detectVueVersion();
				if (vueVersion) {
					rules.push({
						category: Category.Vue,
						rule: `Use Vue.js ${vueVersion} as the framework.`,
					});
				} else {
					rules.push({
						category: Category.Vue,
						rule: 'Use Vue.js as the framework.',
					});
				}

				// Extract configuration rules from various Vue config files
				const configRules = await this.extractConfigRules();
				rules.push(...configRules);

				return rules;
			}

			// If Vue.js is not used, return empty array
			return [];
		} catch (error) {
			this.logger.error('Error scanning for Vue.js', error);
			return [];
		}
	}

	/**
	 * Check if Vue.js is used in the project
	 */
	private async isVueProject(): Promise<boolean> {
		// Check for Vue-specific config files
		const vueConfigFiles = [
			'vue.config.js',
			'vue.config.ts',
			'vite.config.js',
			'vite.config.ts',
			'nuxt.config.js',
			'nuxt.config.ts',
		];

		// Check config files for Vue-related content
		const configFileChecks = vueConfigFiles.map(async (configFile) => {
			const configPath = path.join(this.rootPath, configFile);
			if (!existsSync(configPath)) {
				return false;
			}

			return this.hasVueConfiguration(configPath);
		});

		const configResults = await Promise.all(configFileChecks);
		const hasVueConfig = configResults.some(Boolean);

		if (hasVueConfig) {
			return true;
		}

		// Check dependency patterns
		const dependencyChecks = [
			this.hasDependency('vue'),
			this.hasDependency('nuxt'),
			this.hasDependency('@quasar/cli'),
			this.hasDependency('@vue/cli-service'),
		];

		const dependencyResults = await Promise.all(dependencyChecks);
		return dependencyResults.some(Boolean);
	}

	/**
	 * Check if a config file contains Vue-related configuration
	 */
	private async hasVueConfiguration(configPath: string): Promise<boolean> {
		try {
			const fileContent = await fs.readFile(configPath, 'utf8');

			// Check for Vue-specific keywords in config files
			return (
				fileContent.includes('vue') ||
				fileContent.includes('Vue') ||
				fileContent.includes('@vue') ||
				fileContent.includes('nuxt') ||
				fileContent.includes('Nuxt') ||
				fileContent.includes('quasar') ||
				fileContent.includes('Quasar')
			);
		} catch {
			return false;
		}
	}

	/**
	 * Check if package.json has a specific dependency
	 */
	private async hasDependency(dependencyName: string): Promise<boolean> {
		const packageJsonPath = path.join(this.rootPath, 'package.json');

		if (!existsSync(packageJsonPath)) {
			return false;
		}

		try {
			const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
			const packageJson = JSON.parse(packageJsonContent) as Record<
				string,
				unknown
			>;

			// Check dependencies, devDependencies, and peerDependencies
			const dependencyFields = [
				'dependencies',
				'devDependencies',
				'peerDependencies',
			] as const;

			for (const field of dependencyFields) {
				if (
					packageJson[field] &&
					typeof packageJson[field] === 'object' &&
					packageJson[field] !== null &&
					dependencyName in (packageJson[field] as Record<string, unknown>)
				) {
					return true;
				}
			}

			return false;
		} catch (error) {
			this.logger.error('Error reading package.json', error);
			return false;
		}
	}

	/**
	 * Detect the Vue.js version being used
	 */
	private async detectVueVersion(): Promise<string | undefined> {
		const packageJsonPath = path.join(this.rootPath, 'package.json');

		if (!existsSync(packageJsonPath)) {
			return undefined;
		}

		try {
			const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
			const packageJson = JSON.parse(packageJsonContent) as Record<
				string,
				unknown
			>;

			// Check dependencies, devDependencies, and peerDependencies for Vue version
			const dependencyFields = [
				'dependencies',
				'devDependencies',
				'peerDependencies',
			] as const;

			for (const field of dependencyFields) {
				const dependencies = packageJson[field];

				if (
					!dependencies ||
					typeof dependencies !== 'object' ||
					dependencies === null
				) {
					continue;
				}

				const deps = dependencies as Record<string, string>;
				const vueVersion = deps.vue;

				if (!vueVersion) {
					continue;
				}

				return this.parseVueVersion(vueVersion);
			}

			return undefined;
		} catch (error) {
			this.logger.error('Error detecting Vue version', error);
			return undefined;
		}
	}

	/**
	 * Parse Vue version string to extract major version
	 */
	private parseVueVersion(version: string): string {
		// Extract major version number
		if (
			version.startsWith('^3') ||
			version.startsWith('~3') ||
			version.startsWith('3')
		) {
			return '3.x';
		}

		if (
			version.startsWith('^2') ||
			version.startsWith('~2') ||
			version.startsWith('2')
		) {
			return '2.x';
		}

		return version;
	}

	/**
	 * Extract configuration rules from Vue.js config files
	 */
	private async extractConfigRules(): Promise<AiRule[]> {
		const rules: AiRule[] = [];

		// Check for different Vue.js project setups
		await this.checkVueCliProject(rules);
		await this.checkViteVueProject(rules);
		await this.checkNuxtProject(rules);
		await this.checkQuasarProject(rules);
		await this.checkCompositionApi(rules);
		await this.checkVueRouter(rules);
		await this.checkVuex(rules);
		await this.checkPinia(rules);
		await this.checkTypeScriptSupport(rules);

		return rules;
	}

	/**
	 * Check for Vue CLI project configuration
	 */
	private async checkVueCliProject(rules: AiRule[]): Promise<void> {
		const vueConfigPath = path.join(this.rootPath, 'vue.config.js');
		const vueConfigTsPath = path.join(this.rootPath, 'vue.config.ts');

		if (existsSync(vueConfigPath) || existsSync(vueConfigTsPath)) {
			rules.push({
				category: Category.Vue,
				rule: 'Use Vue CLI for project configuration and build process.',
			});

			// Read config file to extract specific settings
			const configPath = existsSync(vueConfigTsPath)
				? vueConfigTsPath
				: vueConfigPath;
			try {
				const fileContent = await fs.readFile(configPath, 'utf8');

				// Check for PWA configuration
				if (fileContent.includes('pwa') || fileContent.includes('PWA')) {
					rules.push({
						category: Category.Vue,
						rule: 'Use PWA features in Vue.js application.',
					});
				}

				// Check for CSS preprocessors
				if (fileContent.includes('sass') || fileContent.includes('scss')) {
					rules.push({
						category: Category.Vue,
						rule: 'Use Sass/SCSS for styling in Vue.js components.',
					});
				}

				if (fileContent.includes('less')) {
					rules.push({
						category: Category.Vue,
						rule: 'Use Less for styling in Vue.js components.',
					});
				}

				// Check for linting configuration
				if (fileContent.includes('lintOnSave')) {
					rules.push({
						category: Category.Vue,
						rule: 'Enable lint-on-save for Vue.js development.',
					});
				}
			} catch (error) {
				this.logger.error('Error reading Vue config file', error);
			}
		}
	}

	/**
	 * Check for Vite + Vue project configuration
	 */
	private async checkViteVueProject(rules: AiRule[]): Promise<void> {
		const viteConfigPath = path.join(this.rootPath, 'vite.config.js');
		const viteConfigTsPath = path.join(this.rootPath, 'vite.config.ts');

		if (existsSync(viteConfigPath) || existsSync(viteConfigTsPath)) {
			const configPath = existsSync(viteConfigTsPath)
				? viteConfigTsPath
				: viteConfigPath;

			try {
				const fileContent = await fs.readFile(configPath, 'utf8');

				// Check if it's a Vue + Vite project
				if (
					fileContent.includes('@vitejs/plugin-vue') ||
					fileContent.includes('vue()')
				) {
					rules.push({
						category: Category.Vue,
						rule: 'Use Vite as the build tool for Vue.js development.',
					});
				}
			} catch (error) {
				this.logger.error('Error reading Vite config file', error);
			}
		}
	}

	/**
	 * Check for Nuxt.js project configuration
	 */
	private async checkNuxtProject(rules: AiRule[]): Promise<void> {
		const nuxtConfigPath = path.join(this.rootPath, 'nuxt.config.js');
		const nuxtConfigTsPath = path.join(this.rootPath, 'nuxt.config.ts');

		if (existsSync(nuxtConfigPath) || existsSync(nuxtConfigTsPath)) {
			rules.push({
				category: Category.Vue,
				rule: 'Use Nuxt.js for server-side rendering and static site generation.',
			});

			const configPath = existsSync(nuxtConfigTsPath)
				? nuxtConfigTsPath
				: nuxtConfigPath;

			try {
				const fileContent = await fs.readFile(configPath, 'utf8');

				// Check for specific Nuxt features
				if (fileContent.includes('ssr') && fileContent.includes('false')) {
					rules.push({
						category: Category.Vue,
						rule: 'Use Nuxt.js in SPA (Single Page Application) mode.',
					});
				}

				if (fileContent.includes('target') && fileContent.includes('static')) {
					rules.push({
						category: Category.Vue,
						rule: 'Use Nuxt.js for static site generation.',
					});
				}

				if (fileContent.includes('modules')) {
					rules.push({
						category: Category.Vue,
						rule: 'Use Nuxt.js modules to extend functionality.',
					});
				}
			} catch (error) {
				this.logger.error('Error reading Nuxt config file', error);
			}
		}
	}

	/**
	 * Check for Quasar project configuration
	 */
	private async checkQuasarProject(rules: AiRule[]): Promise<void> {
		const quasarConfigPath = path.join(this.rootPath, 'quasar.config.js');
		const quasarConfigPath_ = path.join(this.rootPath, 'quasar.conf.js');

		if (
			existsSync(quasarConfigPath) ||
			existsSync(quasarConfigPath_) ||
			(await this.hasDependency('quasar'))
		) {
			rules.push({
				category: Category.Vue,
				rule: 'Use Quasar Framework for Vue.js component library and build tools.',
			});
		}
	}

	/**
	 * Check for Vue Composition API usage
	 */
	private async checkCompositionApi(rules: AiRule[]): Promise<void> {
		// Check if using Vue 3 or @vue/composition-api for Vue 2
		const hasCompositionApi = await this.hasDependency('@vue/composition-api');
		const vueVersion = await this.detectVueVersion();

		if (vueVersion === '3.x' || hasCompositionApi) {
			rules.push({
				category: Category.Vue,
				rule: 'Use Vue Composition API for component logic organization.',
			});
		}
	}

	/**
	 * Check for Vue Router usage
	 */
	private async checkVueRouter(rules: AiRule[]): Promise<void> {
		const hasVueRouter = await this.hasDependency('vue-router');

		if (hasVueRouter) {
			rules.push({
				category: Category.Vue,
				rule: 'Use Vue Router for client-side routing.',
			});
		}
	}

	/**
	 * Check for Vuex usage
	 */
	private async checkVuex(rules: AiRule[]): Promise<void> {
		const hasVuex = await this.hasDependency('vuex');

		if (hasVuex) {
			rules.push({
				category: Category.Vue,
				rule: 'Use Vuex for centralized state management.',
			});
		}
	}

	/**
	 * Check for Pinia usage (Vue 3 recommended state management)
	 */
	private async checkPinia(rules: AiRule[]): Promise<void> {
		const hasPinia = await this.hasDependency('pinia');

		if (hasPinia) {
			rules.push({
				category: Category.Vue,
				rule: 'Use Pinia for modern Vue.js state management.',
			});
		}
	}

	/**
	 * Check for TypeScript support in Vue project
	 */
	private async checkTypeScriptSupport(rules: AiRule[]): Promise<void> {
		const hasTypeScript = await this.hasDependency('typescript');
		const hasVueTypeScript = await this.hasDependency('@vue/typescript');
		const tsConfigExists = existsSync(
			path.join(this.rootPath, 'tsconfig.json'),
		);

		if (hasTypeScript || hasVueTypeScript || tsConfigExists) {
			rules.push({
				category: Category.Vue,
				rule: 'Use TypeScript for type-safe Vue.js development.',
			});
		}
	}
}
