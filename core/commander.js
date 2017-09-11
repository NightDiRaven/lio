class Commander {
  constructor ({env}) {
    this.env = env
  }

  async handleCommand (args = this.env.args) {
    let params = args.slice()
    let action = params.shift()
    let template = params[0] && this.env.templates.keys.some(i => i === params[0]) ? params[0] : false
    let commands = this.env.commands.list
      .map(command => command.aliases.map(alias => ({alias, command})))
      .reduce((a, b = []) => a.concat(b))

    let actions = commands.filter(i => i.alias === action)
    if (actions.length) {
      let resolved = this.resolve({action, template, actions})
      let chain = resolved.chain
      if (chain.length) {
        let el = chain.shift()
        if (el.instance) {
          let command = el.instance
          switch (command.mode) {
            case this.env.mode.super:
              if (chain.length) {
                await chain.shift().instance.run({params, resolved})
              }
              await command.run({params, resolved})
              return
              break
            case this.env.mode.param:
              if (chain.length) {
                await chain.shift().instance.run({params, resolved, command})
              } else {
                await command.run({params, resolved})
              }
              return
              break
            default:
              await command.run({params, resolved})
              return
          }
        }

      } else if (!resolved.template) {
        this.env.console.write.warning('Cannot run this command until template not specified')
      }
    } else {
      this.env.console.write.warning('Command not found')
    }
  }

  resolve ({action, template, actions}) {
    let config = this.env.config
    let formatted = {}
    let chain = []
    if (config) {
      if (!template) {
        template = this.env.config.template || false
      }
    }
    actions = actions.filter(i => !i.command.template.name || i.command.template.name === template)

    actions.forEach(a => {
      if (template && a.command.template.name) {
        formatted.template = a.command
      } else {
        formatted[a.command.template.declaration] = a.command
      }
    })

    if (formatted.template) chain.push(formatted.template)

    if (formatted[this.env['config-command']]) chain.push(formatted[this.env['config-command']])
    if (formatted[this.env['config-template']]) chain.push(formatted[this.env['config-template']])
    if (formatted[this.env['main-template']]) chain.push(formatted[this.env['main-template']])
    if (formatted[this.env['main-command']]) chain.push(formatted[this.env['main-command']])

    return {chain, template}
  }

  command (name, args = this.env.args) {
    let command = this.env.commands[name]
    if (command) command.run(args)
  }

  getNameWithAliases (file) {
    return this.env.path.basename(file).split('.').filter(i => i !== '' && i !== 'js')
  }
}

module.exports = Commander
