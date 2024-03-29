import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize';
import AccountModel from './Account';

const TaskModel = sequelize.define('tasks', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  accountId: {
    type: DataTypes.STRING,
    references: { model: AccountModel, key: 'id' }
  },
  name: DataTypes.STRING,
  description: DataTypes.STRING,
  notifyDate: {
    type: DataTypes.JSON,
    allowNull: true
  },
  endDate: {
    type: DataTypes.JSON,
    allowNull: true
  },
  isNotify: DataTypes.BOOLEAN,
  status: DataTypes.STRING
}, {
  tableName: 'tasks'
});

AccountModel.hasMany(TaskModel, {
  foreignKey: 'accountId',
  as: 'accountTasks',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

TaskModel.belongsTo(AccountModel, { foreignKey: 'accountId', onDelete: 'CASCADE', onUpdate: 'CASCADE', as: 'account' })

export default TaskModel
