import { type Transaction, type TransactionManager } from './sequelize-transaction-adapter-protocols';
import { type Sequelize, type Transaction as SequelizeTransaction } from 'sequelize';

export class SequelizeTransactionObjectAdapter implements Transaction {
  private _transaction: SequelizeTransaction | null = null

  constructor (
    private readonly sequelize: Sequelize
  ) {}

  getTransaction (): any {
    return this._transaction
  }

  async beginTransaction (): Promise<void> {
    this._transaction = await this.sequelize.transaction();
  }

  async commit (): Promise<void> {
    if (this._transaction) {
      await this._transaction.commit();
      this._transaction = null
    } else {
      throw new Error('Transaction has not been started.');
    }
  }

  async rollback (): Promise<void> {
    if (this._transaction) {
      await this._transaction.rollback();
      this._transaction = null
    } else {
      throw new Error('Transaction has not been started.');
    }
  }
}

export class SequelizeTransactionManagerAdapter implements TransactionManager {
  constructor (
    private readonly transactionObject: Transaction
  ) {}

  async transaction<T>(fn: (transaction: Transaction) => Promise<T>): Promise<T> {
    try {
      await this.transactionObject.beginTransaction();

      const result = await fn(this.transactionObject.getTransaction());
      await this.transactionObject.commit();
      return result;
    } catch (error) {
      await this.transactionObject.rollback();
      throw error;
    }
  }
}
