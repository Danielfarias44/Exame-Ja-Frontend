import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiPostWithCsrf, apiRequest, apiRequestWithCsrf } from "@/services/httpClient";
import { PERFIS } from "@/constants/perfis";
import {
  ehPaciente,
  entrarComEmailESenha,
  obterSessaoAtual,
  registrarClinica,
  registrarPaciente,
  validarSessaoAtual,
} from "./autenticacaoService";

vi.mock("@/services/httpClient", () => ({
  apiRequest: vi.fn(),
  apiRequestWithCsrf: vi.fn(),
  apiPostWithCsrf: vi.fn(),
}));

function erroHttp(status) {
  return Object.assign(new Error(`HTTP ${status}`), { status });
}

function simularBack({ usuario, adminStatus = 403 }) {
  vi.mocked(apiRequest).mockImplementation(async (rota) => {
    if (rota === "/api/auth/csrf") return { csrfToken: "csrf" };
    if (rota === "/api/auth/login") return { token: "id-token", usuario };
    if (rota === "/api/auth/session") return {};
    if (rota.startsWith("/api/admin/clinics")) {
      if (adminStatus === 200) return { clinicas: [] };
      throw erroHttp(adminStatus);
    }
    throw new Error(`rota inesperada ${rota}`);
  });
}

const paciente = { id: "u1", nome: "Paciente", email: "p@x.com", tipo: "cliente" };
const clinica = { id: "c1", nome: "Clínica", email: "c@x.dev", tipo: "clinica" };

beforeEach(() => {
  vi.mocked(apiRequest).mockReset();
  vi.mocked(apiRequestWithCsrf).mockReset().mockResolvedValue({});
  vi.mocked(apiPostWithCsrf).mockReset().mockResolvedValue({});
});

describe("ehPaciente", () => {
  it("só aceita sessão autenticada de paciente", () => {
    expect(ehPaciente({ autenticado: true, perfil: PERFIS.PACIENTE })).toBe(true);
    expect(ehPaciente({ autenticado: true, perfil: PERFIS.CLINICA })).toBe(false);
    expect(ehPaciente({ autenticado: false, perfil: PERFIS.PACIENTE })).toBe(false);
    expect(ehPaciente(null)).toBe(false);
  });
});

describe("entrarComEmailESenha", () => {
  it("pede e-mail e senha antes de chamar o back", async () => {
    await expect(entrarComEmailESenha({ email: " ", senha: "x" })).rejects.toThrow(/Preencha/);
    expect(apiRequest).not.toHaveBeenCalled();
  });

  it("cria a sessão do paciente e guarda o perfil", async () => {
    simularBack({ usuario: paciente });
    const sessao = await entrarComEmailESenha({ email: "p@x.com", senha: "segredo123" });
    expect(sessao).toMatchObject({ id: "u1", perfil: PERFIS.PACIENTE, autenticado: true, administrador: false });
    expect(obterSessaoAtual()).toMatchObject({ id: "u1" });
    expect(vi.mocked(apiRequest).mock.calls.map(([rota]) => rota)).toContain("/api/auth/session");
  });

  it("recusa entrar como paciente com conta de clínica", async () => {
    simularBack({ usuario: clinica });
    await expect(entrarComEmailESenha({ email: "c@x.dev", senha: "segredo123", perfil: PERFIS.PACIENTE }))
      .rejects.toThrow(/outro tipo de perfil/);
    expect(obterSessaoAtual()).toBeNull();
  });

  it("encerra a sessão quando a conta não é administradora", async () => {
    simularBack({ usuario: paciente, adminStatus: 403 });
    await expect(entrarComEmailESenha({ email: "p@x.com", senha: "segredo123", perfil: PERFIS.ADMIN }))
      .rejects.toThrow(/não tem acesso de administrador/);
    expect(apiPostWithCsrf).toHaveBeenCalledWith("/api/auth/logout", {});
    expect(obterSessaoAtual()).toBeNull();
  });

  it("reconhece o admin pela consulta à rota de administração", async () => {
    simularBack({ usuario: paciente, adminStatus: 200 });
    const sessao = await entrarComEmailESenha({ email: "p@x.com", senha: "segredo123", perfil: PERFIS.ADMIN });
    expect(sessao).toMatchObject({ perfil: PERFIS.ADMIN, administrador: true });
  });

  it("usa o administrador informado pelo back sem consultar a rota de admin", async () => {
    simularBack({ usuario: { ...paciente, administrador: true }, adminStatus: 500 });
    const sessao = await entrarComEmailESenha({ email: "p@x.com", senha: "segredo123", perfil: PERFIS.ADMIN });
    expect(sessao).toMatchObject({ perfil: PERFIS.ADMIN, administrador: true });
    expect(vi.mocked(apiRequest).mock.calls.some(([rota]) => rota.startsWith("/api/admin"))).toBe(false);
  });

  it("recusa o admin quando o back informa administrador falso", async () => {
    simularBack({ usuario: { ...paciente, administrador: false }, adminStatus: 200 });
    await expect(entrarComEmailESenha({ email: "p@x.com", senha: "segredo123", perfil: PERFIS.ADMIN }))
      .rejects.toThrow(/não tem acesso de administrador/);
  });

  it("entra como paciente mesmo quando a conta também é admin", async () => {
    simularBack({ usuario: { ...paciente, administrador: true } });
    const sessao = await entrarComEmailESenha({ email: "p@x.com", senha: "segredo123" });
    expect(sessao).toMatchObject({ perfil: PERFIS.PACIENTE, administrador: false });
  });
});

