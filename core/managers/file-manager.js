class FileManager {
  constructor ({env}) {
    this.env = env
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
