import { PERFIS } from "@/constants/perfis";

const SESSAO_STORAGE_KEY = "exameja_sessao_ativa_v1";
const USUARIOS_STORAGE_KEY = "exameja_usuarios_cadastrados_v1";

export const CONVENIOS_DISPONIVEIS = [
  { id: "unimed", nome: "Unimed Belém" },
  { id: "hapvida", nome: "Hapvida" },
  { id: "bradesco", nome: "Bradesco Saúde" },
  { id: "amil", nome: "Amil" },
  { id: "sulamerica", nome: "SulAmérica" },
  { id: "cassi", nome: "Cassi" },
  { id: "ipasgo", nome: "Saúde Caixa" },
];

export function listarConvenios() {
  const lista = CONVENIOS_DISPONIVEIS.map((item) => ({ ...item }));
  Object.defineProperty(lista, "then", {
    value: (onFulfilled, onRejected) =>
      Promise.resolve(CONVENIOS_DISPONIVEIS.map((item) => ({ ...item }))).then(
        onFulfilled,
        onRejected
      ),
    enumerable: false,
  });
  return lista;
}

function lerUsuariosCadastrados() {
  try {
    const salvo = localStorage.getItem(USUARIOS_STORAGE_KEY);
    return salvo ? JSON.parse(salvo) : [];
  } catch {
    return [];
  }
}

function salvarUsuariosCadastrados(lista) {
  localStorage.setItem(USUARIOS_STORAGE_KEY, JSON.stringify(lista));
}

function salvarSessao(sessao) {
  localStorage.setItem(SESSAO_STORAGE_KEY, JSON.stringify(sessao));
  window.dispatchEvent(new Event("exameja:sessao-alterada"));
}

function gerarTokenMock(perfil) {
  return `mock-jwt-${perfil}-${Date.now()}`;
}

export function obterSessaoAtual() {
  try {
    const salvo = localStorage.getItem(SESSAO_STORAGE_KEY);
    return salvo ? JSON.parse(salvo) : null;
  } catch {
    return null;
  }
}

export function sairDaConta() {
  localStorage.removeItem(SESSAO_STORAGE_KEY);
  window.dispatchEvent(new Event("exameja:sessao-alterada"));
}

export async function entrarComEmailESenha({
  email,
  senha,
  perfil = PERFIS.PACIENTE,
}) {
  if (!email || !senha) {
    throw new Error("Preencha e-mail e senha para continuar.");
  }

  const emailNormalizado = email.trim().toLowerCase();
  const usuarios = lerUsuariosCadastrados();
  const encontrado = usuarios.find(
    (u) => u.email.toLowerCase() === emailNormalizado && u.perfil === perfil
  );

  if (encontrado && encontrado.senha && encontrado.senha !== senha) {
    throw new Error("Senha incorreta. Tente novamente.");
  }

  const nomePadrao =
    perfil === PERFIS.CLINICA
      ? "LabVida Diagnósticos"
      : perfil === PERFIS.ADMIN
        ? "Administrador ExameJá"
        : emailNormalizado === "maria.clara@email.com"
          ? "Maria Clara Souza"
          : emailNormalizado
              .split("@")[0]
              .replace(/[._-]/g, " ")
              .replace(/\b\w/g, (letra) => letra.toUpperCase());

  const sessao = {
    id: encontrado?.id || `usr-${Date.now()}`,
    perfil,
    token: gerarTokenMock(perfil),
    nome: encontrado?.nome || nomePadrao,
    email: emailNormalizado,
    telefone: encontrado?.telefone || "(91) 98412-3390",
    cpf: encontrado?.cpf || "123.456.789-00",
    dataNascimento: encontrado?.dataNascimento || "1996-05-14",
    cidade: encontrado?.cidade || "Belém - PA",
    conveniosIds: encontrado?.conveniosIds || ["unimed", "hapvida"],
    autenticadoEm: new Date().toISOString(),
  };

  salvarSessao(sessao);
  return sessao;
}

export async function registrarPaciente(dados) {
  const usuarios = lerUsuariosCadastrados();
  const emailNormalizado = (dados.email || "").trim().toLowerCase();

  const novoUsuario = {
    id: `pac-${Date.now()}`,
    perfil: PERFIS.PACIENTE,
    nome: (dados.nome || dados.nomeCompleto || "Paciente").trim(),
    email: emailNormalizado,
    senha: dados.senha || "",
    telefone: dados.telefone || dados.celular || "",
    cpf: dados.cpf || "",
    dataNascimento: dados.dataNascimento || "",
    cidade: dados.cidade || "Belém - PA",
    conveniosIds: dados.conveniosIds || dados.convenios || [],
  };

  const filtrados = usuarios.filter(
    (u) =>
      !(
        u.email.toLowerCase() === emailNormalizado &&
        u.perfil === PERFIS.PACIENTE
      )
  );
  filtrados.push(novoUsuario);
  salvarUsuariosCadastrados(filtrados);

  const { senha: _ignorar, ...dadosPublicos } = novoUsuario;
  const sessao = {
    ...dadosPublicos,
    token: gerarTokenMock(PERFIS.PACIENTE),
    autenticadoEm: new Date().toISOString(),
  };

  salvarSessao(sessao);
  return sessao;
}

export async function registrarClinica(dados) {
  const usuarios = lerUsuariosCadastrados();
  const emailNormalizado = (dados.email || "").trim().toLowerCase();

  const novaClinica = {
    id: `cli-${Date.now()}`,
    perfil: PERFIS.CLINICA,
    nome: (
      dados.nomeFantasia ||
      dados.razaoSocial ||
      dados.nome ||
      "Clínica Parceira"
    ).trim(),
    email: emailNormalizado,
    senha: dados.senha || "",
    cnpj: dados.cnpj || "",
    telefone: dados.telefone || dados.celular || "",
    endereco: dados.endereco || "",
    cidade: dados.cidade || "Belém - PA",
  };

  usuarios.push(novaClinica);
  salvarUsuariosCadastrados(usuarios);

  const { senha: _ignorar, ...dadosPublicos } = novaClinica;
  const sessao = {
    ...dadosPublicos,
    token: gerarTokenMock(PERFIS.CLINICA),
    autenticadoEm: new Date().toISOString(),
  };

  salvarSessao(sessao);
  return sessao;
}

export async function solicitarRecuperacaoSenha(email) {
  if (!email) {
    throw new Error("Informe um e-mail válido.");
  }
  return { enviado: true };
}
