const Command = require('../../../command')
const type = require('../../../types/index')

module.exports = class extends Command {
  get mode () {
    return this.env.mode.param
  }
  get info () {
    return 'Create a new frontizer project'
  }
  get props () {
    return {
      'no-app': {
        alias: 'na',
        desc: 'Disable application server',
        type: type.PARAMS_FLAG,
        default: false
      },
      'app-port': {
        alias: 'ap',
        desc: 'Application server port number',
        type: type.PARAMS_INT,
        default: 3000
      },
      'no-livereload': {
        alias: ['nl', 'nlr'],
        desc: 'Disable live-reload at application server',
        type: type.PARAMS_FLAG,
        default: false
      },
      'livereload-port': {
        alias: 'lp',
        desc: 'Live-reload port number',
        type: type.PARAMS_INT,
        default: 35729
      },
      'styles': {
        desc: 'Stylus files to be compiled separated',
        type: type.PARAMS_LIST,
        default: ['main.styl']
      },
      'js': {
        desc: 'Javascript files to be compiled separated',
        type: type.PARAMS_LIST,
        default: ['main.js']
      },
      'source-path': {
        alias: 'sp',
        desc: 'Path to source files',
        type: type.PARAMS_STRING,
        default: 'assets'
      },
      'dest-path': {
        alias: 'dp',
        desc: 'Path to compiled assets path during app serve',
        type: type.PARAMS_STRING,
        default: 'assets/compiled'
      },
      'views-path': {
        alias: 'vp',
        desc: 'Compiled assets path',
        type: type.PARAMS_STRING,
        default: 'views'
      },
      'data-path': {
        alias: 'dp',
        desc: 'Data files path',
        type: type.PARAMS_STRING,
        default: 'data'
      },
      'api-path': {
        alias: 'api',
        desc: 'Api handlers path',
        type: type.PARAMS_STRING,
        default: 'api'
      },
      'root': {
        desc: 'Root directory of project',
        type: type.PARAMS_STRING,
        default: process.cwd()
      },
      'no-cors': {
        alias: 'nc',
        desc: 'Disable CORS',
        type: type.PARAMS_FLAG,
        default: false
      }
    }
  }

  handle ({state}) {
    const root = state.root || process.cwd()

    // folders to create on initialization
    let folders = []
    // files to create on initialization
    let files = []

    let sources = ['styles', 'js']
    // sources
    sources.forEach(type => {
      let assetPath = this.env.path.join(state['source-path'], type)
      let createdFiles = []
      let unique = {}

      state[type].forEach(i => {
        let withoutExt = i.split('.').slice(0, -1).join('.')
        if (unique[withoutExt]) {
          this.env.console.write.log(type + ' arg "' + i + '" was ignored because it is not unique')
          return
        }
        unique[withoutExt] = true

        files.push({name: assetPath + '/' + i, content: ''})
        createdFiles.push(i)
      })
    })

    // config fields containing folders to create
    let configFolders = ['source-path', 'dest-path']

    // express app settings
    if (!state['no-app']) {
      configFolders.push('views-path')
      configFolders.push('data-path')
      folders.push('data')
    } else {
      this.env.console.write.warning('Application server views and data folders ignored (--no-app flag is active)')
    }

    // CREATE FOLDERS

    configFolders.forEach(k => {
      state[k] = state[k].replace(/^\/|\/$/g, '')
      let cur = ''
      for (let f of state[k].split('/')) {
        cur += f
        if (folders.indexOf(cur) === -1) folders.push(cur)
        cur += '/'
      }
    })

    folders.push(this.env.path.join(state['source-path'], 'styles'))
    folders.push(this.env.path.join(state['source-path'], 'js'))
    folders.push(this.env.path.join(state['source-path'], 'fonts'))
    folders.push(this.env.path.join(state['source-path'], 'static'))

    for (let folder of folders) {
      if (!this.env.fm.makeDirSync({path: this.env.path.join(root, folder)}, this)) return
    }

    // CREATE FILES

    if (!state['no-app']) {
      files.push({
        name: state['views-path'] + '/layout.pug',
        content:
        'doctype html\n' +
        'html\n\t' +
        'head\n\t\t' +
        'meta(charset="UTF-8")\n\t\t' +
        'title=title\n\t\t' +
        'meta(name="viewport" content="width=device-width,initial-scale=1,user-scalable=no,maximum-scale=1")\n\t\t' +
        '!=__css\n\t' +
        'body\n\t\t' +
        'main\n\t\t\t' +
        'block main\n\t\t' +
        '!=__js\n\t\t' +
        '!=__livereload'
      })
      files.push({
        name: state['views-path'] + '/index.pug',
        content: 'extends layout\nblock main\n\th1 Home page'
      })
      files.push({
        name: state['data-path'] + '/index.js',
        content: 'exports.title = \'Hello, world!\''
      })
    } else {
      this.env.console.write.warning('Application server views and data files ignored (--no-app flag is active)')
    }

    for(let file of files) {
      if (!this.env.fm.makeFileSync({path: this.env.path.join(root, file.name), content:  file.content}, this)) return
    }
  }
}
