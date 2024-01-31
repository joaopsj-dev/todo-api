const { default: AccountModel } = require("../infra/db/sequelize/models/Account");
const { default: TaskModel } = require("../infra/db/sequelize/models/Task");
const { sequelize } = require("../infra/db/sequelize/sequelize");

beforeAll(async () => {
   await sequelize.authenticate()
})

afterAll(async () => {
  await sequelize.close()
})

beforeEach(async () => {
  await TaskModel.destroy({ where: {}, truncate: { cascade: true } })
  await AccountModel.destroy({ where: {}, truncate: { cascade: true } })
})