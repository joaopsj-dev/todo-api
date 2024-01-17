export interface Account {
  id: string
  refreshToken: string
  name: string
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
}

export interface AddAccountData {
  refreshToken: string
  name: string
  email: string
  password: string
}
