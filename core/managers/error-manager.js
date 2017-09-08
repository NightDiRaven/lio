class ErrorManager {
  constructor ({env}) {
    this.env = env
  }

  error (message = false, error, blob = true) {
    this.env.console.write.error(message || error.message)
    if (error && blob) this.env.console.write.blob(error.stack)
  }
}

module.exports = ErrorManager
