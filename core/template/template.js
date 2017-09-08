let colors = require('colors/safe')
let columnify = require('columnify')

const block = msg => ' ' + msg + ' '

let template = {
  success: content => colors.black.bgGreen(block(`S`)) + ' ' + colors.green(content),
  log: content => colors.black.bgWhite(block(`L`)) + ' ' + colors.white(content),
  info: content => colors.black.bgBlue(block(`I`)) + ' ' + colors.blue(content),
  warning: content => colors.black.bgYellow(block(`W`)) + ' ' + colors.yellow(content),
  error: content => colors.black.bgRed(block(`E`)) + ' ' + colors.red(content),

  command: content => {
    return colors.black.bgBlue(block(`lio ${content.title}`)) + ' ' + colors.blue(content.desc + '\n...')
  },
  commandFull: ({data}) => {
    let prepare = data.map(i => {
      if (i.type === 'command') {
        i.title = colors.blue.bold('⮩ ' + i.title)
        i.info = colors.blue.bold(i.info)
      }
      if (i.type === 'prop') i.title = colors.black(' '.repeat(3)) + colors.cyan('⮩ ' + i.title)
      if (i.aliases) i.aliases = colors.grey(i.aliases.join(' '))
      if (i.def !== undefined) i.def = colors.grey('(default: ') + colors.grey.bold(i.def) + colors.grey(')')
      return i
    })
    return columnify(prepare, {
      columns: ['title', 'aliases', 'info', 'def'],
      showHeaders: false,
      preserveNewLines: true,
      config: {
        info: {maxWidth: 50}
      }
    })
  },
  blob: blob => {
    return columnify([{first: colors.black(' '.repeat(3)), blob}], {
      showHeaders: false,
      preserveNewLines: true
    })
  }
}

module.exports = template
