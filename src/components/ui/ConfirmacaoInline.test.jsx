import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderizar } from "@/test/renderizar";
import ConfirmacaoInline from "./ConfirmacaoInline";

describe("ConfirmacaoInline", () => {
  it("recebe o foco ao abrir e confirma sem motivo", async () => {
    const onConfirmar = vi.fn();
    renderizar(<ConfirmacaoInline pergunta="Cancelar?" rotuloConfirmar="Sim, cancelar" onConfirmar={onConfirmar} onCancelar={() => {}} />);
    const confirmar = screen.getByRole("button", { name: "Sim, cancelar" });
    expect(confirmar).toHaveFocus();
    expect(screen.getByRole("group", { name: "Cancelar?" })).toBeInTheDocument();
    await userEvent.click(confirmar);
    expect(onConfirmar).toHaveBeenCalledWith(undefined);
  });

  it("exige o motivo mínimo e devolve o texto sem espaços nas pontas", async () => {
    const onConfirmar = vi.fn();
    renderizar(
      <ConfirmacaoInline
        pergunta="Recusar?"
        rotuloConfirmar="Recusar"
        motivo={{ rotulo: "Motivo da recusa", minimo: 3, maximo: 300 }}
        onConfirmar={onConfirmar}
        onCancelar={() => {}}
      />,
    );
    const campo = screen.getByLabelText("Motivo da recusa");
    expect(campo).toHaveFocus();
    await userEvent.type(campo, "ok");
    await userEvent.click(screen.getByRole("button", { name: "Recusar" }));
    expect(onConfirmar).not.toHaveBeenCalled();
    expect(screen.getByText("Escreva pelo menos 3 caracteres.")).toBeInTheDocument();
    expect(campo).toHaveFocus();
    await userEvent.type(campo, " sem vaga  ");
    await userEvent.click(screen.getByRole("button", { name: "Recusar" }));
    expect(onConfirmar).toHaveBeenCalledWith("ok sem vaga");
  });

  it("chama onCancelar e trava os botões enquanto envia", async () => {
    const onCancelar = vi.fn();
    const { rerender } = renderizar(<ConfirmacaoInline pergunta="?" rotuloConfirmar="Sim" rotuloVoltar="Voltar" onConfirmar={() => {}} onCancelar={onCancelar} />);
    await userEvent.click(screen.getByRole("button", { name: "Voltar" }));
    expect(onCancelar).toHaveBeenCalled();
    rerender(<ConfirmacaoInline pergunta="?" rotuloConfirmar="Sim" rotuloEnviando="Enviando…" ocupado onConfirmar={() => {}} onCancelar={onCancelar} />);
    expect(screen.getByRole("button", { name: "Enviando…" })).toBeDisabled();
  });
});
