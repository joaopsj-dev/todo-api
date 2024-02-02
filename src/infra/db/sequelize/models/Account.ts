import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize';

const AccountModel = sequelize.define('accounts', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  refreshToken: DataTypes.STRING,
  accessToken: DataTypes.STRING,
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  password: DataTypes.STRING,
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE
}, {
  tableName: 'accounts'
});

export default AccountModel
