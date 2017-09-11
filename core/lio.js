const [loadConfig, loadTemplates, loadCommands] = ['load-config', 'load-templates', 'load-wombats'].map(i => Symbol(i))

class Lio {
  static rawr () {
    const env = new (require('./env/box'))

    env.store = {name: 'empty', resolve: {empty: Symbol('empty')}}
    env.store = {name: 'root', resolve: process.cwd()}
    env.store = {name: 'args', resolve: process.argv.slice(2)}

    return new Lio({env})
  }

  constructor ({env}) {
    env.store = {name: 'main-template', resolve: () => Symbol('main-template')}
    env.store = {name: 'main-command', resolve: () => Symbol('main-command')}
    env.store = {name: 'config-template', resolve: () => Symbol('config-template')}
    env.store = {name: 'config-command', resolve: () => Symbol('config-command')}
    env.box = {name: 'mode'}
    env.mode.store = {name: 'super', resolve: () => Symbol('mode-super')}
    env.mode.store = {name: 'param', resolve: () => Symbol('mode-param')}

    env.store = {name: 'console', resolve: () => require('./template/console')}
    env.store = {name: 'fs', resolve: () => require('mz/fs')}
    env.store = {name: 'path', resolve: () => require('path')}
    env.store = {name: 'em', resolve: env => new (require('./managers/error-manager'))({env})}
    env.store = {name: 'fm', resolve: env => new (require('./managers/file-manager'))({env})}
    env.store = {name: 'commander', resolve: env => new (require('./commander'))({env})}

    env.box = {name: 'templates'}
    env.box = {name: 'commands'}

    this.env = env
  }

  async doYourRAWR () {
    await this[loadConfig]()
    await this[loadTemplates]()
    await this[loadCommands]()

    this.env.commander.handleCommand()
  }

  obtain (path) {
    let module = require(path)
    if (module instanceof Object) return (new (module)(this.env, path))
  }

  // Private methods

  async [loadConfig] () {
    this.env.store = {name: 'config', resolve: await this.env.fm.loadJsonFrom({path: this.env.root, name: 'config'})}
  }

  async [loadTemplates] () {
    let templates = await this.addTemplates([this.env.path.resolve(__dirname, 'templates')])
    let config = this.env.config

    if (config && Array.isArray(config.templates)) {
      templates = templates.concat(await this.addTemplates(config.templates, this.env['config-template']))
    }

    for (let template of templates) {
      this.env.templates.box = template
    }
  }

  async [loadCommands] () {
    let commands = await this.addCommands([this.env.path.resolve(__dirname, 'commands')])
    let config = this.env.config
    let templates = this.env.templates

    if (config && Array.isArray(config.commands)) {
      commands = commands.concat(await this.addCommands(config.commands, this.env['config-command']))
    }

    for (let key of templates.keys) {
      let template = templates[key]
      if (template.config && template.config.commands  && Array.isArray(template.config.commands)){
        commands = commands.concat(await
          this.addCommands(template.config.commands.map(i => this.env.path.resolve(template.path, i)), key))
      }
    }

    for (let command of commands) {
      this.env.commands.box = command
    }
  }

  async addCommands (dirs = [], template = this.env['main-command']) {
    let formatted = []
    let commands = []
    for (let path of dirs) {
      commands = commands.concat(await this.env.fm.loadCommandsFrom({path}))
    }

    for (let command of commands) {
      formatted.push({name: `${command.file}|${template.toString()}`, props: [
        {name: 'name', resolve: () => command.file},
        {name: 'aliases', resolve: () => this.env.commander.getNameWithAliases(command.file)},
        {name: 'template', resolve: this.getTemplate(template)},
        {name: 'instance', resolve: () => this.obtain(command.path)}
      ]})
    }
    return await formatted
  }

  async addTemplates (dirs = [], declaration = this.env['main-template']) {
    let formatted = []
    let templates = []
    for (let path of dirs) {
      templates = templates.concat(await this.env.fm.loadTemplatesFrom({path}))
    }

    for (let template of templates) {
      formatted.push({name: template.name, props: [
        {name: 'name', resolve: template.name},
        {name: 'config', resolve: template.config},
        {name: 'declaration', resolve: declaration},
        {name: 'path', resolve: template.path},
        {name: 'commands', resolve: () => this.getTemplateCommands(template.name, template.config.commands)}
      ]})
    }
    return await formatted
  }

  getTemplate (name) {
    if (name === this.env['main-command'] || name === this.env['config-command']) {
      return {declaration: name}
    }
    return this.env.templates[name]
  }
}

module.exports = Lio
