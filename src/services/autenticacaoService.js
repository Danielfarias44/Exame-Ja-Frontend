import { PERFIS } from "@/constants/perfis";
import { apiPostWithCsrf, apiRequest } from "@/services/httpClient";

const SESSAO_STORAGE_KEY = "exameja_sessao_ativa_v1";
async function contaEhAdministrador() {
  try {
    await apiRequest("/api/admin/clinics?limit=1");
    return true;
  } catch (erro) {
    if (erro.status === 401 || erro.status === 403) return false;
    throw erro;
  }
}

export function ehPaciente(sessao) {
  return sessao?.autenticado === true && sessao.perfil === PERFIS.PACIENTE;
}

function perfilFrontend(usuario) {
  if (usuario?.administrador === true) return PERFIS.ADMIN;
  const tipo = usuario?.tipo;
  if (tipo === "cliente") return PERFIS.PACIENTE;
  if (tipo === "clinica") return PERFIS.CLINICA;
  if (tipo === "admin" || tipo === "administrador") return PERFIS.ADMIN;
  return null;
}

function salvarSessao(usuario) {
  const perfil = perfilFrontend(usuario);
  if (!perfil || !(usuario.id ?? usuario.uid)) {
    throw new Error("O servidor retornou um perfil de usuário inválido.");
  }
  const sessao = {
    id: usuario.id ?? usuario.uid,
    perfil,
    nome: usuario.nome,
    email: usuario.email,
    status: usuario.status,
    administrador: usuario.administrador === true,
    autenticado: true,
  };
  sessionStorage.setItem(SESSAO_STORAGE_KEY, JSON.stringify(sessao));
  window.dispatchEvent(new Event("exameja:sessao-alterada"));
  return sessao;
}

export function obterSessaoAtual() {
  try {
    localStorage.removeItem("exameja_sessao_ativa_v1");
    localStorage.removeItem("exameja_usuarios_cadastrados_v1");
    const salvo = sessionStorage.getItem(SESSAO_STORAGE_KEY);
    if (!salvo) return null;
    const sessao = JSON.parse(salvo);
    if (!sessao?.autenticado || !sessao?.id || !sessao?.perfil) {
      sessionStorage.removeItem(SESSAO_STORAGE_KEY);
      return null;
    }
    return sessao;
  } catch {
    sessionStorage.removeItem(SESSAO_STORAGE_KEY);
    return null;
  }
}

export async function validarSessaoAtual() {
  let usuario;
  try {
    ({ usuario } = await apiRequest("/api/auth/me"));
  } catch (erro) {
    if (erro.status === 401 || erro.status === 403) {
      limparSessaoLocal();
      return null;
    }
    throw erro;
  }
  const idServidor = usuario?.id ?? usuario?.uid;
  const local = obterSessaoAtual();
  if (local && local.id === idServidor) return local;
  const administrador = typeof usuario?.administrador === "boolean"
    ? usuario.administrador
    : await contaEhAdministrador();
  return salvarSessao({ ...usuario, administrador });
}

export function limparSessaoLocal() {
  sessionStorage.removeItem(SESSAO_STORAGE_KEY);
  // Limpa credenciais e sessões falsas da versão anterior do frontend.
  localStorage.removeItem("exameja_sessao_ativa_v1");
  localStorage.removeItem("exameja_usuarios_cadastrados_v1");
  window.dispatchEvent(new Event("exameja:sessao-alterada"));
}

export function atualizarNomeSessao(nome) {
  const sessao = obterSessaoAtual();
  if (!sessao || typeof nome !== "string" || !nome.trim()) return;
  sessionStorage.setItem(SESSAO_STORAGE_KEY, JSON.stringify({ ...sessao, nome: nome.trim() }));
  window.dispatchEvent(new Event("exameja:sessao-alterada"));
}

export async function encerrarSessao() {
  try {
    await apiPostWithCsrf("/api/auth/logout", {});
  } catch (erro) {
    if (erro.status !== 401) throw erro;
  }
  limparSessaoLocal();
}

