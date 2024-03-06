export const Codes = Object.freeze({
  DONE: 0,

  ERR_INVALID_USERNAME: 10,
  ERR_INVALID_PASSWORD: 11,
  ERR_INVALID_EMAIL: 12,

  ERR_EXISTENT_EMAIL: 15,

  ERR_WRONG_UNAME_OR_PW: 30,
  ERR_AUTH_FAILED: 50,
  ERR_WRONG_TOKEN_TYPE: 51,

  ERR_SESSION_DB: 80,
});

export type CodeAndData<T> = [0, T] | [Omit<number, 0>, null];