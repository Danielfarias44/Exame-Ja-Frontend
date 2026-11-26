import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderizar } from "@/test/renderizar";
import CampoTexto from "./CampoTexto";

describe("CampoTexto", () => {
  it("liga o rótulo visível ao campo e mostra a ajuda", () => {
    renderizar(<CampoTexto label="E-mail" helperText="Use o e-mail do cadastro" />);
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByText("Use o e-mail do cadastro")).toBeInTheDocument();
  });

  it("marca o campo como inválido e troca a ajuda pelo erro", () => {
    renderizar(<CampoTexto label="E-mail" helperText="ajuda" error="Informe um e-mail válido" />);
    expect(screen.getByLabelText("E-mail")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Informe um e-mail válido")).toBeInTheDocument();
    expect(screen.queryByText("ajuda")).not.toBeInTheDocument();
  });

  it("vira área de texto quando multiline", () => {
    renderizar(<CampoTexto label="Motivo" multiline />);
    expect(screen.getByLabelText("Motivo").tagName).toBe("TEXTAREA");
  });
});
