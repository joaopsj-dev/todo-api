import { Sequelize } from 'sequelize'
const config = require('./config')

export const sequelizeTest = new Sequelize(config)
