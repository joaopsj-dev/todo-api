import { type AccountRepository, type EmailProvider, type Token, type TokenPayload, type ParseTokenError } from './send-recover-email-protocols'
import { type Account } from '../../../entities/account'
import { type Either } from '../../../protocols/either'
import { SendRecoverEmail } from './send-recover-email'

const makeFakeAccount = (): Account => ({
  id: 'any_id',
  refreshToken: 'any_account_refreshToken',
  name: 'any_name',
  email: 'any_email',
  password: 'any_password'
})

const makeAccountRepository = (): AccountRepository => {
  class AccountRepositoryStub implements AccountRepository {
    async findByEmail (): Promise<Account> {
      return new Promise(resolve => resolve(makeFakeAccount()))
    }

    findById: () => Promise<Account>
    create: () => Promise<Account>
    update: () => Promise<Account>
  }
  return new AccountRepositoryStub()
}

const makeTokenProvider = (): Token => {
  class TokenProviderStub implements Token {
    async generate (): Promise<string> {
      return new Promise(resolve => resolve('accessToken'))
    }

    parse: (token: string, secretKey: string) => Promise<Either<ParseTokenError, TokenPayload>>
  }
  return new TokenProviderStub()
}

const makeEmailProvider = (): EmailProvider => {
  class EmailProviderStub implements EmailProvider {
    async send (): Promise<void> {
      return new Promise(resolve => resolve())
    }
  }

  return new EmailProviderStub()
}

interface SutTypes {
  sut: SendRecoverEmail
  accountRepositoryStub: AccountRepository
  tokenStub: Token
  emailProviderStub: EmailProvider
}

const makeSut = (): SutTypes => {
  const accountRepositoryStub = makeAccountRepository()
  const tokenStub = makeTokenProvider()
  const emailProviderStub = makeEmailProvider()
  const sut = new SendRecoverEmail(accountRepositoryStub, tokenStub, emailProviderStub)

  return {
    sut,
    accountRepositoryStub,
    tokenStub,
    emailProviderStub
  }
}

describe('SendRecoverEmail usecase', () => {
  test('Should throw AccountRepository throws', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    jest.spyOn(accountRepositoryStub, 'findByEmail').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const promise = sut.send('valid_email')

    await expect(promise).rejects.toThrow()
  })

  test('Should call findByEmail with correct e-mail', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    const findByEmailSpy = jest.spyOn(accountRepositoryStub, 'findByEmail')
    await sut.send('valid_email')

    expect(findByEmailSpy).toHaveBeenCalledWith('valid_email')
  })

  test('Should return a false if there is no user with the email provided', async () => {
    const { sut, accountRepositoryStub } = makeSut()

    jest.spyOn(accountRepositoryStub, 'findByEmail').mockReturnValueOnce(new Promise(resolve => resolve(null)))
    const response = await sut.send('invalid_email')

    expect(response).toBeFalsy()
  })

  test('Should throw Token throws', async () => {
    const { sut, tokenStub } = makeSut()

    jest.spyOn(tokenStub, 'generate').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const promise = sut.send('valid_email')

    await expect(promise).rejects.toThrow()
  })

  test('Should call Token generate method with correct values', async () => {
    const { sut, tokenStub } = makeSut()

    const tokenSpy = jest.spyOn(tokenStub, 'generate')

    await sut.send('valid_email')

    expect(tokenSpy).toHaveBeenCalledWith({ id: 'any_id' }, expect.objectContaining({
      expiresIn: expect.any(String),
      secretKey: expect.any(String)
    }))
  })

  test('Should throw EmailProvider throws', async () => {
    const { sut, emailProviderStub } = makeSut()

    jest.spyOn(emailProviderStub, 'send').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const promise = sut.send('valid_email')

    await expect(promise).rejects.toThrow()
  })

  test('Should call EmailProvider send method with correct values', async () => {
    const { sut, emailProviderStub } = makeSut()

    const emailSpy = jest.spyOn(emailProviderStub, 'send')
    await sut.send('valid_email')

    expect(emailSpy).toHaveBeenCalledWith(expect.objectContaining({
      to: 'valid_email',
      subject: expect.any(String),
      html: expect.any(String)
    }))
  })

  test('Should return a true on success', async () => {
    const { sut } = makeSut()

    const response = await sut.send('valid_email')

    expect(response).toBe(true)
  })
})
