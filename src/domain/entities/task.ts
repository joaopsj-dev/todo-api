export interface ObjectDate {
  year: number
  month: number
  day: number
  hour: number
  minute: number
}

export interface Task {
  id: string
  accountId: string
  name: string
  description?: string
  notifyDate?: ObjectDate
  endDate?: ObjectDate
  isNotify: boolean
  status: 'pending' | 'in progress' | 'concluded' | 'delayed'
  createdAt: Date
  updatedAt: Date
}

export interface AddTaskData {
  accountId: string
  name: string
  description?: string
  notifyDate?: ObjectDate
  endDate?: ObjectDate
  isNotify: boolean
}
