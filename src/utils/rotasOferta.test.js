import { describe, expect, it } from "vitest";
import { destinoInternoSeguro, rotaAgendamento, rotaCadastroComRetorno, rotaConversa, rotaLoginComRetorno } from "./rotasOferta";

const oferta = { clinicId: "clinica 1", examCode: "40304361", exam: "Hemograma & plaquetas" };

describe("rotasOferta", () => {
  it("monta a rota de agendamento com clínica, código e nome do exame", () => {
    const url = new URL(rotaAgendamento(oferta), "http://local");
    expect(url.pathname).toBe("/paciente/agendar");
    expect(url.searchParams.get("clinicaId")).toBe("clinica 1");
    expect(url.searchParams.get("codigoExame")).toBe("40304361");
    expect(url.searchParams.get("nomeExame")).toBe("Hemograma & plaquetas");
  });

  it("monta a rota da conversa com a clínica", () => {
    expect(rotaConversa(oferta)).toBe("/paciente/chat?clinicaId=clinica+1");
  });

  it("codifica o destino de retorno do login e do cadastro", () => {
    const destino = rotaAgendamento(oferta);
    expect(rotaLoginComRetorno(destino)).toBe(`/login?redirect=${encodeURIComponent(destino)}`);
    expect(rotaCadastroComRetorno(destino)).toBe(`/cadastro?redirect=${encodeURIComponent(destino)}`);
    const volta = new URL(rotaLoginComRetorno(destino), "http://local").searchParams.get("redirect");
    expect(volta).toBe(destino);
  });
});

describe("destinoInternoSeguro", () => {
  it("aceita rotas internas com busca e âncora", () => {
    expect(destinoInternoSeguro("/paciente/agendar?clinicaId=c1#horarios")).toBe("/paciente/agendar?clinicaId=c1#horarios");
  });

  it("recusa destinos externos ou malformados", () => {
    for (const destino of ["https://golpe.com", "//golpe.com", "/\\golpe.com", "/\\\\golpe.com", "/a\\b", "/\t/golpe.com", "golpe", "", null, undefined]) {
      expect(destinoInternoSeguro(destino, "/paciente")).toBe("/paciente");
    }
  });
});
