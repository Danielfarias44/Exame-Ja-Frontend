import { useState } from "react";
import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderizar } from "@/test/renderizar";
import SeletorConvenios from "./SeletorConvenios";

const CONVENIOS = ["Amil", "Unimed", "Hapvida", "Cassi"].map((nome) => ({ id: nome.toLowerCase(), nome }));

function Controlado({ inicial = [], maximo = 3, erro }) {
  const [selecionados, setSelecionados] = useState(inicial);
  return (
    <>
      <SeletorConvenios legenda="Convênios aceitos" convenios={CONVENIOS} selecionados={selecionados} onChange={setSelecionados} minimo={2} maximo={maximo} erro={erro} idPrimeiro="primeiro" />
      <output data-testid="valor">{selecionados.join(",")}</output>
    </>
  );
}

describe("SeletorConvenios", () => {
  it("agrupa as opções num fieldset com legenda e caixas rotuladas", () => {
    renderizar(<Controlado />);
    expect(screen.getByRole("group", { name: "Convênios aceitos" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Amil" })).toHaveAttribute("id", "primeiro");
    expect(screen.getByText("Escolha de 2 a 3. 0 selecionados.")).toBeInTheDocument();
  });

  it("marca e desmarca, e trava as outras opções ao chegar no máximo", async () => {
    renderizar(<Controlado />);
    for (const nome of ["Amil", "Unimed", "Hapvida"]) await userEvent.click(screen.getByRole("checkbox", { name: nome }));
    expect(screen.getByTestId("valor")).toHaveTextContent("amil,unimed,hapvida");
    expect(screen.getByRole("checkbox", { name: "Cassi" })).toBeDisabled();
    expect(screen.getByText(/Limite atingido/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("checkbox", { name: "Unimed" }));
    expect(screen.getByTestId("valor")).toHaveTextContent("amil,hapvida");
    expect(screen.getByRole("checkbox", { name: "Cassi" })).toBeEnabled();
  });

  it("liga a mensagem de erro ao grupo", () => {
    renderizar(<Controlado erro="Escolha de 2 a 3 convênios." />);
    const grupo = screen.getByRole("group", { name: "Convênios aceitos" });
    expect(grupo).toHaveAttribute("aria-invalid", "true");
    expect(grupo).toHaveAccessibleDescription(/Escolha de 2 a 3 convênios\./);
  });
});
