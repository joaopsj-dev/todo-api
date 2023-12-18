import bcrypt from 'bcrypt'
import { BcryptEncrypterAdapter } from './bcrypt-encrypter-adapter'

jest.mock('bcrypt', () => ({
  async hash (): Promise<string> {
    return new Promise(resolve => resolve('hash'))
  },

  async compare (): Promise<boolean> {
    return new Promise(resolve => resolve(true))
  }
}))

const salt = 12
const makeSut = (): BcryptEncrypterAdapter => {
  return new BcryptEncrypterAdapter(salt)
}

describe('Bcrypt Adapter', () => {
  test('Should call hash method with correct values', async () => {
    const sut = makeSut()
    const hashSpy = jest.spyOn(bcrypt, 'hash')
    await sut.encrypt('any_value')
    expect(hashSpy).toHaveBeenCalledWith('any_value', salt)
  })

  test('Should call compare method with correct values', async () => {
    const sut = new BcryptEncrypterAdapter(salt)
    const compareSpy = jest.spyOn(bcrypt, 'compare')
    await sut.parse('any_value', 'hashed_password')
    expect(compareSpy).toHaveBeenCalledWith('any_value', 'hashed_password')
  })

  test('Should return a hash on encrypt success', async () => {
    const sut = makeSut()
    const hash = await sut.encrypt('any_value')
    expect(hash).toBe('hash')
  })

  test('Should return a true on parse success', async () => {
    const sut = makeSut()
    const parsed = await sut.parse('any_value', 'hashed_password')
    expect(parsed).toBe(true)
  })

  test('Should throw if bcrypt throw', async () => {
    const sut = makeSut()
    jest.spyOn(bcrypt, 'hash').mockImplementationOnce(() => { throw new Error() })
    const promise = sut.encrypt('any_value')
    await expect(promise).rejects.toThrow()
  })
})
