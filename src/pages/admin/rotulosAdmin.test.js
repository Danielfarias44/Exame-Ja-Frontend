import { describe, expect, it } from "vitest";
import { STATUS_CONTA, formatarCnpj, opcoesDe, rotuloStatusConta } from "./rotulosAdmin";

describe("rotulosAdmin", () => {
  it("formata CNPJ de 14 dígitos e preserva valores fora do padrão", () => {
    expect(formatarCnpj("05054929000117")).toBe("05.054.929/0001-17");
    expect(formatarCnpj("123")).toBe("123");
    expect(formatarCnpj("")).toBe("Não informado");
    expect(formatarCnpj(undefined)).toBe("Não informado");
  });

  it("traduz status conhecidos e não quebra com desconhecidos", () => {
    expect(rotuloStatusConta("pendente")).toEqual({ rotulo: "Em análise", tom: "warning" });
    expect(rotuloStatusConta("arquivada")).toEqual({ rotulo: "arquivada", tom: "neutral" });
    expect(rotuloStatusConta(undefined).rotulo).toBe("Sem status");
  });

  it("monta opções de filtro com a opção 'todos' primeiro", () => {
    const opcoes = opcoesDe(STATUS_CONTA, "Todas");
    expect(opcoes[0]).toEqual({ value: "", label: "Todas" });
    expect(opcoes).toContainEqual({ value: "aprovada", label: "Aprovada" });
    expect(opcoesDe({ cliente: "Paciente" }, "Todos")).toEqual([
      { value: "", label: "Todos" },
      { value: "cliente", label: "Paciente" },
    ]);
  });
});
