import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderizar } from "@/test/renderizar";
import FormularioDecisao from "./FormularioDecisao";

const ACOES = [
  { valor: "aprovar", rotulo: "Aprovar", rotuloEnviando: "Aprovando…", exigeTexto: false },
  { valor: "rejeitar", rotulo: "Rejeitar", rotuloEnviando: "Rejeitando…", exigeTexto: true, verbo: "rejeitar" },
];

describe("FormularioDecisao", () => {
  it("aprova sem motivo e exige 10 caracteres para rejeitar", async () => {
    const aoConfirmar = vi.fn().mockResolvedValue();
    renderizar(<FormularioDecisao rotulo="Motivo" acoes={ACOES} aoConfirmar={aoConfirmar} />);
    await userEvent.click(screen.getByRole("button", { name: "Rejeitar" }));
    expect(aoConfirmar).not.toHaveBeenCalled();
    expect(screen.getByText("Escreva pelo menos 10 caracteres para rejeitar.")).toBeInTheDocument();
    expect(screen.getByLabelText("Motivo")).toHaveFocus();
    await userEvent.click(screen.getByRole("button", { name: "Aprovar" }));
    expect(aoConfirmar).toHaveBeenCalledWith("aprovar", "");
  });

  it("mostra o erro do back e libera os botões de novo", async () => {
    const aoConfirmar = vi.fn().mockRejectedValue(new Error("A ação não é permitida para o estado atual da clínica."));
    renderizar(<FormularioDecisao rotulo="Motivo" acoes={ACOES} aoConfirmar={aoConfirmar} />);
    await userEvent.type(screen.getByLabelText("Motivo"), "Documento ilegível no cadastro");
    await userEvent.click(screen.getByRole("button", { name: "Rejeitar" }));
    expect(aoConfirmar).toHaveBeenCalledWith("rejeitar", "Documento ilegível no cadastro");
    expect(await screen.findByText("A ação não é permitida para o estado atual da clínica.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Rejeitar" })).toBeEnabled();
  });
});
