import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize';

const AccountModel = sequelize.define('accounts', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  refreshToken: DataTypes.STRING,
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  password: DataTypes.STRING
}, {
  tableName: 'accounts'
});

export default AccountModel
