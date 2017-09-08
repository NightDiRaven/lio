const pretty = require('pretty-cli')({template: require('./template')})
const colors = require('colors/safe')

module.exports = {
  write: pretty,
  color: {
    yellow: text => colors.yellow(text),
    bold: text => colors.bold(text)
  }
}
