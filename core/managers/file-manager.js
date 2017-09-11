class FileManager {
  constructor ({env}) {
    this.env = env
  }

  makeDirSync ({path}) {
    try {
      this.env.fs.mkdirSync(path)
      this.env.console.write.success(`Folder ${path} created`)
    } catch (e) {
      switch (e.code) {
        case 'EEXIST':
          this.env.console.write.warning(`Folder ${path} already exists`)
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
  }
  
  makeFileSync ({path, content}, scope) {
    try {
      let f = this.env.fs.openSync(path, 'wx')
      if (content) this.env.fs.writeSync(f, content)
      this.env.console.write.success(`File ${path} created`)
    } catch (e) {
      switch (e.code) {
        case 'EEXIST':
          this.env.console.write.warning(`File ${path} already exists`)
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
  
  async loadJsonFrom ({path, name}) {
    try {
      let filename = this.env.path.join(path, `${name}.lio.json`)
      return await this.env.fs.exists(filename) ? JSON.parse(await this.env.fs.readFile(filename, 'utf-8')) : false
    } catch (e) {
      this.env.em.error(`Error loading json config file ${name} from ${path}`, e)
    }
  }

  async loadTemplatesFrom ({path}) {
    let templates = []
    try {
      let dirs = await this.env.fs.readdir(path)
      for (let dir of dirs) {
        let path2config = this.env.path.resolve(path, dir)
        let config = await this.loadJsonFrom({path: path2config, name: dir})
        if (config) templates.push({name: config.name || dir, config, path: path2config})
      }
    } catch (e) {
      this.env.em.error(`Error loading templates from ${path}`, e)
    }
    return templates
  }

  async loadCommandsFrom ({path}) {
    let commands = []
    try {
      let files = await this.env.fs.readdir(path)
      for (let file of files) {
        commands.push({file: file, path: this.env.path.resolve(path, file)})
      }
    } catch (e) {
      this.env.em.error(`Error loading commands from ${path}`, e)
    }
    return commands
  }
}

module.exports = FileManager
