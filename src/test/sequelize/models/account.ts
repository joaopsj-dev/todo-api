import { DataTypes } from 'sequelize'
import { sequelizeTest } from '../sequelize'

export const makeAccountModel = sequelizeTest.define('accounts_test', {
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  password: DataTypes.STRING
}, {
  tableName: 'accounts_test'
})
