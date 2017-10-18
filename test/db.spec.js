import test from 'ava'

import Koa from 'koa'

import { MongoDBServer } from 'mongomem'
import { Schema } from 'mongoose'

import Axios from 'axios-serve'

import db from '../lib'

const options = {
  schemas: {
    Num: new Schema({ a: Number })
  }
}

test.before(async t => {
  await MongoDBServer.start()
  options.url = await MongoDBServer.getConnectionString()
})

test('Basic', async t => {
  const app = new Koa()

  app.use(db(options))

  app.use(ctx => {
    const { mongoose, model, models } = ctx

    t.is(typeof mongoose, 'object')
    t.is(typeof model, 'function')

    t.is(models, mongoose.models)
    t.truthy(models.Num)

    ctx.body = 'ok'
  })

  const req = Axios.createServer(app.callback())

  await req
    .get('/')
    .catch(err => console.log(err.response.status))
})

test('error handler', async t => {
  const app = new Koa()

  app.use(db(options))

  t.plan(3)

  app.use(async (ctx, next) => {
    const { type } = ctx.query

    if (type === 'mongoose') {
      await ctx
        .model('Num')
        .create({ a: 'one' })
    } else {
      ctx.throw(404)
    }
  })

  const req = Axios.createServer(app.callback())

  await req
    .get('/?type=mongoose')
    .catch(err => {
      const res = err.response
      t.is(res.status, 422, 'invalid')
      t.is(typeof res.data.errors, 'object', 'invalid has errors')
    })

  await req
    .get('/?type=other')
    .catch(err => {
      const res = err.response
      t.is(res.status, 404, 'other')
    })
})
