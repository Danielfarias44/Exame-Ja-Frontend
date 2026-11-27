import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Flex, Image } from "@chakra-ui/react";
import logoClaro from "@/assets/exame-ja_horizontal.png";

function verificarTemaEscuro() {
  if (typeof document === "undefined") return false;
  const html = document.documentElement;
  const body = document.body;
  return (
    html.getAttribute("data-theme") === "dark" ||
    html.classList.contains("dark") ||
    body?.getAttribute("data-theme") === "dark" ||
    body?.classList.contains("dark")
  );
}

export default function LogoAutenticacao() {
  const [temaEscuro, setTemaEscuro] = useState(verificarTemaEscuro);

  useEffect(() => {
    const atualizarTema = () => setTemaEscuro(verificarTemaEscuro());
    atualizarTema();

    const observador = new MutationObserver(atualizarTema);
    observador.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });
    if (document.body) {
      observador.observe(document.body, {
        attributes: true,
        attributeFilter: ["data-theme", "class"],
      });
    }

    return () => observador.disconnect();
  }, []);

  return (
    <Flex justify="center" mb={{ base: "var(--space-6)", sm: "var(--space-6)" }}>
      <Box
        asChild
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        borderRadius="var(--radius-md)"
        transition="opacity var(--duration-fast) var(--ease-standard)"
        _hover={{ opacity: 0.88 }}
      >
        <RouterLink to="/" aria-label="Voltar para a página inicial do Exame Já">
          <Image
            src={logoClaro}
            alt="Exame Já"
            h={{ base: "var(--logo-sm)", sm: "var(--logo-md)" }}
            w="auto"
            objectFit="contain"
            filter={temaEscuro ? "brightness(0) invert(1)" : "none"}
            transition="filter var(--duration-base) var(--ease-standard)"
          />
        </RouterLink>
      </Box>
    </Flex>
  );
}
