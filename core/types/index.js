const PARAMS_FLAG = 'bool'
const PARAMS_INT = 'int'
const PARAMS_LIST = 'list'
const PARAMS_STRING = 'string'
const PARAMS_PLACEHOLDER = 'placeholder'

const prepareType = (type, value) => {
  switch (type) {
    case PARAMS_FLAG:
      switch (value) {
        case true:
        case 't':
        case 'y':
        case 'true':
        case 'yes':
        case 'enabled':
        case '+':
        case 1:
          return true
          break
        default:
          return false
      }
      break
    case PARAMS_INT:
      return parseInt(value) || 0
      break
    case PARAMS_LIST:
      return value.split(' ').filter(i => i !== '')
      break
    case PARAMS_PLACEHOLDER:
    case PARAMS_STRING:
      return `${value}`
      break
    default:
      return value
  }
}

module.exports = {prepareType, PARAMS_FLAG, PARAMS_INT, PARAMS_LIST, PARAMS_STRING, PARAMS_PLACEHOLDER}
