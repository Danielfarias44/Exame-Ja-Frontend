import test from 'node:test'
import assert from 'node:assert/strict'
import { createApiClient } from '../public/api/client.js'

const json = (data) => new Response(JSON.stringify(data), { headers: { 'content-type': 'application/json' } })

test('login preserva o prefixo da API e envia o contrato recebido sem transformá-lo', async () => {
  const client = createApiClient({ baseUrl: 'https://example.test/api/v1', fetchImpl: async (url, options) => {
    assert.equal(url.href, 'https://example.test/api/v1/auth/login')
    assert.equal(options.method, 'POST')
    assert.deepEqual(JSON.parse(options.body), { email: 'teste@example.test', password: 'somente-teste' })
    assert.equal(options.headers.get('Content-Type'), 'application/json')
    assert.equal(options.cache, 'no-store')
    return json({ result: 'mock' })
  } })
  assert.deepEqual(await client.login({ email: 'teste@example.test', password: 'somente-teste' }), { result: 'mock' })
})

test('codifica IDs e aceita DELETE sem conteúdo', async () => {
  const client = createApiClient({ baseUrl: 'https://example.test', fetchImpl: async (url, options) => {
    assert.equal(url.pathname, '/appointments/abc%2F123')
    assert.equal(options.method, 'DELETE')
    return new Response(null, { status: 204 })
  } })
  assert.equal(await client.cancelAppointment('abc/123'), null)
  assert.throws(() => client.cancelAppointment('..'), TypeError)
})

test('não aceita HTML de fallback como autenticação bem-sucedida', async () => {
  const client = createApiClient({ baseUrl: 'https://example.test', fetchImpl: async () => new Response('<html>Vite</html>', { headers: { 'content-type': 'text/html' } }) })
  await assert.rejects(client.login({}), { code: 'INVALID_RESPONSE' })
})

test('preserva o status HTTP sem apresentar erros internos do servidor', async () => {
  const client = createApiClient({ baseUrl: 'https://example.test', fetchImpl: async () => new Response('informações internas', { status: 401 }) })
  await assert.rejects(client.getCurrentUser(), (error) => error.status === 401 && !error.message.includes('informações internas'))
})

test('diferencia falha de rede, timeout e cancelamento; não repete envios', async () => {
  let requests = 0
  const offline = createApiClient({ baseUrl: 'https://example.test', fetchImpl: async () => { requests++; throw new TypeError('offline') } })
  await assert.rejects(offline.sendMessage('1', { text: 'teste' }), { code: 'NETWORK_ERROR' })
  assert.equal(requests, 1)
  const fetchImpl = async (_url, { signal }) => new Promise((_resolve, reject) => {
    if (signal.aborted) reject(signal.reason)
    else signal.addEventListener('abort', () => reject(signal.reason), { once: true })
  })
  const client = createApiClient({ baseUrl: 'https://example.test', fetchImpl, timeoutMs: 10 })
  await assert.rejects(client.getConversations(), { code: 'TIMEOUT' })
  const controller = new AbortController()
  controller.abort()
  await assert.rejects(client.getConversations({ signal: controller.signal }), { code: 'ABORTED' })
})
