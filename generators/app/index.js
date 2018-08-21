'use strict'

const Generator = require('yeoman-generator');
const Chalk = require('chalk');

module.exports = class extends Generator {

    constructor(args, opts) {
        super(args, opts);
        this.option('babel');
    }

    initializing() {
        this.log(Chalk.bold.magenta('Slanting!'));
    }

    async prompting() {
        this.answers = await this.prompt([
            {
                type: 'list',
                name: 'moduleType',
                message: 'What type of module do you need?',
                choices: ['blank', 'service', 'feature'],
                default: 0
            },
            {
                when: (response) => {
                    return response.moduleType === 'service'
                },
                type: 'confirm',
                name: 'httpModule',
                message: 'Will this be a data access module?',
                default: 0
            },
            {
                type: 'input',
                name: 'moduleName',
                message: 'Name your module [do not have the word `module` in your name]:',
                default: 'sample-' + Math.floor(Math.random() * 10000)
            }
        ]);
    }

    configuring() {

        // this.args.alias = `@portal/${this.answers.moduleName}`;
        // this.args.aliasstar = `@portal/${this.answers.moduleName}/*`;

        const alias = `@portal/${this.answers.moduleName}`;
        const aliasstar = `@portal/${this.answers.moduleName}/*`;

        const content = {
            'compilerOptions': {
                'paths': {
                    [alias]: [`./app/${this.answers.moduleName}/view/${this.answers.moduleName}-view.module`],
                    [aliasstar]: [`./app/${this.answers.moduleName}/*`]
                }
            }
        };
        const content2 = {
            'compilerOptions': {
                'paths': {
                    [alias]: [`./src/app/${this.answers.moduleName}/view/${this.answers.moduleName}-view.module`],
                    [aliasstar]: [`./src/app/${this.answers.moduleName}/*`]
                }
            }
        };

        if (this.answers.moduleType === 'feature') {
            this.fs.extendJSON('src/tsconfig.app.json', content);
            this.fs.extendJSON('tsconfig.json', content2);
        }
    }

    // default() { }

    writing() {
        if (this.answers.moduleType === 'service') {
            if (this.answers.httpModule) {
                this.fs.copy(
                    this.templatePath('../../public/index-t.txt'),
                    this.destinationPath(`src/app/${this.answers.moduleName}/abstraction/index.ts`),
                );
            } else {
                this.fs.copy(
                    this.templatePath('../../public/index-t.txt'),
                    this.destinationPath(`src/app/${this.answers.moduleName}/services/index.ts`),
                );
            }
        }
        if (this.answers.moduleType === 'feature') {
            this.fs.copy(
                this.templatePath('../../public/index-t.txt'),
                this.destinationPath(`src/app/${this.answers.moduleName}/abstraction/index.ts`),
            );
            this.fs.copy(
                this.templatePath('../../public/index-t.txt'),
                this.destinationPath(`src/app/${this.answers.moduleName}/view/components/index.ts`),
            );
            this.fs.copy(
                this.templatePath('../../public/index-t.txt'),
                this.destinationPath(`src/app/${this.answers.moduleName}/view/pages/index.ts`),
            );
        }
    }

    // conflicts() { }

    install() {
        if (this.answers.moduleType === 'blank') {
            this.spawnCommandSync('ng', ['g', 'm', this.answers.moduleName]);
        }
        if (this.answers.moduleType === 'service') {
            if (this.answers.httpModule) {
                this.spawnCommandSync('ng', ['g', 'm', `${this.answers.moduleName}/dal/${this.answers.moduleName}-dal`, '--flat']);
            } else {
                this.spawnCommandSync('ng', ['g', 'm', `${this.answers.moduleName}/${this.answers.moduleName}`, '--flat']);
            }
        }
        if (this.answers.moduleType === 'feature') {
            this.spawnCommandSync('ng', ['g', 'm', `${this.answers.moduleName}/dal/${this.answers.moduleName}-dal`, '--flat']);
            this.spawnCommandSync('ng', ['g', 'm', `${this.answers.moduleName}/view/${this.answers.moduleName}-view`, '--flat', '--routing']);
        }
    }

    end() {
        this.log(Chalk.bold.magenta('Done!'));
    }
};