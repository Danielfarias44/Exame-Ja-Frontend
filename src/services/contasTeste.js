import { PERFIS } from "@/constants/perfis";
import { registrarClinica, registrarPaciente } from "./autenticacaoService";

const STORAGE_KEY = "exameja_contas_teste_v1";

export const CNPJS_TESTE = [
  { cnpj: "05054929000117", razaoSocial: "SECRETARIA DE ESTADO DE SAUDE PUBLICA" },
  { cnpj: "34621748000123", razaoSocial: "UNIVERSIDADE FEDERAL DO PARA" },
  { cnpj: "00000000000191", razaoSocial: "BANCO DO BRASIL SA" },
  { cnpj: "00360305000104", razaoSocial: "CAIXA ECONOMICA FEDERAL" },
  { cnpj: "34028316000103", razaoSocial: "EMPRESA BRASILEIRA DE CORREIOS E TELEGRAFOS" },
  { cnpj: "33000167000101", razaoSocial: "PETROLEO BRASILEIRO S A PETROBRAS" },
];

export const CONTAS_TESTE = [
  {
    id: "paciente",
    perfil: PERFIS.PACIENTE,
    titulo: "Paciente Teste",
    nome: "Paciente Teste",
    sufixoEmail: "exameja-paciente",
    telefone: "(91) 99999-0001",
    descricao: "Paciente com convênio, para buscar e agendar.",
  },
  {
    id: "admin",
    perfil: PERFIS.ADMIN,
    titulo: "Admin Teste",
    nome: "Admin Teste",
    sufixoEmail: "exameja-admin",
    telefone: "(91) 99999-0002",
    descricao: "Nasce como paciente e vira administrador com o script do back (veja /teste/admin).",
  },
  {
    id: "clinica-aprovar",
    perfil: PERFIS.CLINICA,
    titulo: "Clínica Teste Aprovar",
    nomeFantasia: "Clínica Teste Aprovar",
    telefone: "(91) 3222-0001",
    endereco: "Avenida Presidente Vargas, 800, Belém, PA",
    descricao: "Para aprovar no painel do admin e depois ver o painel da clínica liberado.",
  },
  {
    id: "clinica-rejeitar",
    perfil: PERFIS.CLINICA,
    titulo: "Clínica Teste Rejeitar",
    nomeFantasia: "Clínica Teste Rejeitar",
    telefone: "(91) 3222-0002",
    endereco: "Avenida Nazaré, 500, Belém, PA",
    descricao: "Para rejeitar com motivo e conferir a mensagem que a clínica recebe.",
  },
  {
    id: "clinica-reenviar",
    perfil: PERFIS.CLINICA,
    titulo: "Clínica Teste Reenviar",
    nomeFantasia: "Clínica Teste Reenviar",
    telefone: "(91) 3222-0003",
    endereco: "Travessa Padre Eutíquio, 1000, Belém, PA",
    descricao: "Para rejeitar, corrigir e reenviar pelo painel da clínica, e ver voltar à fila.",
  },
];

const FORMATO_ID_CONVENIO = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function conveniosAceitosPeloBack(convenios) {
  return convenios.filter(({ id }) => typeof id === "string" && id.length <= 80 && FORMATO_ID_CONVENIO.test(id));
}

export function escolherConveniosDaClinica(convenios) {
  const validos = conveniosAceitosPeloBack(convenios);
  if (validos.length < 5) {
    throw new Error(`O back exige de 5 a 10 convênios, mas só ${validos.length} dos ${convenios.length} convênios cadastrados têm ID no formato aceito (letras minúsculas, números e hífens). Peça para corrigir os IDs dos convênios no banco.`);
  }
  return validos.slice(0, 5).map(({ id }) => id);
}

export const DECLARACAO_TESTE =
  "Conta de teste do projeto acadêmico Exame Já. Os dados desta clínica são fictícios e não representam a instituição dona do CNPJ.";

function gerarSenha() {
  const alfabeto = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return `Teste-${Array.from(bytes, (byte) => alfabeto[byte % alfabeto.length]).join("")}`;
}