describe("cadastro", () => {
  it("envia o convênio do paciente junto com o cadastro", async () => {
    await registrarPaciente({ nome: " Paciente Teste ", email: " p@x.com ", senha: "segredo123", cpf: "123", telefone: "91999990000", convenioId: "unimed" });
    expect(apiPostWithCsrf).toHaveBeenCalledWith("/api/auth/register", {
      tipo: "cliente",
      nome: "Paciente Teste",
      email: "p@x.com",
      senha: "segredo123",
      cpf: "123",
      telefone: "91999990000",
      convenios: ["unimed"],
    });
  });

  it("envia os convênios aceitos e o domínio do e-mail da clínica", async () => {
    await registrarClinica({
      email: "contato@clinica.dev", senha: "segredo123", razaoSocial: "Razão", nomeFantasia: "Clínica",
      cnpj: "05054929000117", telefone: "9132220001", endereco: "Rua A", conveniosAceitos: ["amil", "unimed"],
    });
    expect(vi.mocked(apiPostWithCsrf).mock.calls[0][1]).toMatchObject({
      tipo: "clinica",
      dominioCorporativo: "clinica.dev",
      conveniosAceitos: ["amil", "unimed"],
    });
  });
});

describe("validarSessaoAtual", () => {
  it("limpa a sessão local quando o back responde 401", async () => {
    sessionStorage.setItem("exameja_sessao_ativa_v1", JSON.stringify({ id: "u1", perfil: "paciente", autenticado: true }));
    vi.mocked(apiRequest).mockRejectedValue(erroHttp(401));
    expect(await validarSessaoAtual()).toBeNull();
    expect(obterSessaoAtual()).toBeNull();
  });

  it("usa o administrador do /me ao recriar a sessão, sem consultar a rota de admin", async () => {
    vi.mocked(apiRequest).mockResolvedValue({ usuario: { id: "u9", tipo: "cliente", administrador: true } });
    expect(await validarSessaoAtual()).toMatchObject({ id: "u9", perfil: PERFIS.ADMIN });
    expect(apiRequest).toHaveBeenCalledTimes(1);
  });

  it("repassa falhas de rede para a tela mostrar o erro", async () => {
    vi.mocked(apiRequest).mockRejectedValue(erroHttp(500));
    await expect(validarSessaoAtual()).rejects.toThrow("HTTP 500");
  });
});
