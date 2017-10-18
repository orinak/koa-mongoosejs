# koa-mongoosejs

Koa middleware to integrate Mongoose. 

*Highly opinionated, check <https://www.npmjs.com/package/koa-mongoose>*

## Install

```sh
npm install koa-mongoosejs
```

## Usage

```js
const { Schema } = require('mongoose')
const db = require('koa-mongoosejs')

// setup options
const url = 'mongodb://localhost/app'
const schemas = {
  Thing: new Schema({ name: String })
}

app.use(db({ url, schemas  }))

app.use(async ctx => {
  ctx.body = await ctx
    .model('Thing')
    .find({})
    .exec()
})
```

## License

MIT
