const Command = require('../command')
const type = require('../types')

module.exports = class extends Command {
  get info () {
    return 'Creates a new project in current folder (--root) with necessary file structure and source files for chosen template'
  }
  get props () {
    let templates = this.commander.templates
    templates = templates.length ? templates.map(i => this.color.yellow(i)).join(', ') : 'none'
    return {
      '<template>': {
        position: 1,
        desc: `Available templates: ${templates}`,
        type: type.PARAMS_PLACEHOLDER,
        validate: value => value === 'frontizer',
        validateError: `not found available template, for now we have only this: ${templates}`,
        required: true
      },
      '<template parameters>': {
        position: -1,
        desc: `All available init params for chosen template`,
        type: type.PARAMS_PLACEHOLDER,
      }
    }
  }

  before (execute, store, env) {
    this.commander.store.then(store => {
      if (store) {
        this.console.warning('Destination path already has lio initialization, are you want process?')
        env.prompt.start()
        env.prompt.confirm('', {}, function (err, result) {
          //
          // Log the results.
          //
          console.log('Command-line input received:');
          console.log('  username: ' + result.username);
          console.log('  email: ' + result.email);
        });
      } else {
        execute()
      }
    })
  }

  env () {
    this.fo = require('../../lib/fo')
    this.path = require('path')
    this.prompt = require('prompt')
    this.prompt.message = ''
  }

  handle (state, env) {
    if (!env.fo.makeFileSync(
      {
        path: env.path.join(state.root || this.commander.root, '/config.lio.json'),
        content:  JSON.stringify(state, null, 2)
      }, this)) return
  }
}
