import bcrypt from 'bcrypt'
import { type Encrypter } from '../../../domain/ports/encrypter'

export class BcryptEncrypterAdapter implements Encrypter {
  constructor (private readonly salt: number) {}
  async encrypt (value: string): Promise<string> {
    const hash = await bcrypt.hash(value, this.salt)
    return hash
  }

  async parse (data: string, encrypted: string): Promise<boolean> {
    return await bcrypt.compare(data, encrypted)
  }
}
