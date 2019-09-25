// libs
import path from 'path'
import express from 'express'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import helmet from 'helmet'
import compression from 'compression'
import { Server } from 'http'
import { renderFile } from 'ejs'
import cors from 'cors'
import morgan  from 'morgan'
// src
import { build404ErrorHandler, build500ErrorHandler, getPort } from './utils'
import logger from './config/winston'

const port = getPort()
const app = express()
const httpServer = Server(app)

// gzip filter
app.use(compression())
app.disable('etag')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))
//logging
app.use(morgan('dev', { stream: logger.stream }))


// parse application/json
app.use(bodyParser.json())
app.engine('ejs', renderFile)
app.set('view engine', 'ejs')
app.set('views', path.resolve('./server/templates/web'))
app.use(express.static(path.resolve('./server/public')))

app.use(cookieParser())
// security package
app.use(helmet())
app.use(cors())

// Include server routes as a middleware
const controllers = [
  'todo'
]
controllers.map(name => app.use('/', require('./controllers/todo.js')))

app.use(build404ErrorHandler())
app.use(build500ErrorHandler())

const models = require('./models')

models.sequelize.sync({}).then(function () {
  /**
   * Listen on provided port, on all network interfaces.
   */
  httpServer.listen(port, err => {
    if (err)
      console.error(`Server startup failed: `, err)
    else
      console.info('==> 🌎 Listening on port %s. Open up http://localhost:%s/ in your browser.', port, port)

  })
}).catch((e) => {
  console.error('DB Connection Failed: ', e)
})

module.exports = app;
