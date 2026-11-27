import { beforeEach, describe, expect, it, vi } from "vitest";
import { registrarClinica, registrarPaciente } from "./autenticacaoService";
import {
  CNPJS_TESTE,
  CONTAS_TESTE,
  cadastrarContaTeste,
  conveniosAceitosPeloBack,
  emailComApelido,
  escolherConveniosDaClinica,
  escolherConvenioDoPaciente,
  emailDaConta,
  gerarCpf,
  lerEstadoTeste,
  salvarEstadoTeste,
} from "./contasTeste";

vi.mock("./autenticacaoService", () => ({
  registrarClinica: vi.fn(),
  registrarPaciente: vi.fn(),
}));

function documentoValido(documento, tamanho) {
  const pesos = tamanho === 11
    ? [[10, 9, 8, 7, 6, 5, 4, 3, 2], [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]]
    : [[5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2], [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]];
  const digito = (base, multiplicadores) => {
    const resto = [...base].reduce((soma, numero, indice) => soma + Number(numero) * multiplicadores[indice], 0) % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  return documento.length === tamanho
    && new Set(documento).size !== 1
    && digito(documento.slice(0, tamanho - 2), pesos[0]) === Number(documento[tamanho - 2])
    && digito(documento.slice(0, tamanho - 1), pesos[1]) === Number(documento[tamanho - 1]);
}

function erroHttp(status, message) {
  return Object.assign(new Error(message), { status });
}

const CONVENIOS_VALIDOS = ["amil", "hapvida", "unimed", "bradesco-saude", "geap-saude", "cassi"].map((id) => ({ id, nome: id }));

const paciente = CONTAS_TESTE.find(({ id }) => id === "paciente");
const clinica = CONTAS_TESTE.find(({ id }) => id === "clinica-aprovar");

function estado(alteracoes = {}) {
  return {
    emailBase: "pessoa@gmail.com",
    senha: "Teste-12345678",
    convenioId: "unimed",
    emailsClinicas: { "clinica-aprovar": "caixa@temporario.dev" },
    contas: {},
    cnpjsUsados: [],
    ...alteracoes,
  };
}

beforeEach(() => {
  vi.mocked(registrarClinica).mockReset();
  vi.mocked(registrarPaciente).mockReset();
});

describe("geradores de dados de teste", () => {
  it("gera CPFs que passam na conferência de dígitos do back", () => {
    for (let vez = 0; vez < 500; vez += 1) expect(documentoValido(gerarCpf(), 11)).toBe(true);
  });

  it("usa só CNPJs com dígitos válidos e sem repetição", () => {
    const cnpjs = CNPJS_TESTE.map(({ cnpj }) => cnpj);
    expect(new Set(cnpjs).size).toBe(cnpjs.length);
    cnpjs.forEach((cnpj) => expect(documentoValido(cnpj, 14)).toBe(true));
  });

  it("cria apelidos com + no e-mail base", () => {
    expect(emailComApelido("Fulano@Gmail.com", "exameja-admin")).toBe("fulano+exameja-admin@gmail.com");
    expect(emailComApelido("a+velho@gmail.com", "exameja-paciente")).toBe("a+exameja-paciente@gmail.com");
    expect(emailComApelido("sem-arroba", "x")).toBe("");
    expect(emailComApelido("a@semponto", "x")).toBe("");
  });
});

describe("convênios aceitos pelo back", () => {
  it("filtra IDs fora do formato minúsculas-com-hífen", () => {
    const lista = [{ id: "amil" }, { id: "bradesco-saude" }, { id: "GEAP Saúde" }, { id: "ASSEFAZ" }, { id: "saude-" }, { id: "x".repeat(81) }];
    expect(conveniosAceitosPeloBack(lista).map(({ id }) => id)).toEqual(["amil", "bradesco-saude"]);
  });

  it("escolhe os 5 primeiros convênios válidos", () => {
    expect(escolherConveniosDaClinica(CONVENIOS_VALIDOS)).toEqual(["amil", "hapvida", "unimed", "bradesco-saude", "geap-saude"]);
  });

  it("dá a cada clínica uma combinação diferente, voltando ao início da lista", () => {
    expect(escolherConveniosDaClinica(CONVENIOS_VALIDOS, 2)).toEqual(["unimed", "bradesco-saude", "geap-saude", "cassi", "amil"]);
    expect(escolherConveniosDaClinica(CONVENIOS_VALIDOS, 4)).toEqual(["geap-saude", "cassi", "amil", "hapvida", "unimed"]);
  });

  it("dá aos pacientes extras o convênio seguinte ao escolhido", () => {
    expect(escolherConvenioDoPaciente(CONVENIOS_VALIDOS, "unimed")).toBe("unimed");
    expect(escolherConvenioDoPaciente(CONVENIOS_VALIDOS, "unimed", 1)).toBe("bradesco-saude");
    expect(escolherConvenioDoPaciente(CONVENIOS_VALIDOS, "cassi", 2)).toBe("hapvida");
    expect(escolherConvenioDoPaciente(CONVENIOS_VALIDOS, "inexistente", 1)).toBe("inexistente");
  });

  it("tem 3 pacientes e 7 clínicas, com CNPJ de sobra para todas", () => {
    const clinicas = CONTAS_TESTE.filter((conta) => conta.perfil === "clinica");
    expect(clinicas).toHaveLength(7);
    expect(CONTAS_TESTE.filter((conta) => conta.perfil === "paciente")).toHaveLength(3);
    expect(CNPJS_TESTE.length).toBeGreaterThanOrEqual(clinicas.length + 2);
    expect(new Set(CONTAS_TESTE.map(({ id }) => id)).size).toBe(CONTAS_TESTE.length);
    expect(new Set(clinicas.map(({ endereco }) => endereco)).size).toBe(clinicas.length);
  });
});

describe("estado das contas de teste", () => {
  it("começa com senha gerada quando não há nada salvo", () => {
    const inicial = lerEstadoTeste();
    expect(inicial.senha).toMatch(/^Teste-.{10}$/);
    expect(inicial.contas).toEqual({});
  });

  it("recupera o que foi salvo e ignora JSON quebrado", () => {
    salvarEstadoTeste(estado({ emailBase: "x@y.com" }));
    expect(lerEstadoTeste().emailBase).toBe("x@y.com");
    localStorage.setItem("exameja_contas_teste_v1", "{quebrado");
    expect(lerEstadoTeste().emailBase).toBe("");
  });

  it("escolhe o e-mail certo para cada tipo de conta", () => {
    expect(emailDaConta(paciente, estado())).toBe("pessoa+exameja-paciente@gmail.com");
    expect(emailDaConta(clinica, estado())).toBe("caixa@temporario.dev");
    expect(emailDaConta(clinica, estado({ contas: { "clinica-aprovar": { email: "salvo@x.dev" } } }))).toBe("salvo@x.dev");
  });
});

describe("cadastrarContaTeste", () => {
  it("cadastra o segundo paciente com o convênio seguinte da lista", async () => {
    vi.mocked(registrarPaciente).mockResolvedValue({ usuario: { uid: "uid-p2" } });
    const segundo = CONTAS_TESTE.find(({ id }) => id === "paciente-2");
    const { conta } = await cadastrarContaTeste(segundo, estado(), CONVENIOS_VALIDOS);
    const enviado = vi.mocked(registrarPaciente).mock.calls[0][0];
    expect(enviado.email).toBe("pessoa+exameja-paciente2@gmail.com");
    expect(enviado.convenioId).toBe("bradesco-saude");
    expect(conta.convenioId).toBe("bradesco-saude");
  });

  it("cadastra o paciente com CPF válido e o convênio escolhido", async () => {
    vi.mocked(registrarPaciente).mockResolvedValue({ usuario: { uid: "uid-paciente" } });
    const { conta } = await cadastrarContaTeste(paciente, estado());
    const enviado = vi.mocked(registrarPaciente).mock.calls[0][0];
    expect(enviado.email).toBe("pessoa+exameja-paciente@gmail.com");
    expect(enviado.convenioId).toBe("unimed");
    expect(documentoValido(enviado.cpf, 11)).toBe(true);
    expect(conta).toMatchObject({ uid: "uid-paciente", senha: "Teste-12345678", cpf: enviado.cpf });
  });

  it("pula para o próximo CNPJ quando o primeiro já tem clínica", async () => {
    vi.mocked(registrarClinica)
      .mockRejectedValueOnce(erroHttp(409, "Já existe uma conta de clínica cadastrada com este CNPJ."))
      .mockResolvedValueOnce({ usuario: { uid: "uid-clinica" } });
    const { conta, cnpjsUsados } = await cadastrarContaTeste(clinica, estado(), CONVENIOS_VALIDOS);
    expect(vi.mocked(registrarClinica)).toHaveBeenCalledTimes(2);
    expect(conta.cnpj).toBe(CNPJS_TESTE[1].cnpj);
    expect(conta.razaoSocial).toBe(CNPJS_TESTE[1].razaoSocial);
    expect(cnpjsUsados).toEqual([CNPJS_TESTE[0].cnpj, CNPJS_TESTE[1].cnpj]);
  });

  it("não tenta CNPJs já marcados como usados", async () => {
    vi.mocked(registrarClinica).mockResolvedValue({ usuario: { uid: "uid" } });
    await cadastrarContaTeste(clinica, estado({ cnpjsUsados: [CNPJS_TESTE[0].cnpj] }), CONVENIOS_VALIDOS);
    expect(vi.mocked(registrarClinica).mock.calls[0][0].cnpj).toBe(CNPJS_TESTE[1].cnpj);
  });

  it("avisa quando todos os CNPJs já foram usados", async () => {
    await expect(cadastrarContaTeste(clinica, estado({ cnpjsUsados: CNPJS_TESTE.map(({ cnpj }) => cnpj) }), CONVENIOS_VALIDOS))
      .rejects.toThrow(/Todos os CNPJs de teste/);
  });

  it("envia 5 convênios válidos na clínica e avisa quando o banco não tem 5", async () => {
    vi.mocked(registrarClinica).mockResolvedValue({ usuario: { uid: "uid" } });
    const { conta } = await cadastrarContaTeste(clinica, estado(), CONVENIOS_VALIDOS);
    expect(vi.mocked(registrarClinica).mock.calls[0][0].conveniosAceitos).toEqual(["amil", "hapvida", "unimed", "bradesco-saude", "geap-saude"]);
    expect(conta.conveniosAceitos).toHaveLength(5);
    const bancoAtual = [{ id: "amil" }, { id: "hapvida" }, { id: "unimed" }, { id: "GEAP Saúde" }, { id: "bradesco saúde" }];
    await expect(cadastrarContaTeste(clinica, estado(), bancoAtual)).rejects.toThrow(/só 3 dos 5 convênios/);
  });

  it("guarda a conta quando o e-mail já existia no back", async () => {
    vi.mocked(registrarPaciente).mockRejectedValue(erroHttp(409, "Este e-mail já está cadastrado."));
    const { conta } = await cadastrarContaTeste(paciente, estado());
    expect(conta).toMatchObject({ jaExistia: true, uid: "", email: "pessoa+exameja-paciente@gmail.com" });
  });

  it("repassa outros erros do back sem engolir", async () => {
    vi.mocked(registrarClinica).mockRejectedValue(erroHttp(502, "Falha na BrasilAPI"));
    await expect(cadastrarContaTeste(clinica, estado(), CONVENIOS_VALIDOS)).rejects.toThrow("Falha na BrasilAPI");
  });

  it("exige e-mail, senha e convênio antes de chamar o back", async () => {
    await expect(cadastrarContaTeste(paciente, estado({ emailBase: "" }))).rejects.toThrow(/e-mail base/);
    await expect(cadastrarContaTeste(clinica, estado({ emailsClinicas: {} }))).rejects.toThrow(/e-mail temporário/);
    await expect(cadastrarContaTeste(paciente, estado({ senha: "curta" }))).rejects.toThrow(/8 caracteres/);
    await expect(cadastrarContaTeste(paciente, estado({ convenioId: "" }))).rejects.toThrow(/convênio/);
    expect(vi.mocked(registrarPaciente)).not.toHaveBeenCalled();
    expect(vi.mocked(registrarClinica)).not.toHaveBeenCalled();
  });
});
