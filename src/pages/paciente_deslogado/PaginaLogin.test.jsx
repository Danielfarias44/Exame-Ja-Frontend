import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderizar } from "@/test/renderizar";
import { entrarComEmailESenha } from "@/services/autenticacaoService";
import PaginaLogin from "./PaginaLogin";

vi.mock("@/services/autenticacaoService", () => ({
  entrarComEmailESenha: vi.fn().mockResolvedValue({ perfil: "admin" }),
  reenviarVerificacaoEmail: vi.fn(),
}));

describe("PaginaLogin", () => {
  it("troca para o acesso administrativo e entra com o perfil de admin", async () => {
    renderizar(<PaginaLogin />, { rota: "/login" });
    await userEvent.click(screen.getByRole("button", { name: "Sou administrador" }));
    expect(screen.getByRole("heading", { name: "Acesso administrativo" })).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Tipo de conta" })).not.toBeInTheDocument();
    expect(screen.queryByText("Criar conta gratuita")).not.toBeInTheDocument();

    await userEvent.type(screen.getByLabelText("E-mail"), "admin@exameja.com");
    await userEvent.type(screen.getByLabelText("Senha"), "segredo123");
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(entrarComEmailESenha).toHaveBeenCalledWith({ email: "admin@exameja.com", senha: "segredo123", perfil: "admin" });
  });

  it("volta do acesso administrativo para paciente ou clínica", async () => {
    renderizar(<PaginaLogin />, { rota: "/login?perfil=admin&redirect=/admin/usuarios" });
    await userEvent.click(screen.getByRole("button", { name: "Voltar ao login de paciente ou clínica" }));
    expect(screen.getByRole("heading", { name: "Entrar na sua conta" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Paciente", pressed: true })).toBeInTheDocument();
  });
});
