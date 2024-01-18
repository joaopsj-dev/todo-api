import { type Scheduler } from '../../../domain/ports/schedule'
import schedule from 'node-schedule'

export class NodeSchedulerAdapter implements Scheduler {
  create (date: Date, callbackFunction: () => void): any {
    return schedule.scheduleJob(date, callbackFunction)
  }

  cancel (schedule: any): boolean {
    return schedule.cancel()
  }
}
