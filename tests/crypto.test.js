import test from 'node:test'
import assert from 'node:assert/strict'
import { COINS, fallbackSnapshot, fmtPrice, fmtCap, fmtPct, mulberry32 } from '../src/data/crypto.js'

test('PRNG is deterministic', () => {
  const a = mulberry32(42), b = mulberry32(42)
  assert.deepEqual([a(), a(), a()], [b(), b(), b()])
})

test('offline snapshot: every coin has a 168-point sparkline ending at its price', () => {
  const snap = fallbackSnapshot()
  assert.equal(snap.length, COINS.length)
  for (const c of snap) {
    assert.equal(c.spark.length, 168)
    assert.equal(c.spark.at(-1), c.price)
    assert.ok(c.spark.every(v => v > 0 && Number.isFinite(v)), c.symbol)
  }
})

test('offline 7d change matches the sparkline start', () => {
  for (const c of fallbackSnapshot()) {
    const implied = (c.spark.at(-1) / c.spark[0] - 1) * 100
    assert.ok(Math.abs(implied - c.d7) < 0.5, `${c.symbol}: ${implied} vs ${c.d7}`)
  }
})

test('formatters', () => {
  assert.equal(fmtPrice(98000), '$98,000')
  assert.equal(fmtPrice(2.4), '$2.40')
  assert.equal(fmtCap(2.17e9), '$2.17B')
  assert.equal(fmtPct(3.456), '+3.46%')
  assert.equal(fmtPct(-1), '-1.00%')
})
