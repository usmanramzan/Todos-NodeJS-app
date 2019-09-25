import Sequelize from 'sequelize'
require('dotenv').config()
export let dbConnection = null

export const getConnection = () => {
  if (dbConnection) {
    return dbConnection
  }
  return dbConnection = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  })

}