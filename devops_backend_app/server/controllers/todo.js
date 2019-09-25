// libs
import express from 'express'
import {
  getTodos
} from '../managers'
import logger from './../config/winston'

const router = express.Router()

router.get('/', async (req, res) => {
  logger.info('app route  endpoint  called.....')
  const todos = await getTodos()
  res
    .render('index', {'todos':todos})
})

router.get('/todos', async (req, res) => {
  const [todos] = await Promise.all([
    getTodos()
  ])

  try {
    res
      .status(200)
      .jsonp({
         todos
      })

  }
  catch (e) {
    res
      .status(400)
      .jsonp({
        'error':"error it is"
      })
  }

})

module.exports = router;

