const { default: AccountModel } = require("../infra/db/sequelize/models/Account");
const { sequelize } = require("../infra/db/sequelize/sequelize");

beforeAll(async () => {
   await sequelize.authenticate()
})

afterAll(async () => {
  await sequelize.close()
})

afterEach(async () => {
  await AccountModel.destroy({ where: {}, truncate: true })
})