import Koa from 'koa'
import { Nuxt, Builder } from 'nuxt'

const app = new Koa()
const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
config.dev = !(app.env === 'production')

// 使用ctx.body解析中间件,要放在router中间件之前
var bodyParser = require('koa-bodyparser')
app.use(bodyParser())

// jwtAuth
const jwtAuth = require('./middleware/jwtAuth')
app.use(jwtAuth)
// router
require('./router/index')(app)

// Instantiate nuxt.js
const nuxt = new Nuxt(config)

// Build in development
if (config.dev) {
  const builder = new Builder(nuxt)
  builder.build().catch(e => {
    console.error(e) // eslint-disable-line no-console
    process.exit(1)
  })
}

app.use(ctx => {
  ctx.status = 200 // koa defaults to 404 when it sees that status is unset

  return new Promise((resolve, reject) => {
    ctx.res.on('close', resolve)
    ctx.res.on('finish', resolve)
    nuxt.render(ctx.req, ctx.res, promise => {
      // nuxt.render passes a rejected promise into callback on error.
      promise.then(resolve).catch(reject)
    })
  })
})

app.listen(3200)
console.log('Server listening on ' + host + ':' + port) // eslint-disable-line no-console
