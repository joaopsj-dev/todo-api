export interface Account {
  id: string
  refreshToken: string
  accessToken: string
  name: string
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
}

export interface AddAccountData {
  name: string
  email: string
  password: string
}

export interface AccountDto {
  name: string
  email: string
  createdAt: Date
  updatedAt: Date
}
