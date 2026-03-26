// tests/api.test.js
// Run with: node tests/run.js  (while API is running on port 3001)

import assert from 'assert'

const BASE = 'http://localhost:3001'
export const results = []

export async function test(name, fn) {
  try {
    await fn()
    results.push({ name, status: 'PASS' })
    console.log(`  ✅ ${name}`)
  } catch (e) {
    results.push({ name, status: 'FAIL', error: e.message })
    console.log(`  ❌ ${name}: ${e.message}`)
  }
}

async function api(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const data = await res.json()
  data._status = res.status
  return data
}

export async function run() {
  console.log('\n🧪 Running API Tests...\n')

  // ── Health ────────────────────────────────────────────────────────────────
  await test('GET /api/health returns success', async () => {
    const r = await api('/api/health')
    assert.strictEqual(r.success, true, 'success should be true')
  })

  // ── Users GET ─────────────────────────────────────────────────────────────
  await test('GET /api/users returns array with seeded data', async () => {
    const r = await api('/api/users')
    assert.strictEqual(r.success, true)
    assert.ok(Array.isArray(r.data), 'data should be array')
    assert.ok(r.data.length >= 3, 'should have at least 3 seeded users')
  })

  // ── Users POST ────────────────────────────────────────────────────────────
  let createdUserId
  await test('POST /api/users creates a new user', async () => {
    const r = await api('/api/users', {
      method: 'POST',
      body: { name: 'Test User', email: 'test@example.com' },
    })
    assert.strictEqual(r.success, true)
    assert.strictEqual(r.data.name, 'Test User')
    assert.strictEqual(r.data.email, 'test@example.com')
    assert.ok(r.data.id, 'created user should have an id')
    createdUserId = r.data.id
  })

  await test('POST /api/users with missing fields returns error', async () => {
    const r = await api('/api/users', { method: 'POST', body: { name: 'No Email' } })
    assert.strictEqual(r.success, false, 'success should be false for missing email')
    assert.strictEqual(r._status, 400)
  })

  // ── Users GET by id ───────────────────────────────────────────────────────
  await test('GET /api/users/:id returns correct user', async () => {
    const r = await api('/api/users/1')
    assert.strictEqual(r.success, true)
    assert.strictEqual(r.data.id, 1)
  })

  await test('GET /api/users/9999 returns 404', async () => {
    const r = await api('/api/users/9999')
    assert.strictEqual(r.success, false)
    assert.strictEqual(r._status, 404)
  })

  // ── Users PUT ─────────────────────────────────────────────────────────────
  await test('PUT /api/users/:id updates name', async () => {
    const id = createdUserId || 1
    const r = await api(`/api/users/${id}`, { method: 'PUT', body: { name: 'Updated Name' } })
    assert.strictEqual(r.success, true)
    assert.strictEqual(r.data.name, 'Updated Name')
  })

  // ── Users DELETE ──────────────────────────────────────────────────────────
  await test('DELETE /api/users/:id removes user', async () => {
    const id = createdUserId || 3
    const r = await api(`/api/users/${id}`, { method: 'DELETE' })
    assert.strictEqual(r.success, true)
    const check = await api(`/api/users/${id}`)
    assert.strictEqual(check.success, false)
    assert.strictEqual(check._status, 404)
  })

  // ── Posts GET ─────────────────────────────────────────────────────────────
  await test('GET /api/posts returns array', async () => {
    const r = await api('/api/posts')
    assert.strictEqual(r.success, true)
    assert.ok(Array.isArray(r.data))
    assert.ok(r.data.length >= 3, 'should have at least 3 seeded posts')
  })

  // ── Posts POST ────────────────────────────────────────────────────────────
  let createdPostId
  await test('POST /api/posts creates post', async () => {
    const r = await api('/api/posts', {
      method: 'POST',
      body: { title: 'Test Post', content: 'Test content.', userId: 1 },
    })
    assert.strictEqual(r.success, true)
    assert.strictEqual(r.data.title, 'Test Post')
    assert.strictEqual(r.data.userId, 1)
    createdPostId = r.data.id
  })

  // ── Posts filter ──────────────────────────────────────────────────────────
  await test('GET /api/posts?userId=1 filters correctly', async () => {
    const r = await api('/api/posts?userId=1')
    assert.strictEqual(r.success, true)
    assert.ok(Array.isArray(r.data))
    r.data.forEach(p => assert.strictEqual(p.userId, 1, `Post ${p.id} has wrong userId`))
    assert.ok(r.data.length >= 1)
  })

  // ── Posts GET by id ───────────────────────────────────────────────────────
  await test('GET /api/posts/:id returns correct post', async () => {
    const r = await api('/api/posts/1')
    assert.strictEqual(r.success, true)
    assert.strictEqual(r.data.id, 1)
  })

  // ── Posts DELETE ──────────────────────────────────────────────────────────
  await test('DELETE /api/posts/:id removes post', async () => {
    const id = createdPostId || 3
    const r = await api(`/api/posts/${id}`, { method: 'DELETE' })
    assert.strictEqual(r.success, true)
    const check = await api(`/api/posts/${id}`)
    assert.strictEqual(check.success, false)
    assert.strictEqual(check._status, 404)
  })

  // ── Summary ───────────────────────────────────────────────────────────────
  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`)
  if (failed > 0) {
    console.log('\nFailed tests:')
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`)
    })
  }
  return { passed, failed, results }
}
