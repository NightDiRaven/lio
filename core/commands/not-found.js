const Command = require('../command')
const type = require('../types/index')

module.exports = class extends Command {
  get info () {
    return 'Command not found'
  }

  handle (state) {
    super.handle(state)
    const fs = require('fs')
    console.log('init handle')
  }
}
