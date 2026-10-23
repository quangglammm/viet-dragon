import { MIN_PASSWORD_LENGTH } from "./constants";

// Temporary passwords are generated in the admin's browser and shown once: the account is created
// with `mustChangePassword`, so the value only has to survive until the person's first sign-in.
// No 0/O, 1/l/I — the admin often reads it out or types it from a screenshot.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
const BYTE_RANGE = 256;
// Bytes at or above this would favour the first symbols (256 is not a multiple of the alphabet size).
const UNBIASED_LIMIT = BYTE_RANGE - (BYTE_RANGE % ALPHABET.length);

export const TEMP_PASSWORD_LENGTH = Math.max(16, MIN_PASSWORD_LENGTH);

export type RandomBytes = (length: number) => Uint8Array;

const browserRandomBytes: RandomBytes = (length) => globalThis.crypto.getRandomValues(new Uint8Array(length));

/** Rejection sampling, so every symbol is equally likely. `randomBytes` is injectable for tests. */
export function generateTempPassword(randomBytes: RandomBytes = browserRandomBytes): string {
  let password = "";
  while (password.length < TEMP_PASSWORD_LENGTH) {
    for (const byte of randomBytes(TEMP_PASSWORD_LENGTH)) {
      if (byte < UNBIASED_LIMIT && password.length < TEMP_PASSWORD_LENGTH) password += ALPHABET[byte % ALPHABET.length];
    }
  }
  return password;
}
