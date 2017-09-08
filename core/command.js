const console = require('./template/console')
const type = require('./types')

module.exports = class Command {
  constructor (commander, filename) {
    this.commander = commander
    this.filename = filename
    this.console = console.write
    this.color = console.color
  }
  get title () {
    return this.aliases.reduce((a, b) => a.length > b.length ? a : b)
  }
  get aliases () {
    return this.commander.getNameWithAliases(this.filename)
  }
  get info () {
		return `Default command`
	}
	get props () {
	  return {}
	}
  handle (state) {
	  console.error(`Please implement handle method for ${this.name} command`, state)
	}
	before (execute) { execute() }
	run (consoleArgs = []) {
    let args = this.prepareArgs(consoleArgs)
    let env = {}
    let state = {}
    this.console.command({title: this.title, desc: this.info})

    try {
      Object.keys(this.props).forEach(key => {
        let prop = this.props[key]
        let aliases = this.getPropWithAliases(key)

        if (prop.type === type.PARAMS_PLACEHOLDER) {
          let placeholderProp = consoleArgs[prop.position - 1]
          if (placeholderProp !== undefined && !placeholderProp.startsWith('-')) {
            Command.validateProp(prop, key, placeholderProp)
            state[key] = placeholderProp
          } else if (prop.required) {
            throw new Error(`Empty argument ${key} necessary for this command: lio ${this.title} ` + this.placeholders(key) + ` (${prop.desc})`)
          }
        } else {
          aliases.forEach(aliasKey => {
            if (args[aliasKey] !== undefined) {
              Command.validateProp(prop, key, args[aliasKey])
              state[key] = type.prepareType(prop.type, args[aliasKey])
            } else if (!state[key] && this.props[key].default !== undefined) {
              state[key] = prop.default
            }
          })
        }
      })
    } catch (e) {
      return this.commander.error(false, e, false)
    }

    this.env.bind(env).apply({env})
    this.before(() => this.handle(state, env), state, env)
	}

	env () {}

  prepareArgs (args = []) {
    let res = {}
    args.forEach(i => {
      i = i.split('--').join('').split('=')
      res[i.shift()] = i.length < 1 || i[0]
    })
    return res
  }
  getPropWithAliases (key) {
    let prop = this.props[key] || {}
    return [key, ...(prop.alias ? (Array.isArray(prop.alias) ? prop.alias.map(i => `-${i}`) : [`-${prop.alias}`]) : [])]
  }
  placeholders (activeKey) {
    let placeholders = []
    Object.keys(this.props).forEach(key => {
      let prop = this.props[key]
      if (prop.type === type.PARAMS_PLACEHOLDER) {
        placeholders.push(key === activeKey ? this.color.bold(key): key)
      }
    })
    return placeholders.join(' ')
  }

  static validateProp (prop, key, value) {
    if (prop.validate && !prop.validate(value)) {
      throw new Error(`Argument ${key} (your value is "${value}") not valid for this command, ${prop.validateError}`)
    }
  }
}
