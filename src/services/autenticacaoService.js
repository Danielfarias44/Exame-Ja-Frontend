// Camada de preparação para integração futura com Firebase Auth + API Exame Já.
// Quando os endpoints e credenciais estiverem prontos, basta substituir os blocos simulados abaixo.

const CONVENIOS_MOCK = [
  { id: 1, nome: "Unimed" },
  { id: 2, nome: "Bradesco Saúde" },
  { id: 3, nome: "Amil" },
  { id: 4, nome: "SulAmérica" },
  { id: 5, nome: "Hapvida" },
  { id: 6, nome: "Cassi" },
  { id: 7, nome: "Geap" },
  { id: 8, nome: "Petrobras Saúde" },
];

function aguardar(ms = 450) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Futuro: GET /convenios (usando token inicial da API)
 */
export async function listarConvenios() {
  await aguardar(200);
  return CONVENIOS_MOCK;
}

/**
 * Futuro:
 * 1. Obter token inicial da API
 * 2. POST /pacientes (gera ID a partir do CPF e salva preferências de até 5 convênios)
 * 3. Iniciar sessão com cookie (credentials: "include")
 */
export async function registrarPaciente(payload) {
  await aguardar(550);
  return {
    sucesso: true,
    perfil: "paciente",
    usuario: {
      nome: payload.nomeCompleto,
      email: payload.email,
      conveniosIds: payload.conveniosIds, // Array de até 5 IDs
    },
  };
}

/**
 * Futuro:
 * 1. Capturar variáveis da clínica e autenticar no Firebase / API
 * 2. POST /clinicas com foto, nome, contato, CNPJ e conveniosIds
 * 3. Reautenticar sessão -> clínica inicia sempre com status "pendente"
 */
export async function registrarClinica(payload) {
  await aguardar(600);
  return {
    sucesso: true,
    perfil: "clinica",
    status: "pendente", // "pendente" | "aprovado" | "rejeitado"
    clinica: {
      nomeFantasia: payload.nomeFantasia,
      email: payload.email,
      conveniosIds: payload.conveniosIds,
    },
  };
}

/**
 * Futuro:
 * 1. signInWithEmailAndPassword(auth, email, senha) via Firebase SDK
 * 2. const idToken = await user.getIdToken()
 * 3. Enviar idToken para a API criar o cookie de sessão e retornar perfil + status
 */
export async function entrarComEmailESenha({ email, perfil }) {
  await aguardar(450);
  return {
    sucesso: true,
    perfil,
    email,
    // Para clínica, o back-end retornará: "pendente" | "aprovado" | "rejeitado" e motivoRejeicao
    statusClinica: perfil === "clinica" ? "pendente" : null,
  };
}

/**
 * Futuro:
 * sendPasswordResetEmail(auth, email) via Firebase SDK
 */
export async function solicitarRecuperacaoSenha(email) {
  await aguardar(450);
  return {
    sucesso: true,
    email,
  };
}