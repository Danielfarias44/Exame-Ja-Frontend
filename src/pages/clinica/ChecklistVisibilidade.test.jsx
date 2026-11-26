import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderizar } from "@/test/renderizar";
import ChecklistVisibilidade from "./ChecklistVisibilidade";

describe("ChecklistVisibilidade", () => {
  it("conta o que falta e indica o estado por texto, não só por cor", () => {
    renderizar(<ChecklistVisibilidade itens={[
      { feito: true, texto: "Cadastro aprovado" },
      { feito: false, texto: "Pelo menos 5 convênios", ajuda: "Escolha na lista" },
      { feito: false, texto: "Um exame com preço" },
    ]} />);
    expect(screen.getByText(/Faltam 2 itens/)).toBeInTheDocument();
    expect(screen.getByText("Concluído:")).toBeInTheDocument();
    expect(screen.getAllByText("Pendente:")).toHaveLength(2);
    expect(screen.getByText("Escolha na lista")).toBeInTheDocument();
  });

  it("avisa quando está tudo pronto", () => {
    renderizar(<ChecklistVisibilidade itens={[{ feito: true, texto: "Cadastro aprovado" }]} />);
    expect(screen.getByText(/Tudo pronto/)).toBeInTheDocument();
  });
});
