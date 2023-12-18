export interface Encrypter {
  encrypt: (data: string) => Promise<string>
  parse: (data: string, encrypted: string) => Promise<boolean>
}
