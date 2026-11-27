import { useEffect, useState } from "react";
import { Link as RouterLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Badge, Box, Container, Flex, HStack, Text } from "@chakra-ui/react";
import Button from "@/components/ui/Button";
import logoClara from "@/assets/exame-ja_horizontal.png";
import { encerrarSessao, obterSessaoAtual } from "@/services/autenticacaoService";
import { apiRequest } from "@/services/httpClient";
import { useTema } from "@/hooks/useTema";
import PularParaConteudo, { ID_CONTEUDO } from "@/components/ui/PularParaConteudo";

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
    rotulo: "Agendamentos",
    rota: "/paciente/agendamentos",
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
    rotulo: "Mapa",
    rota: "/paciente/mapa",
    icone: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
        <line x1="8" y1="2" x2="8" y2="18" />
        <line x1="16" y1="6" x2="16" y2="22" />
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
  { rotulo: "Mapa de clínicas", rota: "/paciente/mapa" },
  { rotulo: "Agendamentos", rota: "/paciente/agendamentos" },
  { rotulo: "Histórico", rota: "/paciente/historico" },
  { rotulo: "Chat", rota: "/paciente/chat" },
  { rotulo: "Perfil", rota: "/paciente/perfil" },
];

export default function LayoutLogado() {
  const location = useLocation();
  const navegar = useNavigate();

  const { ehEscuro, alternarTema } = useTema();
  const [naoLidas, setNaoLidas] = useState(0);
  const [iniciaisUsuario, setIniciaisUsuario] = useState(() => obterIniciais(obterSessaoAtual()?.nome));
  const [erroSaida, setErroSaida] = useState("");

  useEffect(() => {
    const atualizarIniciais = () => setIniciaisUsuario(obterIniciais(obterSessaoAtual()?.nome));
    window.addEventListener("exameja:sessao-alterada", atualizarIniciais);
    return () => window.removeEventListener("exameja:sessao-alterada", atualizarIniciais);
  }, []);

  useEffect(() => {
    let ativo = true;
    const carregarNotificacoes = () => apiRequest("/api/users/notifications?limit=50")
      .then((resultado) => {
        if (ativo) setNaoLidas((resultado.notificacoes ?? []).filter((item) => !item.lida).length);
      })
      .catch(() => { if (ativo) setNaoLidas(0); });
    carregarNotificacoes();
    window.addEventListener("exameja:notificacoes-atualizadas", carregarNotificacoes);
    return () => {
      ativo = false;
      window.removeEventListener("exameja:notificacoes-atualizadas", carregarNotificacoes);
    };
  }, []);

  async function sair() {
    setErroSaida("");
    try {
      await encerrarSessao();
      navegar("/", { replace: true });
    } catch {
      setErroSaida("Não foi possível encerrar a sessão. Verifique sua conexão e tente novamente.");
    }
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
      <PularParaConteudo />
      {/* Cabeçalho */}
      <Box
        as="header"
        position="sticky"
        top={0}
        zIndex={30}
        bg="var(--color-surface)"
        borderBottom="var(--border-width) solid var(--color-border-soft)"
        boxShadow="var(--shadow-sm)"
      >
        <Container maxW="var(--container-max)" px={{ base: "var(--space-4)", md: "var(--space-6)" }}>
          <Flex h="var(--header-height)" align="center" justify="space-between" gap="var(--space-3)">
            <RouterLink
              to="/paciente"
              style={{ display: "inline-flex", alignItems: "center" }}
            >
              <img
                src={logoClara}
                alt="Exame Já"
                style={{ height: "var(--icon-md)", width: "auto" }}
                className={ehEscuro ? "logo-tema-escuro" : undefined}
              />
            </RouterLink>

            {/* Navegação Desktop */}
            <HStack
              as="nav"
              display={{ base: "none", lg: "flex" }}
              gap="var(--space-1)"
              aria-label="Navegação do paciente"
            >
              {LINKS_DESKTOP.map((item) => {
                const ativo = rotaEstaAtiva(item.rota);
                return (
                  <Box
                    key={item.rota}
                    asChild
                    px="var(--space-4)"
                    py="var(--space-2)"
                    borderRadius="var(--radius-md)"
                    bg={ativo ? "var(--color-primary-soft)" : "transparent"}
                    color={
                      ativo
                        ? "var(--color-primary)"
                        : "var(--color-text-muted)"
                    }
                    fontFamily="var(--font-heading)"
                    fontWeight={ativo ? "var(--weight-bold)" : 600}
                    fontSize="var(--text-xs)"
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
            <HStack gap="var(--space-3)">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                boxSize="var(--icon-md)"
                p={0}
                borderRadius="var(--radius-full)"
                bg="var(--color-bg)"
                border="var(--border-width) solid var(--color-border-soft)"
                color="var(--color-text)"
                onClick={alternarTema}
                aria-label="Alternar tema"
              >
                {ehEscuro ? "☀" : "☾"}
              </Button>

              <Button
                asChild
                size="sm"
                variant="ghost"
                boxSize="var(--icon-md)"
                p={0}
                position="relative"
                borderRadius="var(--radius-full)"
                bg="var(--color-bg)"
                border="var(--border-width) solid var(--color-border-soft)"
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
                      top="calc(var(--space-1) * -1)"
                      right="calc(var(--space-1) * -1)"
                      minW="var(--icon-sm)"
                      h="var(--icon-sm)"
                      px="var(--space-1)"
                      borderRadius="var(--radius-full)"
                      bg="var(--color-accent)"
                      color="var(--color-text-on-accent)"
                      fontSize="var(--text-xs)"
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
                boxSize="var(--icon-md)"
                borderRadius="var(--radius-full)"
                bg="var(--color-primary)"
                color="var(--color-text-on-primary)"
                fontFamily="var(--font-heading)"
                fontWeight="var(--weight-bold)"
                fontSize="var(--text-xs)"
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="var(--shadow-sm)"
                title="Meu perfil"
                aria-label="Meu perfil"
              >
                <RouterLink to="/paciente/perfil">{iniciaisUsuario}</RouterLink>
              </Box>
              <Button type="button" size="sm" variant="ghost" onClick={sair} aria-label="Sair da conta">
                Sair
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {erroSaida && <Text role="alert" textAlign="center" color="var(--color-error)" fontSize="var(--text-sm)" py="var(--space-2)">{erroSaida}</Text>}

      {/* Conteúdo das Telas */}
      <Box as="main" id={ID_CONTEUDO} tabIndex={-1} flex="1" pb={{ base: "calc(var(--bottom-nav-offset) - var(--space-6))", lg: "var(--space-12)" }} _focus={{ outline: "none" }}>
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
        bg="var(--color-inverse-bg)"
        color="var(--color-inverse-text)"
        borderTop="var(--border-width) solid var(--color-inverse-border)"
        boxShadow="var(--shadow-md)"
        px="var(--space-2)"
        py="var(--space-2)"
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
                py="var(--space-1)"
                borderRadius="var(--radius-md)"
                color={ativo ? "var(--color-inverse-text)" : "var(--color-inverse-muted)"}
                transition="all var(--duration-fast) var(--ease-standard)"
              >
                <RouterLink to={item.rota}>
                  <Flex direction="column" align="center" gap="var(--space-1)">
                    {item.icone}
                    <Text
                      fontFamily="var(--font-heading)"
                      fontWeight={ativo ? "var(--weight-bold)" : 500}
                      fontSize="var(--text-xs)"
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

function obterIniciais(nome = "") {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return "U";
  return (partes.length > 1 ? `${partes[0][0]}${partes.at(-1)[0]}` : partes[0].slice(0, 2)).toUpperCase();
}
