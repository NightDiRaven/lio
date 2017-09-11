const Command = require('../command')
const type = require('../types')

module.exports = class extends Command {
  get info () {
    return 'Show commands list'
  }

  handle ({state}) {
    this.drawCommands(this.env.commands.list)
  }

  drawCommands (commands) {
    let ul = []
    commands.forEach(commandState => {
      let command = commandState.instance
      let title = commandState.template.name ? `${command.title} ${commandState.template.name}` : command.title
      ul.push({type: 'command', title, aliases: command.aliases.filter(i => i !== command.title), info: command.info})

      Object.keys(command.props).forEach(key => {
        let prop = command.props[key]
        let title = prop.type === type.PARAMS_PLACEHOLDER ? key : `--${key}`
        ul.push({type: 'prop', title, aliases: command.getPropWithAliases(key).filter(i => i !== key), info: prop.desc, def: prop.default})
      })
    })
    this.env.console.write.commandFull({data: ul})
  }
}
