const [store, load] = [Symbol('store'), Symbol('load')]
const [setProp] = [Symbol('get-prop')]
const [setStore, setFill, setBox] = [Symbol('set-store'), Symbol('set-fill'), Symbol('set-box')]

class Box {
  constructor ({props} = {}) {
    let _store = {}
    let _load = {}

    this[setProp]({name: store}, {set: v => _store = v, get: () => _store})
    this[setProp]({name: load}, {set: v => _load = v, get: () => _load})

    this[setProp]({name: 'store'})
    this[setProp]({name: 'fill'})
    this[setProp]({name: 'box'})
    this[setProp]({name: 'keys'}, {configurable: false, get: () => Object.keys(this)})
    this[setProp]({name: 'list'}, {configurable: false, get: () => Object.keys(this).map(k => this[k])})
    this[setProp]({name: 'has'}, {configurable: false, get: () => key => !!this.keys.find(i => i === key)})

    this.fill = props
  }

  [setProp] ({name, resolve}, {configurable = true, enumerable = false, set, get} = {}){
    switch (name) {
      case 'store':
        set = this[setStore]
        break
      case 'fill':
        set = this[setFill]
        break
      case 'box':
        set = this[setBox]
        break
    }

    if(resolve !== undefined) {
      let value = () => {
        this[load][name] = value
        return (resolve instanceof Function) ? resolve(this) : resolve
      }
      get = () => {
        if (this[load][name] !== value) this[store][name] = value()
        return this[store][name]
      }
      enumerable = true
    }

    Object.defineProperty(this, name, {configurable, enumerable, set: set , get: get})
  }

  [setStore] ({name, resolve, rewrite = false}) {
    if (!rewrite && this[name]) return
    if (name) {
      this[setProp]({name, resolve})
    }
  }

  [setBox] ({name, props = [], add = true}) {
    let resolve = new Box({props})
    if(add) this.store = {name, resolve}
  }

  [setFill] (props) {
    if (Array.isArray(props)) for (let prop of props) this.store = prop
  }
}

module.exports = Box