/* eslint-disable n/handle-callback-err */
export type Either<F, S> = Failure<F, S> | Success<F, S>

export class Failure<F, S> {
  constructor (public error: F) {}

  isFailure (): this is Failure<F, S> {
    return true
  }

  isSuccess (): this is Success<F, S> {
    return false
  }
}

export class Success<F, S> {
  constructor (public response: S) {}

  isSuccess (): this is Success<F, S> {
    return true
  }

  isFailure (): this is Failure<F, S> {
    return false
  }
}

export const failure = <F, S>(f: F): Either<F, S> => {
  return new Failure(f)
}
export const success = <F, S>(s: S): Either<F, S> => {
  return new Success(s)
}
