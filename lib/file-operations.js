const fs = require('fs')

module.exports = {
  fs,
  makeDirsSync (dirs, scope) {

  },
	makeDirSync ({path}, scope) {
    try {
      fs.mkdirSync(path)
      scope.console.success(`Folder ${path} created`)
    } catch (e) {
      switch (e.code) {
        case 'EEXIST':
          scope.console.warning(`Folder ${path} already exists`)
          break
        case 'EACCES':
          scope.commander.error(`Trying create folder ${path}` + path + scope.color.yellow(' (PERMISSION DENIED: check your privileges)'))
          return false
					break
        default:
          scope.commander.error(`Trying create folder ${path}` + scope.color.yellow(` (${e.message})`))
          return false
      }
    }
    return true
	},
  makeFileSync ({path, content}, scope) {
    try {
      let f = fs.openSync(path, 'wx')
      if (content) fs.writeSync(f, content)
      scope.console.success(`File ${path} created`)
    } catch (e) {
      switch (e.code) {
        case 'EEXIST':
          scope.console.warning(`File ${path} already exists`)
          break
        case 'EACCES':
          scope.commander.error(`Trying create file ${path}` + path + scope.color.yellow(' (PERMISSION DENIED: check your privileges)'))
          return false
					break
        default:
          scope.commander.error(`Trying create file ${path}` + scope.color.yellow(` (${e.message})`))
          return false
      }
    }
    return true
	}
}
