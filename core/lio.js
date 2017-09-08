const [loadConfig, loadTemplates, loadCommands] = ['load-config', 'load-templates', 'load-wombats'].map(i => Symbol(i))

class Lio {
  static rawr () {
    const env = new (require('./env/box'))({
      props: [
        {name: 'empty', resolve: {empty: Symbol('empty')}},
        {name: 'root', resolve: process.cwd()},
        {name: 'args', resolve: process.argv.slice(2)}
      ]
    })

    return new Lio({env})
  }

  constructor ({env}) {
    env.store = {name: 'console', resolve: () => require('./template/console')}
    env.store = {name: 'em', resolve: env => new (require('./managers/error-manager'))({env})}
    env.store = {name: 'fs', resolve: () => require('mz/fs')}
    env.store = {name: 'path', resolve: () => require('path')}
    env.store = {name: 'fo', resolve: env => new (require('./managers/file-manager'))({env})}
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
    if (module instanceof Object) return (new (module)(this, path))
  }

  // Private methods

  async [loadConfig] () {
    this.env.store = {name: 'config', resolve: await this.env.fo.loadJsonFrom({path: this.env.root, name: 'config'})}
  }

  async [loadTemplates] () {
    let templates = await this.env.fo.loadTemplatesFrom({path: this.env.path.resolve(__dirname, 'templates')})
    let config = this.env.config
    if (config && Array.isArray(config.templates)) {
      for (let template of config.templates) {
        templates = templates.concat(await this.env.fo.loadTemplatesFrom({path: this.env.path.resolve(template)}))
      }
    }
    for (let template of templates) {
      this.env.templates.box = {name: template.name, props: [
        {name: 'config', resolve: template.config},
        {name: 'commands', resolve: () => this.getCommands(template.config.commands)}
      ]}
    }
  }

  async [loadCommands] () {
    let commands = await this.env.fo.loadCommandsFrom({path: this.env.path.resolve(__dirname, 'commands')})
    let config = this.env.config
    let templates = this.env.templates
    let dirs = []

    if (config && Array.isArray(config.commands)) {
      dirs = dirs.concat(config.commands)
    }

    templates.keys.forEach(key => {
      let template = templates[key]
      if (template.config && template.config.commands  && Array.isArray(template.config.commands))
        dirs = dirs.concat(template.config.commands)
    })

    for (let dir of dirs) {
      dir = commands.concat(await this.env.fo.loadCommandsFrom({path: this.env.path.resolve(dir)}))
    }

    for (let command of commands) {
      this.env.commands.store = {name: command.file, resolve: () => this.obtain(command.path)}
    }
  }
}

module.exports = Lio
