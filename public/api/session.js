import { createApiClient, ApiError } from './client.js'
import { URL_BASE_API } from './config.js'

const CHAVE_TOKEN = 'exameja.accessToken'
export function clearSession() { sessionStorage.removeItem(CHAVE_TOKEN) }
export function hasSession() { return Boolean(sessionStorage.getItem(CHAVE_TOKEN)) }

export const api = createApiClient({
  baseUrl: URL_BASE_API,
  credentials: 'omit',
  getHeaders: () => {
    const token = sessionStorage.getItem(CHAVE_TOKEN)
    return token ? { Authorization: `Bearer ${token}` } : {}
  },
})

function profileFromResponse(resposta) {
  if (resposta?.success !== true || !resposta.data || typeof resposta.data.name !== 'string' || typeof resposta.data.email !== 'string') {
    throw new ApiError('O serviço retornou um perfil inválido. Tente entrar novamente.', { code: 'INVALID_RESPONSE' })
  }
  return resposta.data
}

export async function signIn(email, senha) {
  clearSession()
  const resultado = await api.login({ email, password: senha })
  if (resultado?.success !== true || typeof resultado.data?.token !== 'string' || !resultado.data.token.trim()) {
    throw new ApiError('Não foi possível confirmar o acesso. Tente novamente.', { code: 'INVALID_RESPONSE' })
  }
  const apiAutenticada = createApiClient({
    baseUrl: URL_BASE_API,
    credentials: 'omit',
    getHeaders: () => ({ Authorization: `Bearer ${resultado.data.token}` }),
  })
  const perfil = profileFromResponse(await apiAutenticada.getCurrentUser())
  sessionStorage.setItem(CHAVE_TOKEN, resultado.data.token)
  return perfil
}

export async function getProfile() {
  try { return profileFromResponse(await api.getCurrentUser()) }
  catch (erro) {
    if (erro.status === 401) clearSession()
    throw erro
  }
}
