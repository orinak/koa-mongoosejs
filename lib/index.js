const { Mongoose } = require('mongoose')

const createMiddleware = require('./middleware')

const { assign } = Object

const getConnectionOptions = (opts = {}) => {
  const optionKeys = [
    'useMongoClient',
    'promiseLibrary',
    'autoIndex',
    'autoReconnect',
    'reconnectTries',
    'reconnectInterval',
    'promiseLibrary',
    'poolSize',
    'bufferMaxEntries'
  ]

  const defaults = {
    useMongoClient: true,
    promiseLibrary: Promise,
    autoIndex: process.env.NODE_ENV !== 'production'
  }

  return optionKeys.reduce((acc, key) => {
    const val = opts[key] || defaults[key]
    return assign(acc, { [key]: val })
  }, {})
}

module.exports = (opts = {}) => {
  const { url, schemas = {}, plugins = [] } = opts

  const mongoose = new Mongoose()

  assign(mongoose, { Promise })

  for (let name in schemas) {
    mongoose.model(name, schemas[name])
  }

  plugins.forEach(fn => mongoose.plugin(fn))

  mongoose.connect(url, getConnectionOptions(opts))

  return createMiddleware({ mongoose })
}
