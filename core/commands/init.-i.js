const Command = require('../command')
const type = require('../types')

module.exports = class extends Command {
  get info () {
    return 'Creates a new project in current folder (--root) with necessary file structure and source files for chosen template'
  }
  get props () {
    let templates = this.env.templates.keys
    let templatesList = templates.length ? templates.map(i => this.env.console.color.yellow(i)).join(', ') : 'none'
    return {
      '<template>': {
        position: 1,
        desc: `Available templates: ${templatesList}`,
        type: type.PARAMS_PLACEHOLDER,
        validate: value => templates.some(i => value === i),
        validateError: `not found available template, for now i have only this: ${templatesList}`,
        required: true
      },
      '<template parameters>': {
        position: -1,
        desc: `All available init params for chosen template`,
        type: type.PARAMS_PLACEHOLDER,
      }
    }
  }

  before (execute) {
    if (this.env.config) {
        this.env.console.write.warning('Destination path already has lio initialization, are you want process?')
        this.env.prompt.start()
        this.env.prompt.confirm('Choose wisely (yes/no)', {}, (err, result) => {
          if (!result) {
            this.env.console.write.warning('Command canceled by user')
          } else {
            execute()
          }
        })
    } else {
      execute()
    }
  }

  setEnv () {
    this.env.store = {name: 'prompt', resolve: () => {
      let promt = require('prompt')
      promt.message = ''
      return promt
    }}
  }

  handle ({state, command}) {
    if (!command) {
      this.env.console.write.info('Started with scratch')
    } else {
      command.run({params: this.env.args})
    }

    this.env.fm.makeFileSync({
        path: this.env.path.join(state.root || this.env.root, '/config.lio.json'),
        content:  JSON.stringify(state, null, 2)
    }, this)
  }
}
