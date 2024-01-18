export interface Scheduler {
  create: (date: Date, callbackFunction: () => void) => any
  cancel: (schedule: any) => boolean
}
