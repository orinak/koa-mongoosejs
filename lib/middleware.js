const compose = require('koa-compose')
const unless = require('koa-unless')

const delegate = require('delegates')

const { assign } = Object

function setup (mongoose) {
  return async (ctx, next) => {
    ctx.mongoose = mongoose

    delegate(ctx, 'mongoose')
      .method('model')
      .getter('models')

    return next()
  }
}

function errorHandler () {
  return async (ctx, next) => {
    try {
      await next()
    } catch (err) {
      const { name, errors } = err

      if (name !== 'ValidationError') throw err

      ctx.status = 422
      ctx.body = { errors }
    }
  }
}

module.exports = (opts = {}) => {
  const { mongoose } = opts

  const middleware = compose([
    setup(mongoose),
    errorHandler()
  ])

  return assign(middleware, { mongoose, unless })
}
