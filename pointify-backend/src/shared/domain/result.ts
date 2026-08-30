export type Result<T, E = Error> = Ok<T, E> | Fail<T, E>;

export class Ok<T, _E = never> {
  readonly isOk = true as const;
  readonly isFail = false as const;

  constructor(public readonly value: T) {}
}

export class Fail<_T = never, E = Error> {
  readonly isOk = false as const;
  readonly isFail = true as const;

  constructor(public readonly error: E) {}
}

export const ok = <T, E = never>(value: T): Result<T, E> => new Ok(value);
export const fail = <T = never, E = Error>(error: E): Result<T, E> => new Fail(error);
