/* eslint-disable import/first */
/* eslint-disable @typescript-eslint/no-var-requires */
import dotenv from 'dotenv'
dotenv.config()
import { Sequelize } from 'sequelize'
const config = require('./config');

export const sequelize = new Sequelize(config[process.env.NODE_ENV])
