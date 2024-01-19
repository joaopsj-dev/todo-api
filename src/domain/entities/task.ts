export interface Task {
  id: string
  accountId: string
  name: string
  description: string
  notifyDate?: Date
  endDate?: Date
  isNotify: boolean
  status: 'pending' | 'in progress' | 'concluded' | 'delayed'
  notification: any
  createdAt: Date
  updatedAt: Date
}

export interface AddTaskData {
  accountId: string
  name: string
  description: string
  notifyDate?: Date
  endDate?: Date
  isNotify: boolean
}
