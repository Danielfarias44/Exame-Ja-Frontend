import { describe, expect, it } from "vitest";
import { rotuloStatusAgendamento } from "./statusAgendamento";

describe("rotuloStatusAgendamento", () => {
  it("traduz todos os status do back, inclusive o novo expirado", () => {
    expect(rotuloStatusAgendamento("pendente")).toBe("Aguardando confirmação");
    expect(rotuloStatusAgendamento("concluido")).toBe("Concluído");
    expect(rotuloStatusAgendamento("expirado")).toBe("Expirado");
  });

  it("mostra o valor cru para status desconhecido e avisa quando falta", () => {
    expect(rotuloStatusAgendamento("reagendado")).toBe("reagendado");
    expect(rotuloStatusAgendamento(undefined)).toBe("Situação não informada");
  });
});
