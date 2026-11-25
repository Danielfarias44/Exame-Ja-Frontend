import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Image,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  Link as RouterLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import AlternadorTema from "@/components/layout/AlternadorTema";
import { useTema } from "@/hooks/useTema";
import logoHorizontal from "@/assets/exame-ja_horizontal.png";

const LINKS_NAVEGACAO = [
  { rotulo: "Como funciona", destino: "/#como-funciona" },
  { rotulo: "Especialidades", destino: "/#especialidades" },
  { rotulo: "Para clínicas", destino: "/#para-clinicas" },
];

export default function LayoutPublico() {
  const localizacao = useLocation();
  const navegar = useNavigate();
  const { ehEscuro } = useTema();
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const [paginaRolada, setPaginaRolada] = useState(false);

  const ocultarRodapeCta = ["/cadastro", "/login", "/recuperar-acesso"].includes(
    localizacao.pathname
  );

  useEffect(() => {
    setMenuMobileAberto(false);
  }, [localizacao.pathname, localizacao.hash]);

  useEffect(() => {
    if (!localizacao.hash) return;
    const idSecao = localizacao.hash.replace("#", "");

    let tentativas = 0;
    const intervalo = setInterval(() => {
      const elemento = document.getElementById(idSecao);
      if (elemento) {
        const posicaoY =
          elemento.getBoundingClientRect().top + window.scrollY - 84;
        window.scrollTo({ top: posicaoY, behavior: "smooth" });
        clearInterval(intervalo);
      } else if (tentativas >= 15) {
        clearInterval(intervalo);
      }
      tentativas += 1;
    }, 80);

    return () => clearInterval(intervalo);
  }, [localizacao.pathname, localizacao.hash]);

  useEffect(() => {
    function aoRolar() {
      setPaginaRolada(window.scrollY > 12);
    }
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  function irParaSecao(evento, destino) {
    evento.preventDefault();
    setMenuMobileAberto(false);

    const idSecao = destino.split("#")[1];
    if (!idSecao) return;

    if (localizacao.pathname !== "/") {
      navegar(destino);
      return;
    }

    const elemento = document.getElementById(idSecao);
    if (elemento) {
      const posicaoY =
        elemento.getBoundingClientRect().top + window.scrollY - 84;
      window.scrollTo({ top: posicaoY, behavior: "smooth" });
      window.history.replaceState(null, "", destino);
    }
  }

  return (
    <Flex
      direction="column"
      minH="100dvh"
      bg="var(--color-bg)"
      color="var(--color-text)"
      overflowX="clip"
    >
      {/* Cabeçalho fixo */}
      <Box
        as="header"
        position="sticky"
        top="0"
        zIndex="var(--z-sticky, 1000)"
        bg="var(--color-header-bg, var(--color-surface))"
        backdropFilter="blur(12px)"
        borderBottom="1px solid"
        borderColor={paginaRolada ? "var(--color-border-soft)" : "transparent"}
        boxShadow={paginaRolada ? "var(--shadow-sm)" : "none"}
        transition="all var(--duration-base) var(--ease-standard)"
      >
        <Container maxW="var(--container-max)" px={{ base: 4, md: 6 }} py={2.5}>
          <Flex align="center" justify="space-between" gap={4}>
            {/* Marca oficial adaptada ao tema */}
            <RouterLink
              to="/"
              aria-label="Exame Já - Página inicial"
              style={{
                display: "inline-flex",
                alignItems: "center",
                textDecoration: "none",
                minHeight: "var(--touch-target-min)",
              }}
            >
              <Image
                src={logoHorizontal}
                alt="Exame Já"
                h={{ base: "38px", sm: "44px", md: "48px" }}
                w="auto"
                maxW={{ base: "170px", md: "220px" }}
                objectFit="contain"
                filter={ehEscuro ? "brightness(0) invert(1)" : "none"}
                transition="filter var(--duration-base) var(--ease-standard)"
              />
            </RouterLink>

            {/* Links centrais (Desktop) */}
            <HStack
              as="nav"
              aria-label="Navegação principal"
              display={{ base: "none", lg: "flex" }}
              gap={6}
            >
              {LINKS_NAVEGACAO.map((item) => (
                <RouterLink
                  key={item.rotulo}
                  to={item.destino}
                  onClick={(e) => irParaSecao(e, item.destino)}
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 600,
                    fontSize: "0.98rem",
                    color: "var(--color-text-muted)",
                    textDecoration: "none",
                    padding: "0.5rem 0.25rem",
                  }}
                >
                  <Text
                    as="span"
                    _hover={{ color: "var(--color-primary)" }}
                    transition="color var(--duration-fast)"
                  >
                    {item.rotulo}
                  </Text>
                </RouterLink>
              ))}
            </HStack>

            {/* Ações à direita */}
            <HStack gap={{ base: 2, md: 3 }}>
              <AlternadorTema />

              <HStack display={{ base: "none", md: "flex" }} gap={2.5}>
                <Button
                  asChild
                  variant="outline"
                  borderColor="var(--color-border-soft)"
                  bg="var(--color-surface)"
                  color="var(--color-text)"
                  _hover={{
                    borderColor: "var(--color-primary)",
                    color: "var(--color-primary)",
                  }}
                  fontFamily="var(--font-heading)"
                  fontWeight="var(--weight-bold)"
                  fontSize="0.95rem"
                  px={5}
                  minH="var(--touch-target-min)"
                  borderRadius="var(--radius-md)"
                >
                  <RouterLink to="/login">Entrar</RouterLink>
                </Button>

                <Button
                  asChild
                  bg="var(--color-primary)"
                  _hover={{
                    bg: "var(--color-primary-hover)",
                    transform: "translateY(-1px)",
                  }}
                  color="var(--color-text-on-primary)"
                  fontFamily="var(--font-heading)"
                  fontWeight="var(--weight-bold)"
                  fontSize="0.95rem"
                  px={5}
                  minH="var(--touch-target-min)"
                  borderRadius="var(--radius-md)"
                  boxShadow="var(--shadow-sm)"
                  transition="all var(--duration-fast) var(--ease-standard)"
                >
                  <RouterLink to="/cadastro">Criar conta</RouterLink>
                </Button>
              </HStack>

              {/* Botão Hambúrguer Mobile */}
              <Box
                as="button"
                type="button"
                onClick={() => setMenuMobileAberto((aberto) => !aberto)}
                aria-expanded={menuMobileAberto}
                aria-controls="menu-navegacao-mobile"
                aria-label={menuMobileAberto ? "Fechar menu" : "Abrir menu"}
                display={{ base: "inline-flex", lg: "none" }}
                alignItems="center"
                justifyContent="center"
                minW="var(--touch-target-min)"
                minH="var(--touch-target-min)"
                borderRadius="var(--radius-md)"
                border="1px solid var(--color-border-soft)"
                bg="var(--color-surface)"
                color="var(--color-text)"
                cursor="pointer"
              >
                {menuMobileAberto ? (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                )}
              </Box>
            </HStack>
          </Flex>

          {/* Menu Mobile */}
          {menuMobileAberto && (
            <Box
              id="menu-navegacao-mobile"
              display={{ base: "block", lg: "none" }}
              mt={3}
              p={4}
              bg="var(--color-surface)"
              border="1px solid var(--color-border-soft)"
              borderRadius="var(--radius-lg)"
              boxShadow="var(--shadow-lg)"
              className="animar-entrada"
            >
              <VStack align="stretch" gap={1}>
                {LINKS_NAVEGACAO.map((item) => (
                  <RouterLink
                    key={item.rotulo}
                    to={item.destino}
                    onClick={(e) => irParaSecao(e, item.destino)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      minHeight: "var(--touch-target-min)",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "var(--radius-md)",
                      fontFamily: "var(--font-heading)",
                      fontWeight: 600,
                      fontSize: "1rem",
                      color: "var(--color-text)",
                      textDecoration: "none",
                    }}
                  >
                    {item.rotulo}
                  </RouterLink>
                ))}
              </VStack>

              <SimpleGrid
                columns={{ base: 1, sm: 2 }}
                gap={3}
                mt={4}
                pt={4}
                borderTop="1px solid var(--color-border-soft)"
              >
                <Button
                  asChild
                  variant="outline"
                  borderColor="var(--color-border-soft)"
                  color="var(--color-text)"
                  fontFamily="var(--font-heading)"
                  fontWeight="var(--weight-bold)"
                  minH="46px"
                  w="100%"
                >
                  <RouterLink to="/login">Entrar</RouterLink>
                </Button>

                <Button
                  asChild
                  bg="var(--color-primary)"
                  color="var(--color-text-on-primary)"
                  fontFamily="var(--font-heading)"
                  fontWeight="var(--weight-bold)"
                  minH="46px"
                  w="100%"
                >
                  <RouterLink to="/cadastro">Criar conta</RouterLink>
                </Button>
              </SimpleGrid>
            </Box>
          )}
        </Container>
      </Box>

      {/* Conteúdo principal */}
      <Box as="main" flex="1" w="100%">
        <Outlet />
      </Box>

      {/* Rodapé institucional */}
      <Box as="footer" bg="#162332" color="#f8fafc" mt="auto">
        {!ocultarRodapeCta && (
          <Container
            maxW="var(--container-max)"
            px={{ base: 4, md: 6 }}
            pt={{ base: 10, md: 12 }}
            pb={{ base: 8, md: 10 }}
            textAlign="center"
          >
            <Image
              src={logoHorizontal}
              alt="Exame Já"
              h="46px"
              w="auto"
              mx="auto"
              mb={4}
              objectFit="contain"
              filter="brightness(0) invert(1)"
            />

            <Text
              fontFamily="var(--font-heading)"
              fontWeight="var(--weight-bold)"
              fontSize={{ base: "1.35rem", md: "1.6rem" }}
              mb={2}
            >
              Pronto para agendar sem surpresas no valor?
            </Text>
            <Text
              fontFamily="var(--font-body)"
              fontSize={{ base: "var(--text-xs)", md: "var(--text-sm)" }}
              color="#cbd5e1"
              maxW="540px"
              mx="auto"
              mb={6}
            >
              Comece a agilizar seus exames a partir de agora, é simples e rápido.
            </Text>

            <Flex
              direction={{ base: "column", sm: "row" }}
              justify="center"
              align="center"
              gap={3}
            >
              <Button
                asChild
                bg="var(--color-accent)"
                _hover={{
                  bg: "var(--color-accent-hover)",
                  transform: "translateY(-2px)",
                }}
                color="#ffffff"
                fontFamily="var(--font-heading)"
                fontWeight="var(--weight-bold)"
                fontSize="1rem"
                px={8}
                minH="48px"
                w={{ base: "100%", sm: "auto" }}
                maxW="280px"
                borderRadius="var(--radius-md)"
                boxShadow="var(--shadow-md)"
                transition="all var(--duration-fast) var(--ease-standard)"
              >
                <RouterLink to="/cadastro">Cadastrar-se gratuitamente</RouterLink>
              </Button>

              <Button
                asChild
                variant="outline"
                borderColor="rgb(255 255 255 / 0.28)"
                color="#ffffff"
                _hover={{ bg: "rgb(255 255 255 / 0.08)" }}
                fontFamily="var(--font-heading)"
                fontWeight="var(--weight-bold)"
                fontSize="0.95rem"
                px={6}
                minH="48px"
                w={{ base: "100%", sm: "auto" }}
                maxW="280px"
                borderRadius="var(--radius-md)"
              >
                <RouterLink to="/cadastro?perfil=clinica">Sou uma clínica</RouterLink>
              </Button>
            </Flex>
          </Container>
        )}

        <Box borderTop="1px solid rgb(255 255 255 / 0.1)" py={4} px={4} textAlign="center">
          <Text fontFamily="var(--font-body)" fontSize="0.75rem" color="#94a3b8">
            Exame Já — Projeto SuperNova (Sebrae) • Transparência e agilidade em saúde
          </Text>
        </Box>
      </Box>
    </Flex>
  );
}
