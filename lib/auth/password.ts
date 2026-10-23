import { type Algorithm, hash, verify } from "@node-rs/argon2";

// Algorithm.Argon2id. The library declares `Algorithm` as an ambient const enum, which cannot be
// imported under `isolatedModules`, so the value is spelled out; password.test.ts asserts the
// stored hash really starts with "$argon2id$".
const ARGON2ID = 2 as Algorithm;

// Library defaults otherwise (19 MiB, 2 passes, 1 lane — OWASP's minimum profile, ~15 ms).
// Raise the cost here if the VPS is comfortable with it; stored hashes carry their own parameters.
export function hashPassword(password: string): Promise<string> {
  return hash(password, { algorithm: ARGON2ID });
}

export async function verifyPassword({
  hash: stored,
  password,
}: Readonly<{ hash: string; password: string }>): Promise<boolean> {
  try {
    return await verify(stored, password);
  } catch {
    // A malformed stored hash must read as "wrong password", never as a 500 that tells an attacker something.
    return false;
  }
}
