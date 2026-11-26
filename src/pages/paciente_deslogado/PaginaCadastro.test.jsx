import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderizar } from "@/test/renderizar";
import { registrarClinica } from "@/services/autenticacaoService";
import PaginaCadastro from "./PaginaCadastro";

vi.mock("@/services/autenticacaoService", () => ({
  registrarClinica: vi.fn(),
  registrarPaciente: vi.fn(),
  listarConvenios: vi.fn().mockResolvedValue(
    ["amil", "unimed", "hapvida", "cassi", "geap-saude", "sulamerica"].map((id) => ({ id, nome: id.toUpperCase() })),
  ),
}));

describe("PaginaCadastro (clínica)", () => {
  it("mostra a escolha de convênios e não envia com menos de 5", async () => {
    renderizar(<PaginaCadastro />, { rota: "/cadastro?perfil=clinica" });
    const grupo = await screen.findByRole("group", { name: "Convênios aceitos pela clínica" });
    expect(grupo).toBeInTheDocument();
    expect(await screen.findByRole("checkbox", { name: "AMIL" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("checkbox", { name: "AMIL" }));
    const enviar = screen.getAllByRole("button").find((botao) => botao.getAttribute("type") === "submit");
    await userEvent.click(enviar);
    expect(screen.getByText("Escolha de 5 a 10 convênios aceitos pela clínica.")).toBeInTheDocument();
    expect(registrarClinica).not.toHaveBeenCalled();
  });
});
