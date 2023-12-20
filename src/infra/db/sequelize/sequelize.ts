/* eslint-disable import/first */
const dotenv = require('dotenv')
dotenv.config()
import { Sequelize } from 'sequelize'
const config = require('./config');

export const sequelize = new Sequelize(config[process.env.NODE_ENV])
