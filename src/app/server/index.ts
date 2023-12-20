import { sequelize } from '../../infra/db/sequelize/sequelize'

sequelize.authenticate()
  .then(async () => {
    const app = (await import('./config/app')).default
    app.listen(process.env.PORT, () => console.log(`Server running at http://localhost:${process.env.PORT}`))
  })
  .catch(console.error)
