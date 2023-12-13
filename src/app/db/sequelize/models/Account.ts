import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize';

const AccountModel = sequelize.define('accounts', {
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  password: DataTypes.STRING
});

export default AccountModel
