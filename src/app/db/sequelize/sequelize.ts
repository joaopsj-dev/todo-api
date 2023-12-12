/* eslint-disable @typescript-eslint/no-var-requires */
import { Sequelize } from 'sequelize'
const config = require('./config');

export const sequelize = new Sequelize(config.development)
