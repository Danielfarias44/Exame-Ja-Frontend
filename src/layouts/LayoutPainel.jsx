import { useState } from "react";
import { Link as RouterLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Box, Container, Flex, Text } from "@chakra-ui/react";
import logoClara from "@/assets/exame-ja_horizontal.png";
import Button from "@/components/ui/Button";
import FeedbackErro from "@/components/ui/FeedbackErro";
import StatusBadge from "@/components/ui/StatusBadge";
import PularParaConteudo, { ID_CONTEUDO } from "@/components/ui/PularParaConteudo";
import { useTema } from "@/hooks/useTema";
import { encerrarSessao } from "@/services/autenticacaoService";

export default function LayoutPainel({ rotaInicio, nomeArea, links }) {
  const location = useLocation();
  const navegar = useNavigate();
  const { tema } = useTema();
  const [erroSaida, setErroSaida] = useState("");

  function estaAtivo({ rota, exato }) {
    return exato ? location.pathname === rota : location.pathname.startsWith(rota);
  }

  async function sair() {
    setErroSaida("");
    try {
      await encerrarSessao();
      navegar("/", { replace: true });
    } catch {
      setErroSaida("Não foi possível encerrar a sessão. Verifique sua conexão e tente novamente.");
    }
  }

  return (
    <Flex direction="column" minH="100vh" bg="var(--color-bg)" color="var(--color-text)">
      <PularParaConteudo />

      <Box
        as="header"
        position="sticky"
        top={0}
        zIndex="var(--z-sticky)"
        bg="var(--color-surface)"
        borderBottomWidth="var(--border-width)"
        borderBottomStyle="solid"
        borderBottomColor="var(--color-border-soft)"
        boxShadow="var(--shadow-sm)"
      >
        <Container maxW="var(--container-max)" px={{ base: "var(--space-4)", md: "var(--space-6)" }} py="var(--space-3)">
          <Flex align="center" justify="space-between" gap="var(--space-3)" wrap="wrap">
            <Flex align="center" gap="var(--space-3)">
              <RouterLink to={rotaInicio} aria-label={`Exame Já, início da ${nomeArea.toLowerCase()}`}>
                <img
                  src={logoClara}
                  alt=""
                  style={{ height: "var(--icon-md)", width: "auto", display: "block" }}
                  className={tema === "dark" ? "logo-tema-escuro" : undefined}
                />
              </RouterLink>
              <StatusBadge tone="accent">{nomeArea}</StatusBadge>
            </Flex>
            <Button variant="outline" onClick={sair}>Sair</Button>
          </Flex>

          <Flex as="nav" aria-label={`Navegação da ${nomeArea.toLowerCase()}`} gap="var(--space-1)" wrap="wrap" mt="var(--space-3)">
            {links.map((link) => {
              const ativo = estaAtivo(link);
              return (
                <Box
                  key={link.rota}
                  asChild
                  display="inline-flex"
                  alignItems="center"
                  minH="var(--touch-target-min)"
                  px="var(--space-3)"
                  borderRadius="var(--radius-md)"
                  bg={ativo ? "var(--color-primary-soft)" : "transparent"}
                  color={ativo ? "var(--color-primary)" : "var(--color-text-muted)"}
                  fontFamily="var(--font-heading)"
                  fontWeight={ativo ? "var(--weight-bold)" : "var(--weight-semibold)"}
                  fontSize="var(--text-sm)"
                  textDecoration={ativo ? "underline" : "none"}
                  textUnderlineOffset="var(--space-1)"
                  transition="all var(--duration-fast) var(--ease-standard)"
                  _hover={{ bg: "var(--color-primary-soft)", color: "var(--color-primary)" }}
                >
                  <RouterLink to={link.rota} aria-current={ativo ? "page" : undefined}>{link.rotulo}</RouterLink>
                </Box>
              );
            })}
          </Flex>
        </Container>
      </Box>

      {erroSaida && (
        <Container maxW="var(--container-max)" px={{ base: "var(--space-4)", md: "var(--space-6)" }} pt="var(--space-4)">
          <FeedbackErro mensagem={erroSaida} titulo="Não foi possível sair" />
        </Container>
      )}

      <Box as="main" id={ID_CONTEUDO} tabIndex={-1} flex="1" _focus={{ outline: "none" }}>
        <Outlet />
      </Box>

      <Box as="footer" py="var(--space-4)" borderTopWidth="var(--border-width)" borderTopStyle="solid" borderTopColor="var(--color-border-soft)">
        <Text textAlign="center" fontSize="var(--text-xs)" color="var(--color-text-muted)">
          Exame Já · {nomeArea}
        </Text>
      </Box>
    </Flex>
  );
}
