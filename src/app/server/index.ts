/* eslint-disable @typescript-eslint/no-misused-promises */
import { sequelize } from '../../infra/db/sequelize/sequelize'
import { makeNotifyTask } from '../factories/notify-task'

sequelize.authenticate()
  .then(async () => {
    const app = (await import('./config/app')).default
    app.listen(process.env.PORT, () => console.log(`Server running at http://localhost:${process.env.PORT}`))

    setInterval(async () => {
      await makeNotifyTask().notify()
    }, 1000 * 60)
  })
  .catch(console.error)
