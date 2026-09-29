export const endpoints = Object.freeze({
  register: '/auth/register',
  login: '/auth/login',
  currentUser: '/users/me',
  appointments: '/appointments',
  appointment: (id) => `/appointments/${encodeId(id)}`,
  history: '/history',
  conversations: '/conversations',
  messages: (id) => `/conversations/${encodeId(id)}/mensagensErro`,
  reviews: '/reviews',
  notifications: '/notifications',
})

function encodeId(id) {
  if (id === undefined || id === null || String(id).trim() === '' || ['.', '..'].includes(String(id))) {
    throw new TypeError('Informe um identificador válido.')
  }
  return encodeURIComponent(String(id))
}

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'REQUEST_FAILED', cause } = {}) {
    super(message, { cause })
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}


export function createApiClient({ baseUrl, credentials = 'same-origin', getHeaders = () => ({}), timeoutMs = 15000, fetchImpl = globalThis.fetch } = {}) {
  if (!baseUrl) throw new TypeError('Configure a URL da API antes de conectar o frontend.')
  const urlBase = new URL(baseUrl)
  if (!['https:', 'http:'].includes(urlBase.protocol) || urlBase.username || urlBase.password || urlBase.search || urlBase.hash) {
    throw new TypeError('Use uma URL HTTP ou HTTPS, sem credenciais, parâmetros ou fragmentos.')
  }
  if (!['omit', 'same-origin', 'include'].includes(credentials)) throw new TypeError('Configuração de sessão inválida.')
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new TypeError('Tempo limite inválido.')
  urlBase.pathname = `${urlBase.pathname.replace(/\/$/, '')}/`

  async function request(path, { method = 'GET', body, signal } = {}) {
    const controlador = new AbortController()
    let tempoEsgotado = false
    const cancelar = () => controlador.abort(signal?.reason)
    if (signal?.aborted) cancelar()
    else signal?.addEventListener('abort', cancelar, { once: true })
    const temporizador = setTimeout(() => { tempoEsgotado = true; controlador.abort() }, timeoutMs)
    try {
      const headers = new Headers(getHeaders())
      headers.set('Accept', 'application/json')
      if (body !== undefined) headers.set('Content-Type', 'application/json')
      const resposta = await fetchImpl(new URL(path.replace(/^\//, ''), urlBase), {
        method,
        headers,
        credentials,
        cache: 'no-store',
        signal: controlador.signal,
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      })
      if (!resposta.ok) {
        const mensagensErro = {
          400: 'Confira os dados informados e tente novamente.',
          401: 'Não foi possível autenticar o acesso. Confira suas credenciais ou entre novamente.',
          403: 'Você não tem permissão para realizar esta ação.',
          404: 'O recurso solicitado não foi encontrado.',
          409: 'Os dados foram alterados. Atualize as informações antes de continuar.',
          422: 'Confira os dados informados e tente novamente.',
          429: 'Muitas tentativas. Aguarde um pouco antes de tentar novamente.',
        }
        throw new ApiError(mensagensErro[resposta.status] || 'O serviço está indisponível. Tente novamente mais tarde.', { status: resposta.status, code: 'HTTP_ERROR' })
      }
      if (resposta.status === 204) return null
      const tipoConteudo = resposta.headers.get('content-type') || ''
      if (!/\bapplication\/(?:[\w.-]+\+)?json\b/i.test(tipoConteudo)) {
        throw new ApiError('A API retornou um formato inesperado.', { status: resposta.status, code: 'INVALID_RESPONSE' })
      }
      try { return await resposta.json() }
      catch (cause) {
        if (controlador.signal.aborted) throw cause
        throw new ApiError('Não foi possível interpretar a resposta da API.', { status: resposta.status, code: 'INVALID_RESPONSE', cause })
      }
    } catch (cause) {
      if (cause instanceof ApiError) throw cause
      if (tempoEsgotado) throw new ApiError('A resposta demorou mais que o esperado. Confira o resultado antes de repetir a ação.', { code: 'TIMEOUT', cause })
      if (controlador.signal.aborted) throw new ApiError('Solicitação cancelada.', { code: 'ABORTED', cause })
      throw new ApiError('Não foi possível acessar o serviço. Verifique sua conexão e tente novamente.', { code: 'NETWORK_ERROR', cause })
    } finally {
      clearTimeout(temporizador)
      signal?.removeEventListener('abort', cancelar)
    }
  }

  return Object.freeze({
    register: (data, opcoes) => request(endpoints.register, { ...opcoes, method: 'POST', body: data }),
    login: (data, opcoes) => request(endpoints.login, { ...opcoes, method: 'POST', body: data }),
    getCurrentUser: (opcoes) => request(endpoints.currentUser, opcoes),
    updateCurrentUser: (data, opcoes) => request(endpoints.currentUser, { ...opcoes, method: 'PUT', body: data }),
    getAppointments: (opcoes) => request(endpoints.appointments, opcoes),
    createAppointment: (data, opcoes) => request(endpoints.appointments, { ...opcoes, method: 'POST', body: data }),
    updateAppointment: (id, data, opcoes) => request(endpoints.appointment(id), { ...opcoes, method: 'PUT', body: data }),
    cancelAppointment: (id, opcoes) => request(endpoints.appointment(id), { ...opcoes, method: 'DELETE' }),
    getHistory: (opcoes) => request(endpoints.history, opcoes),
    getConversations: (opcoes) => request(endpoints.conversations, opcoes),
    getMessages: (id, opcoes) => request(endpoints.messages(id), opcoes),
    sendMessage: (id, data, opcoes) => request(endpoints.messages(id), { ...opcoes, method: 'POST', body: data }),
    createReview: (data, opcoes) => request(endpoints.reviews, { ...opcoes, method: 'POST', body: data }),
    getNotifications: (opcoes) => request(endpoints.notifications, opcoes),
  })
}
