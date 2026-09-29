const form = document.querySelector('#login-form')
const email = document.querySelector('#email')
const password = document.querySelector('#password')
const togglePassword = document.querySelector('#toggle-password')
const feedback = document.querySelector('#form-feedback')
const submit = document.querySelector('#submit-login')
let attemptedSubmit = false

form.noValidate = true
submit.disabled = false
togglePassword.hidden = false

function validateField(field) {
  let message = ''
  if (field === email) {
    if (!email.value.trim()) message = 'Informe seu e-mail para continuar.'
    else if (email.validity.typeMismatch) message = 'Confira o e-mail. Use o formato nome@email.com.'
  } else if (!password.value) {
    message = 'Informe sua senha para continuar.'
  }
  const error = document.querySelector(`#${field.id}-error`)
  error.textContent = message
  error.hidden = !message
  if (message) field.setAttribute('aria-invalid', 'true')
  else field.removeAttribute('aria-invalid')
  return !message
}

function hidePassword() {
  password.type = 'password'
  togglePassword.textContent = 'Mostrar senha'
  togglePassword.setAttribute('aria-pressed', 'false')
}

togglePassword.addEventListener('click', () => {
  const show = password.type === 'password'
  password.type = show ? 'text' : 'password'
  togglePassword.textContent = show ? 'Ocultar senha' : 'Mostrar senha'
  togglePassword.setAttribute('aria-pressed', String(show))
})

for (const field of [email, password]) {
  field.addEventListener('input', () => {
    feedback.textContent = ''
    if (attemptedSubmit) validateField(field)
  })
  field.addEventListener('blur', () => {
    if (field.value || attemptedSubmit) validateField(field)
  })
}

form.addEventListener('submit', (event) => {
  event.preventDefault()
  attemptedSubmit = true
  email.value = email.value.trim()
  const validEmail = validateField(email)
  const validPassword = validateField(password)
  if (!validEmail || !validPassword) {
    feedback.textContent = 'Confira os campos indicados para continuar.'
    ;(!validEmail ? email : password).focus()
    return
  }
  hidePassword()
  password.value = ''
  attemptedSubmit = false
  feedback.textContent = 'Formato dos campos validado. Este login ainda não está conectado a uma conta. Nenhum dado foi enviado, e a senha foi apagada do formulário. Você pode conhecer o atendimento pelo link abaixo.'
})

document.addEventListener('visibilitychange', () => {
  if (document.hidden) hidePassword()
})
