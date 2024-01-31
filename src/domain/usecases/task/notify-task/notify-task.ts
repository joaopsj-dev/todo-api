/* eslint-disable @typescript-eslint/no-misused-promises */
import { type TaskRepository, type EmailProvider, type AccountRepository } from './notify-task-protocols'

export class NotifyTask {
  constructor (
    private readonly taskRepository: TaskRepository,
    private readonly accountRepository: AccountRepository,
    private readonly emailProvider: EmailProvider
  ) {}

  async notify (): Promise<void> {
    const tasksByNotify = await this.taskRepository.findByIsNotify()

    for (const task of tasksByNotify) {
      const { email } = await this.accountRepository.findById(task.accountId)

      this.emailProvider.send({
        to: email,
        subject: `Chegou a hora de fazer sua tarefa: ${task.name}`
      })

      await this.taskRepository.update({ isNotify: false }, task.id)
    }
  }
}
