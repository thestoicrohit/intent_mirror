import test from 'node:test'
import assert from 'node:assert/strict'

// minimal browser shims so the browser-only modules can run under Node
const store = new Map()
globalThis.localStorage = {
  getItem: k => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: k => store.delete(k),
}

const { passwordStrength, createUser, verifyLogin, resetPassword, getUser, issueOtp, checkOtp } = await import('../src/web3/auth.js')

test('password strength increases with variety and length', () => {
  assert.equal(passwordStrength('abc').score, 0)
  assert.ok(passwordStrength('Abcdefg1').score >= 2)
  assert.equal(passwordStrength('Correct-Horse-Battery-9').score, 4)
})

test('sign up stores a salted hash, never the password', async () => {
  const u = await createUser({ name: 'Ada', email: 'Ada@Example.com', password: 'Sup3r#secret' })
  assert.equal(u.email, 'ada@example.com')
  assert.ok(!JSON.stringify(getUser('ada@example.com')).includes('Sup3r#secret'))
  await assert.rejects(createUser({ name: 'Ada', email: 'ada@example.com', password: 'x' }), /already exists/)
})

test('login accepts the right password and rejects the wrong one', async () => {
  await verifyLogin('ada@example.com', 'Sup3r#secret')
  await assert.rejects(verifyLogin('ada@example.com', 'nope'), /Incorrect password/)
  await assert.rejects(verifyLogin('ghost@example.com', 'x'), /No account/)
})

test('password reset replaces the old password', async () => {
  await resetPassword('ada@example.com', 'N3w#password')
  await verifyLogin('ada@example.com', 'N3w#password')
  await assert.rejects(verifyLogin('ada@example.com', 'Sup3r#secret'), /Incorrect/)
})

test('one-time codes: correct code works once, wrong codes run out', () => {
  const code = issueOtp('a@b.co')
  assert.match(code, /^\d{6}$/)
  assert.equal(checkOtp('a@b.co', code), null)
  assert.match(checkOtp('a@b.co', code), /new code/i)   // already consumed

  const c2 = issueOtp('a@b.co')
  const wrong = c2 === '000000' ? '111111' : '000000'
  for (let i = 0; i < 5; i++) assert.match(checkOtp('a@b.co', wrong), /Wrong code/)
  assert.match(checkOtp('a@b.co', wrong), /Too many/)
})
