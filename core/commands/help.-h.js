const Command = require('../command')
const type = require('../types')

module.exports = class extends Command {
  get info () {
    return 'Show commands list'
  }

  handle (state) {
    this.commander.commands.then(commands => {
      commands = Object.keys(Object.keys({...commands}).reduce((o, key) => o[commands[key]] = key ? o : o, {}))
        .map(i => this.commander.obtain(i))
      this.drawCommands(commands)
    })
  }

  drawCommands (commands) {
    let ul = []
    commands.forEach(command => {
      if(command.title !== 'not-found') {
        ul.push({type: 'command', title: command.title, aliases: command.aliases.filter(i => i !== command.title), info: command.info})

        Object.keys(command.props).forEach(key => {
          let prop = command.props[key]
          let title = prop.type === type.PARAMS_PLACEHOLDER ? key : `--${key}`
          ul.push({type: 'prop', title, aliases: command.getPropWithAliases(key).filter(i => i !== key), info: prop.desc, def: prop.default})
        })
      }
    })
    this.console.commandFull({data: ul})
  }
}