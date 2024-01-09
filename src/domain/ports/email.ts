export interface SendEmailData {
  to: string
  subject: string
  html?: string
}

export interface EmailProvider {
  send: (data: SendEmailData) => Promise<void>
}
