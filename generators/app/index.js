'use strict';

const Generator = require('yeoman-generator');
const Chalk = require('chalk');

module.exports = class extends Generator {
	constructor(args, opts) {
		super(args, opts);
		this.option('babel');
	}

	initializing() {
		this.log(Chalk.bold.magenta('Slant: 🗨 Answer some questions to help us generate your module.'));
	}

	async prompting() {
		this.answers = await this.prompt([
			{
				type: 'confirm',
				name: 'moduleWithHttpClients',
				message: 'Will your module use HTTP clients?',
				default: 1,
			},
			{
				type: 'confirm',
				name: 'moduleWithModels',
				message: 'Will you be creating new classes or interfaces or types?',
				default: 1,
			},
			{
				type: 'confirm',
				name: 'moduleWithComponents',
				message: 'Will you be creating new components?',
				default: 1,
			},
			{
				when: (response) => {
					return response.moduleWithComponents;
				},
				type: 'confirm',
				name: 'moduleWithRouting',
				message: 'Do you want to use a routing module? (highly recommended)',
				default: 1,
			},
			{
				type: 'input',
				name: 'moduleName',
				message: 'Name your module [do not have the word `module` in your name]:',
				default: 'sample-' + Math.floor(Math.random() * 10000),
			},
		]);
	}

	configuring() {
		const alias = `@portal/${this.answers.moduleName}`;
		const aliasstar = `@portal/${this.answers.moduleName}/*`;

		const content = {
			compilerOptions: {
				paths: {
					[alias]: [`./app/${this.answers.moduleName}/view/${this.answers.moduleName}-view.module`],
					[aliasstar]: [`./app/${this.answers.moduleName}/*`],
				},
			},
		};
		const content2 = {
			compilerOptions: {
				paths: {
					[alias]: [`./src/app/${this.answers.moduleName}/view/${this.answers.moduleName}-view.module`],
					[aliasstar]: [`./src/app/${this.answers.moduleName}/*`],
				},
			},
		};

		this.fs.extendJSON('src/tsconfig.app.json', content);
		this.fs.extendJSON('tsconfig.json', content2);
	}

	default() {
		this.log(Chalk.bold.magenta('Slant: ⚡ Generating module.'));
	}

	writing() {
		if (this.answers.moduleWithHttpClients) {
			this.fs.copy(
				this.templatePath('../../public/index-for-http.txt'),
				this.destinationPath(`src/app/${this.answers.moduleName}/http/index.ts`)
			);
		}
		if (this.answers.moduleWithModels) {
			this.fs.copy(
				this.templatePath('../../public/index-for-models.txt'),
				this.destinationPath(`src/app/${this.answers.moduleName}/models/index.ts`)
			);
			this.fs.copy(
				this.templatePath('../../public/index-for-interfaces.txt'),
				this.destinationPath(`src/app/${this.answers.moduleName}/models/interfaces/index.ts`)
			);
		}

		if (this.answers.moduleWithComponents) {
			this.fs.copy(
				this.templatePath('../../public/index-for-components.txt'),
				this.destinationPath(`src/app/${this.answers.moduleName}/view/components/index.ts`)
			);
			this.fs.copy(
				this.templatePath('../../public/index-for-component-pages.txt'),
				this.destinationPath(`src/app/${this.answers.moduleName}/view/pages/index.ts`)
			);
		}
	}

	// conflicts() { }

	install() {
		if (this.answers.moduleWithComponents && this.answers.moduleWithRouting) {
			this.spawnCommandSync('ng', [
				'g',
				'm',
				`${this.answers.moduleName}/view/${this.answers.moduleName}-view`,
				'--flat',
				'--routing',
			]);
		}

		if (this.answers.moduleWithComponents && !this.answers.moduleWithRouting) {
			this.spawnCommandSync('ng', ['g', 'm', `${this.answers.moduleName}/view/${this.answers.moduleName}-view`, '--flat']);
		}
	}

	end() {
		this.log(Chalk.bold.magenta('Slant: ✔ Done!'));
	}
};
