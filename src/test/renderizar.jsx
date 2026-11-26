import { render } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import { MemoryRouter } from "react-router-dom";
import { system } from "@/theme";

export function renderizar(elemento, { rota = "/" } = {}) {
  function Provedores({ children }) {
    return (
      <ChakraProvider value={system}>
        <MemoryRouter initialEntries={[rota]}>{children}</MemoryRouter>
      </ChakraProvider>
    );
  }
  return render(elemento, { wrapper: Provedores });
}
