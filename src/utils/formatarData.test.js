import { describe, expect, it } from "vitest";
import { formatarData } from "./formatarData";

const ISO = "2026-11-26T15:30:00.000Z";
const esperado = new Date(ISO).toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" });

describe("formatarData", () => {
  it("aceita o Timestamp do Firestore serializado pelo Admin SDK", () => {
    expect(formatarData({ _seconds: Date.parse(ISO) / 1000, _nanoseconds: 0 })).toBe(esperado);
  });

  it("aceita o formato com seconds, ISO e número", () => {
    expect(formatarData({ seconds: Date.parse(ISO) / 1000 })).toBe(esperado);
    expect(formatarData(ISO)).toBe(esperado);
    expect(formatarData(Date.parse(ISO))).toBe(esperado);
  });

  it("mostra só a data quando pedido", () => {
    expect(formatarData(ISO, { comHora: false })).toBe(new Date(ISO).toLocaleString("pt-BR", { dateStyle: "medium" }));
  });

  it("não quebra com valor vazio ou inválido", () => {
    expect(formatarData(null)).toBe("Data não informada");
    expect(formatarData(undefined)).toBe("Data não informada");
    expect(formatarData("não é data")).toBe("Data não informada");
    expect(formatarData({})).toBe("Data não informada");
  });
});
