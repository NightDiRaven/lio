const InitCommand = require('./init.-i')
const type = require('../types')
const path = require('path')

module.exports = class extends InitCommand {
  get info () {
    return 'Create directory and init a new project in created folder'
  }
  get props () {
    return {
      '<dir>': {
        position: 1,
        desc: 'Directory name',
        type: type.PARAMS_PLACEHOLDER,
        required: true
      },
      '<template>': {
        ...super.props['<template>'],
        position: 2
      },
      '<init parameters>': {
        desc: 'Any available init params except -root (auto)',
        type: type.PARAMS_PLACEHOLDER
      }
    }
  }

  handle (state) {
    const fs = require('fs')
    const root = process.cwd()

    try {
      fs.mkdirSync(path.join(root, state['<dir>']))
      this.console.success('Folder ' + path.join(root, state['<dir>']) + ' created')
    }
    catch (e) {
      if (e.code === 'EEXIST') this.console.warning('Folder ' + state['<dir>'] + ' already exists')
      else {
        this.commander.error('Error trying create folder ' + path.join(root, state['<dir>']))
      }
    }
    let args = process.argv.slice(0)
    args.push(`root=${path.join(root, state['<dir>'])}`)
    this.commander.command('init', args)
  }
}
