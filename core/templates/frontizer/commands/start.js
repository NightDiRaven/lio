const Command = require('../../../command')

module.exports = class extends Command {
  get info () {
    return 'Start frontizer server'
  }

  before (execute) {
    if (!this.env.config) {
      this.env.warn('Frontizer not found in this directory, please init it first')
    } else {
      execute()
    }
  }

  handle ({state}) {

  }
}
