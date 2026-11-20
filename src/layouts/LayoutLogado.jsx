import { useEffect, useState } from "react";
import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Text,
} from "@chakra-ui/react";
import logoClara from "@/assets/exame-ja_horizontal.png";
import logoEscura from "@/assets/exame-ja_negativa.png";
import {
  obterNotificacoesPaciente,
  obterPerfilPaciente,
} from "@/services/pacienteLogadoService";

const LINKS_BARRA_INFERIOR = [
  {
    rotulo: "Início",
    rota: "/paciente",
    icone: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    rotulo: "Buscar",
    rota: "/paciente/mapa",
    icone: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    rotulo: "Agendar",
    rota: "/paciente/agendar",
    icone: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    rotulo: "Chat",
    rota: "/paciente/chat",
    icone: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    rotulo: "Perfil",
    rota: "/paciente/perfil",
    icone: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

const LINKS_DESKTOP = [
  { rotulo: "Início", rota: "/paciente" },
  { rotulo: "Buscar no Mapa", rota: "/paciente/mapa" },
  { rotulo: "Agendar", rota: "/paciente/agendar" },
  { rotulo: "Meus Exames", rota: "/paciente/agendamentos" },
  { rotulo: "Histórico", rota: "/paciente/historico" },
  { rotulo: "Chat", rota: "/paciente/chat" },
];

export default function LayoutLogado() {
  const location = useLocation();

  const [temaEscuro, setTemaEscuro] = useState(() =>
    document.documentElement.classList.contains("dark")
  );
  const [naoLidas, setNaoLidas] = useState(0);
  const [iniciaisUsuario, setIniciaisUsuario] = useState("MC");

  useEffect(() => {
    let ativo = true;

    function carregarCabecalho() {
      Promise.all([obterNotificacoesPaciente(), obterPerfilPaciente()]).then(
        ([notificacoes, perfil]) => {
          if (!ativo) return;
          setNaoLidas(notificacoes.filter((n) => !n.lida).length);
          if (perfil?.nomeCompleto) {
            const partes = perfil.nomeCompleto.trim().split(" ");
            const iniciais =
              partes.length > 1
                ? `${partes[0][0]}${partes[partes.length - 1][0]}`
                : partes[0].slice(0, 2);
            setIniciaisUsuario(iniciais.toUpperCase());
          }
        }
      );
    }

    carregarCabecalho();
    window.addEventListener("paciente-estado-atualizado", carregarCabecalho);
    return () => {
      ativo = false;
      window.removeEventListener("paciente-estado-atualizado", carregarCabecalho);
    };
  }, [location.pathname]);

  function alternarTema() {
    const proximo = !temaEscuro;
    setTemaEscuro(proximo);
    document.documentElement.classList.toggle("dark", proximo);
    localStorage.setItem("tema", proximo ? "dark" : "light");
  }

  function rotaEstaAtiva(rota) {
    if (rota === "/paciente") {
      return location.pathname === "/paciente";
    }
    return location.pathname.startsWith(rota);
  }

  return (
    <Flex
      direction="column"
      minH="100vh"
      bg="var(--color-bg)"
      color="var(--color-text)"
    >
      {/* Cabeçalho */}
      <Box
        as="header"
        position="sticky"
        top={0}
        zIndex={30}
        bg="var(--color-surface)"
        borderBottom="1px solid var(--color-border-soft)"
        boxShadow="var(--shadow-sm)"
      >
        <Container maxW="1160px" px={{ base: 4, md: 6 }}>
          <Flex h="66px" align="center" justify="space-between" gap={3}>
            <RouterLink
              to="/paciente"
              style={{ display: "inline-flex", alignItems: "center" }}
            >
              <img
                src={temaEscuro ? logoEscura : logoClara}
                alt="Exame Já"
                style={{ height: "32px", width: "auto" }}
              />
            </RouterLink>

            {/* Navegação Desktop */}
            <HStack
              as="nav"
              display={{ base: "none", lg: "flex" }}
              gap={1}
              aria-label="Navegação do paciente"
            >
              {LINKS_DESKTOP.map((item) => {
                const ativo = rotaEstaAtiva(item.rota);
                return (
                  <Box
                    key={item.rota}
                    asChild
                    px={3.5}
                    py={2}
                    borderRadius="var(--radius-md)"
                    bg={ativo ? "var(--color-primary-soft)" : "transparent"}
                    color={
                      ativo
                        ? "var(--color-primary)"
                        : "var(--color-text-muted)"
                    }
                    fontFamily="var(--font-heading)"
                    fontWeight={ativo ? "var(--weight-bold)" : 600}
                    fontSize="0.88rem"
                    transition="all var(--duration-fast) var(--ease-standard)"
                    _hover={{
                      bg: "var(--color-primary-soft)",
                      color: "var(--color-primary)",
                    }}
                  >
                    <RouterLink to={item.rota}>{item.rotulo}</RouterLink>
                  </Box>
                );
              })}
            </HStack>

            {/* Ações Direita: Tema + Sino de Notificações + Avatar Circular */}
            <HStack gap={2.5}>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                boxSize="38px"
                p={0}
                borderRadius="var(--radius-full)"
                bg="var(--color-bg)"
                border="1px solid var(--color-border-soft)"
                color="var(--color-text)"
                onClick={alternarTema}
                aria-label="Alternar tema"
              >
                {temaEscuro ? "☀" : "☾"}
              </Button>

              <Button
                asChild
                size="sm"
                variant="ghost"
                boxSize="40px"
                p={0}
                position="relative"
                borderRadius="var(--radius-full)"
                bg="var(--color-bg)"
                border="1px solid var(--color-border-soft)"
                color="var(--color-text)"
                aria-label="Notificações"
                title="Notificações"
              >
                <RouterLink to="/paciente/notificacoes">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {naoLidas > 0 && (
                    <Badge
                      position="absolute"
                      top="-2px"
                      right="-2px"
                      minW="17px"
                      h="17px"
                      px={1}
                      borderRadius="var(--radius-full)"
                      bg="var(--color-accent)"
                      color="#ffffff"
                      fontSize="0.65rem"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      {naoLidas}
                    </Badge>
                  )}
                </RouterLink>
              </Button>

              <Box
                asChild
                boxSize="40px"
                borderRadius="var(--radius-full)"
                bg="var(--color-primary)"
                color="var(--color-text-on-primary)"
                fontFamily="var(--font-heading)"
                fontWeight="var(--weight-bold)"
                fontSize="0.82rem"
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="var(--shadow-sm)"
                title="Meu perfil"
                aria-label="Meu perfil"
              >
                <RouterLink to="/paciente/perfil">{iniciaisUsuario}</RouterLink>
              </Box>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Conteúdo das Telas */}
      <Box as="main" flex="1" pb={{ base: "86px", lg: 12 }}>
        <Outlet />
      </Box>

      {/* Barra Inferior Mobile */}
      <Box
        as="nav"
        display={{ base: "block", lg: "none" }}
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        zIndex={30}
        bg="#153250"
        color="#ffffff"
        borderTop="1px solid rgba(255, 255, 255, 0.1)"
        boxShadow="var(--shadow-md)"
        px={2}
        py={2}
        aria-label="Navegação inferior"
      >
        <Flex justify="space-around" align="center">
          {LINKS_BARRA_INFERIOR.map((item) => {
            const ativo = rotaEstaAtiva(item.rota);
            return (
              <Box
                key={item.rota}
                asChild
                flex="1"
                py={1}
                borderRadius="var(--radius-md)"
                color={ativo ? "#ffffff" : "rgba(255, 255, 255, 0.65)"}
                transition="all var(--duration-fast) var(--ease-standard)"
              >
                <RouterLink to={item.rota}>
                  <Flex direction="column" align="center" gap={1}>
                    {item.icone}
                    <Text
                      fontFamily="var(--font-heading)"
                      fontWeight={ativo ? "var(--weight-bold)" : 500}
                      fontSize="0.68rem"
                      lineHeight="1"
                    >
                      {item.rotulo}
                    </Text>
                  </Flex>
                </RouterLink>
              </Box>
            );
          })}
        </Flex>
      </Box>
    </Flex>
  );
}