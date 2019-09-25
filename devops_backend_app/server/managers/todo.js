import Sequelize from 'sequelize'
const Op = Sequelize.Op             //sequelize operators like gte, gt, lte

import { getConnection } from './../utils'
import logger from '../config/winston'

export const getTodos = async () => {
  try {
    const query = `select * from todos;`
    const result =  await getConnection().query(query, {type: Sequelize.QueryTypes.SELECT})
    return result
  }
  catch (e) {
    logger.error(`error in  ${e}`)
    return 0
  }

}