function digitoCpf(base) {
  const soma = [...base].reduce((total, numero, indice) => total + Number(numero) * (base.length + 1 - indice), 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

export function gerarCpf() {
  let base;
  do {
    base = Array.from(crypto.getRandomValues(new Uint8Array(9)), (byte) => byte % 10).join("");
  } while (new Set(base).size === 1);
  const primeiro = digitoCpf(base);
  return `${base}${primeiro}${digitoCpf(`${base}${primeiro}`)}`;
}

export function emailComApelido(emailBase, sufixo) {
  const [usuario, dominio] = (emailBase || "").trim().toLowerCase().split("@");
  if (!usuario || !dominio || !dominio.includes(".")) return "";
  return `${usuario.split("+")[0]}+${sufixo}@${dominio}`;
}

function estadoInicial() {
  return { emailBase: "", senha: gerarSenha(), convenioId: "", emailsClinicas: {}, contas: {}, cnpjsUsados: [] };
}

export function lerEstadoTeste() {
  try {
    const salvo = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!salvo || typeof salvo !== "object") return estadoInicial();
    return { ...estadoInicial(), ...salvo, senha: salvo.senha || gerarSenha() };
  } catch {
    return estadoInicial();
  }
}

export function salvarEstadoTeste(estado) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
  } catch {
    return estado;
  }
  return estado;
}

export function emailDaConta(conta, estado) {
  if (estado.contas[conta.id]?.email) return estado.contas[conta.id].email;
  if (conta.perfil === PERFIS.CLINICA) return (estado.emailsClinicas[conta.id] || "").trim().toLowerCase();
  return emailComApelido(estado.emailBase, conta.sufixoEmail);
}

function erroDeEmailExistente(erro) {
  return erro?.status === 409 && /e-mail/i.test(erro.message || "");
}

function erroDeCnpjExistente(erro) {
  return erro?.status === 409 && /CNPJ/i.test(erro.message || "");
}

async function cadastrarClinicaComCnpjLivre(conta, email, estado, conveniosAceitos) {
  const usados = new Set(estado.cnpjsUsados);
  const recusados = [];
  for (const opcao of CNPJS_TESTE.filter(({ cnpj }) => !usados.has(cnpj))) {
    try {
      const resposta = await registrarClinica({
        email,
        senha: estado.senha,
        razaoSocial: opcao.razaoSocial,
        nomeFantasia: conta.nomeFantasia,
        cnpj: opcao.cnpj,
        telefone: conta.telefone,
        endereco: conta.endereco,
        declaracaoVinculo: DECLARACAO_TESTE,
        conveniosAceitos,
      });
      return { resposta, opcao, recusados };
    } catch (erro) {
      if (!erroDeCnpjExistente(erro)) {
        erro.cnpjsRecusados = recusados;
        throw erro;
      }
      recusados.push(opcao.cnpj);
    }
  }
  const erro = new Error("Todos os CNPJs de teste já têm clínica cadastrada neste banco. Apague as clínicas de teste antigas no Firebase ou acrescente CNPJs em CNPJS_TESTE.");
  erro.cnpjsRecusados = recusados;
  throw erro;
}

export async function cadastrarContaTeste(conta, estado, convenios = []) {
  const email = emailDaConta(conta, estado);
  if (!email) {
    throw new Error(conta.perfil === PERFIS.CLINICA
      ? "Informe o e-mail temporário desta clínica."
      : "Informe o e-mail base para gerar o e-mail desta conta.");
  }
  if (!estado.senha || estado.senha.length < 8) throw new Error("A senha das contas de teste precisa ter pelo menos 8 caracteres.");

  try {
    if (conta.perfil === PERFIS.CLINICA) {
      const conveniosAceitos = escolherConveniosDaClinica(convenios);
      const { resposta, opcao, recusados } = await cadastrarClinicaComCnpjLivre(conta, email, estado, conveniosAceitos);
      return {
        cnpjsUsados: [...new Set([...estado.cnpjsUsados, ...recusados, opcao.cnpj])],
        conta: { email, senha: estado.senha, uid: resposta?.usuario?.uid || "", cnpj: opcao.cnpj, razaoSocial: opcao.razaoSocial, conveniosAceitos, cadastradaEm: new Date().toISOString() },
      };
    }
    if (!estado.convenioId) throw new Error("Escolha o convênio do paciente de teste.");
    const cpf = gerarCpf();
    const resposta = await registrarPaciente({
      nome: conta.nome,
      email,
      senha: estado.senha,
      cpf,
      telefone: conta.telefone,
      convenioId: estado.convenioId,
    });
    return {
      cnpjsUsados: estado.cnpjsUsados,
      conta: { email, senha: estado.senha, uid: resposta?.usuario?.uid || "", cpf, cadastradaEm: new Date().toISOString() },
    };
  } catch (erro) {
    if (erroDeEmailExistente(erro)) {
      return {
        cnpjsUsados: [...new Set([...estado.cnpjsUsados, ...(erro.cnpjsRecusados || [])])],
        conta: { email, senha: estado.senha, uid: "", jaExistia: true, cadastradaEm: new Date().toISOString() },
      };
    }
    if (erro.cnpjsRecusados?.length) {
      erro.cnpjsUsados = [...new Set([...estado.cnpjsUsados, ...erro.cnpjsRecusados])];
    }
    throw erro;
  }
}
