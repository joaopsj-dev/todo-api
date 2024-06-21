export interface Transaction {
  getTransaction: () => any
  beginTransaction: () => Promise<void>
  commit: () => Promise<void>
  rollback: () => Promise<void>
}

export interface TransactionManager {
  transaction: <T>(fn: (transaction: Transaction) => Promise<T>) => Promise<T>
}
