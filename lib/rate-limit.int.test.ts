import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getDb, getPool } from "@/lib/db";
import { consumeLimit, pruneLimits } from "./rate-limit";

// The counter on a real Postgres: it must count requests that arrive at the same moment one by one, restart its window on time, and keep its subjects apart.

const db = () => getDb();
const subject = () => `test-${randomUUID()}`;
const limit = (who: string, overrides: Partial<Parameters<typeof consumeLimit>[1]> = {}) => ({ purpose: "test", subject: who, windowSeconds: 600, max: 3, ...overrides });

afterAll(async () => {
  await getPool().query("delete from rate_limit where key like 'vd:test:%' or key like 'vd:prune:%'");
  await getPool().end();
});
beforeAll(() => {
  void getDb();
});

describe("consumeLimit", () => {
  it("allows up to max requests in a window and refuses the next, with a retry time", async () => {
    const who = subject();
    const results = [];
    for (let i = 0; i < 5; i += 1) results.push(await consumeLimit(db(), limit(who)));
    expect(results.map((r) => r.allowed)).toEqual([true, true, true, false, false]);
    expect(results.map((r) => r.count)).toEqual([1, 2, 3, 4, 5]);
    expect(results[3].retryAfterSeconds).toBeGreaterThan(590);
    expect(results[3].retryAfterSeconds).toBeLessThanOrEqual(600);
  });

  it("keeps subjects and purposes apart", async () => {
    const one = subject();
    const two = subject();
    await consumeLimit(db(), limit(one, { max: 1 }));
    expect((await consumeLimit(db(), limit(one, { max: 1 }))).allowed).toBe(false);
    expect((await consumeLimit(db(), limit(two, { max: 1 }))).allowed).toBe(true);
    expect((await consumeLimit(db(), limit(one, { max: 1, purpose: "other" }))).allowed).toBe(true);
    await getPool().query("delete from rate_limit where key like 'vd:other:%'");
  });

  it("counts requests that arrive at the same moment exactly — none is «the first» twice", async () => {
    const who = subject();
    const results = await Promise.all(Array.from({ length: 12 }, () => consumeLimit(db(), limit(who, { max: 5 }))));
    expect(results.filter((r) => r.allowed)).toHaveLength(5);
    expect(results.map((r) => r.count).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it("starts a fresh window once the old one is over, and the new window is a full one", async () => {
    const who = subject();
    for (let i = 0; i < 3; i += 1) await consumeLimit(db(), limit(who));
    expect((await consumeLimit(db(), limit(who))).allowed).toBe(false);
    // Age the window instead of waiting: its start moves into the past.
    await getPool().query("update rate_limit set last_request = last_request - 601000 where key = $1", [`vd:test:${who}`]);
    const fresh = await consumeLimit(db(), limit(who));
    expect(fresh).toMatchObject({ allowed: true, count: 1 });
    expect(fresh.retryAfterSeconds).toBeGreaterThan(590);
  });

  it("does not stretch a window by counting inside it (the start stays where it was)", async () => {
    const who = subject();
    await consumeLimit(db(), limit(who));
    const before = (await getPool().query("select last_request from rate_limit where key = $1", [`vd:test:${who}`])).rows[0].last_request;
    await consumeLimit(db(), limit(who));
    await consumeLimit(db(), limit(who));
    expect((await getPool().query("select last_request from rate_limit where key = $1", [`vd:test:${who}`])).rows[0].last_request).toBe(before);
  });

  it("uses a window of the length it is given", async () => {
    const who = subject();
    const first = await consumeLimit(db(), limit(who, { windowSeconds: 30, max: 1 }));
    expect(first.retryAfterSeconds).toBeLessThanOrEqual(30);
    expect(first.retryAfterSeconds).toBeGreaterThan(25);
  });
});

describe("pruneLimits", () => {
  it("removes expired counters of this module only, and not the live ones or Better Auth's", async () => {
    const old = `vd:prune:${randomUUID()}`;
    const live = `vd:prune:${randomUUID()}`;
    const foreign = `203.0.113.${Math.floor(Math.random() * 200)}|/sign-in/email-${randomUUID()}`;
    await getPool().query(
      `insert into rate_limit (id, key, count, last_request) values
         ($1, $2, 1, (extract(epoch from clock_timestamp()) * 1000)::bigint - 90000000),
         ($3, $4, 1, (extract(epoch from clock_timestamp()) * 1000)::bigint),
         ($5, $6, 1, (extract(epoch from clock_timestamp()) * 1000)::bigint - 90000000)`,
      [randomUUID(), old, randomUUID(), live, randomUUID(), foreign],
    );
    await pruneLimits(db(), Date.now() + 365 * 24 * 3600 * 1000);
    const left = (await getPool().query("select key from rate_limit where key in ($1, $2, $3)", [old, live, foreign])).rows.map((r: { key: string }) => r.key);
    expect(left.sort()).toEqual([live, foreign].sort());
    await getPool().query("delete from rate_limit where key = $1", [foreign]);
  });
});
