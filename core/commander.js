class Commander {
  constructor ({env}) {
    this.env = env
  }

  handleCommand () {
    console.log(this.env.args)
  }

  command (name, args = this.env.args) {
    let command = this.env.commands[name]
    if (command) command.run(args)
  }

  notFound (name, commands) {
    console.log(`Command ${name} not found`)
  }

  getNameWithAliases (file) {
    return this.env.path.basename(file).split('.').filter(i => i !== '' && i !== 'js')
  }
}

module.exports = Commander