export async function entrarComEmailESenha({ email, senha, perfil = PERFIS.PACIENTE }) {
  if (!email?.trim() || !senha) throw new Error("Preencha e-mail e senha para continuar.");
  const tipoEsperado = perfil === PERFIS.PACIENTE ? "cliente" : perfil === PERFIS.CLINICA ? "clinica" : null;
  if (!tipoEsperado && perfil !== PERFIS.ADMIN) throw new Error("Este tipo de conta não pode entrar por este formulário.");

  const csrf = await apiRequest("/api/auth/csrf");
  if (!csrf?.csrfToken) throw new Error("Não foi possível iniciar a validação de segurança. Tente novamente.");
  const credenciais = await apiRequest("/api/auth/login", {
    method: "POST",
    headers: { "X-CSRF-Token": csrf.csrfToken },
    body: JSON.stringify({ email: email.trim(), senha }),
  });
  if (!credenciais?.token || !credenciais?.usuario) {
    throw new Error("O servidor não retornou os dados necessários para iniciar a sessão.");
  }
  if (perfil !== PERFIS.ADMIN && credenciais.usuario.tipo !== tipoEsperado) {
    throw new Error("Essa conta pertence a outro tipo de perfil. Selecione o perfil correto.");
  }

  try {
    await apiRequest("/api/auth/session", {
      method: "POST",
      headers: { Authorization: `Bearer ${credenciais.token}` },
      body: JSON.stringify({}),
    });
  } catch (erro) {
    limparSessaoLocal();
    throw erro;
  }

  if (perfil === PERFIS.ADMIN) {
    let administrador = credenciais.usuario.administrador;
    try {
      if (typeof administrador !== "boolean") administrador = await contaEhAdministrador();
    } catch (erro) {
      await encerrarSessao().catch(() => limparSessaoLocal());
      throw erro;
    }
    if (!administrador) {
      await encerrarSessao().catch(() => limparSessaoLocal());
      throw new Error("Esta conta não tem acesso de administrador. Entre como paciente ou clínica.");
    }
    return salvarSessao({ ...credenciais.usuario, administrador: true });
  }

  return salvarSessao({ ...credenciais.usuario, administrador: false });
}

export async function registrarPaciente(dados) {
  const resposta = await apiPostWithCsrf("/api/auth/register", {
    tipo: "cliente",
    nome: (dados.nome || dados.nomeCompleto || "").trim(),
    email: (dados.email || "").trim(),
    senha: dados.senha,
    cpf: dados.cpf,
    telefone: dados.telefone || dados.celular || "",
    convenios: dados.convenioId ? [dados.convenioId] : [],
  });
  return resposta;
}

export async function registrarClinica(dados) {
  const email = (dados.email || "").trim();
  const dominioCorporativo = email.split("@")[1] || "";
  const resposta = await apiPostWithCsrf("/api/auth/register", {
    tipo: "clinica",
    email,
    senha: dados.senha,
    dominioCorporativo,
    razaoSocial: (dados.razaoSocial || "").trim(),
    nomeFantasia: (dados.nomeFantasia || "").trim(),
    cnpj: dados.cnpj,
    telefone: dados.telefone || dados.celular || "",
    endereco: (dados.endereco || dados.bairro || "").trim(),
    declaracaoVinculo: dados.declaracaoVinculo || "Declaro que sou responsável e tenho vínculo autorizado com esta clínica.",
    conveniosAceitos: dados.conveniosAceitos ?? [],
  });
  return resposta;
}

export async function solicitarRecuperacaoSenha(email) {
  return apiPostWithCsrf("/api/auth/password-reset", { email: email.trim() });
}

export async function reenviarVerificacaoEmail(email) {
  return apiPostWithCsrf("/api/auth/email-verification", { email: email.trim() });
}

export async function listarConvenios() {
  const data = await apiRequest("/api/convenios");
  return (data?.convenios ?? []).map(({ id, nome }) => ({ id, nome }));
}
