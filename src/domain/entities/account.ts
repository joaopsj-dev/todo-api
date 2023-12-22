export interface Account {
  id: string
  refreshToken: string
  name: string
  email: string
  password: string
}

export interface AddAccountData {
  name: string
  email: string
  password: string
}
