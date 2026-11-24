import { signIn } from '../api/session.js'

const formulario = document.querySelector('#login-form')
const campoEmail = document.querySelector('#email')
const campoSenha = document.querySelector('#password')
const botaoMostrarSenha = document.querySelector('#toggle-password')
const mensagemRetorno = document.querySelector('#form-feedback')
const botaoEntrar = document.querySelector('#submit-login')
let tentouEnviar = false
let enviando = false

formulario.noValidate = true
botaoEntrar.disabled = false
botaoMostrarSenha.hidden = false

function validarCampo(campo) {
  let mensagem = ''
  if (campo === campoEmail) {
    if (!campoEmail.value.trim()) mensagem = 'Informe seu e-mail para continuar.'
    else if (campoEmail.validity.typeMismatch) mensagem = 'Confira o e-mail. Use o formato nome@email.com.'
  } else if (!campoSenha.value) {
    mensagem = 'Informe sua senha para continuar.'
  }
  const erro = document.querySelector(`#${campo.id}-error`)
  erro.textContent = mensagem
  erro.hidden = !mensagem
  if (mensagem) campo.setAttribute('aria-invalid', 'true')
  else campo.removeAttribute('aria-invalid')
  return !mensagem
}

function ocultarSenha() {
  campoSenha.type = 'password'
  botaoMostrarSenha.textContent = 'Mostrar senha'
  botaoMostrarSenha.setAttribute('aria-pressed', 'false')
}

botaoMostrarSenha.addEventListener('click', () => {
  const mostrar = campoSenha.type === 'password'
  campoSenha.type = mostrar ? 'text' : 'password'
  botaoMostrarSenha.textContent = mostrar ? 'Ocultar senha' : 'Mostrar senha'
  botaoMostrarSenha.setAttribute('aria-pressed', String(mostrar))
})

for (const campo of [campoEmail, campoSenha]) {
  campo.addEventListener('input', () => {
    mensagemRetorno.textContent = ''
    if (tentouEnviar) validarCampo(campo)
  })
  campo.addEventListener('blur', () => {
    if (campo.value || tentouEnviar) validarCampo(campo)
  })
}

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault()
  if (enviando) return
  tentouEnviar = true
  campoEmail.value = campoEmail.value.trim()
  const emailValido = validarCampo(campoEmail)
  const senhaValida = validarCampo(campoSenha)
  if (!emailValido || !senhaValida) {
    mensagemRetorno.textContent = 'Confira os campos indicados para continuar.'
    ;(!emailValido ? campoEmail : campoSenha).focus()
    return
  }
  ocultarSenha()
  enviando = true
  botaoEntrar.disabled = true
  campoEmail.readOnly = true
  campoSenha.readOnly = true
  formulario.setAttribute('aria-busy', 'true')
  botaoEntrar.textContent = 'Entrando…'
  mensagemRetorno.textContent = 'Conferindo seu acesso. Aguarde.'
  try {
    await signIn(campoEmail.value, campoSenha.value)
    campoSenha.value = ''
    mensagemRetorno.textContent = 'Acesso confirmado. Abrindo o atendimento…'
    window.location.assign('./index.html')
  } catch (erro) {
    campoSenha.value = ''
    if (erro.status === 401) mensagemRetorno.textContent = 'E-mail ou senha incorretos. Confira seus dados e tente novamente.'
    else if (erro.code === 'NETWORK_ERROR') mensagemRetorno.textContent = 'Não foi possível conectar ao serviço. Verifique sua conexão e se o servidor está disponível.'
    else mensagemRetorno.textContent = erro.code ? erro.message : 'Não foi possível abrir sua sessão. Verifique se o navegador permite o armazenamento de sessão e tente novamente.'
    campoSenha.focus()
  } finally {
    enviando = false
    tentouEnviar = false
    botaoEntrar.disabled = false
    campoEmail.readOnly = false
    campoSenha.readOnly = false
    formulario.removeAttribute('aria-busy')
    botaoEntrar.textContent = 'Entrar'
  }
})

document.addEventListener('visibilitychange', () => {
  if (document.hidden) ocultarSenha()
})
