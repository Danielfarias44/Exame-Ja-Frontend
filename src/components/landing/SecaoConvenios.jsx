import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Box, Container, Flex, Grid, Heading, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import Button from "@/components/ui/Button";
import { apiRequest } from "@/services/httpClient";

/**
 * Estilo visual aplicado aos convênios retornados pela API.
 */
const ESTILOS_CONVENIOS = [
  {
    nome: "Unimed",
    sigla: "UNI",
    detalhe: "Análises clínicas e imagem",
    corDestaque: "#00995d",
    fundoSuave: "rgb(0 153 93 / 0.12)",
    atrasoAnimacao: "0s",
    icone: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12h6M12 9v6" />
      </svg>
    ),
  },
  {
    nome: "Bradesco Saúde",
    sigla: "BRA",
    detalhe: "Rede credenciada completa",
    corDestaque: "#cc092f",
    fundoSuave: "rgb(204 9 47 / 0.12)",
    atrasoAnimacao: "0.4s",
    icone: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    nome: "Hapvida",
    sigla: "HAP",
    detalhe: "Laboratórios e check-up",
    corDestaque: "#f37021",
    fundoSuave: "rgb(243 112 33 / 0.13)",
    atrasoAnimacao: "0.8s",
    icone: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12h2.5l1.5-3 2 6 1.5-3H17" />
      </svg>
    ),
  },
  {
    nome: "SulAmérica",
    sigla: "SUL",
    detalhe: "Especialidades e diagnósticos",
    corDestaque: "#ea580c",
    fundoSuave: "rgb(234 88 12 / 0.12)",
    atrasoAnimacao: "1.2s",
    icone: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    nome: "Amil",
    sigla: "AMI",
    detalhe: "Exames laboratoriais e imagem",
    corDestaque: "#2563eb",
    fundoSuave: "rgb(37 99 235 / 0.12)",
    atrasoAnimacao: "0.2s",
    icone: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="4" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    ),
  },
  {
    nome: "IASEP",
    sigla: "IAS",
    detalhe: "Servidores públicos do Pará",
    corDestaque: "#0d9488",
    fundoSuave: "rgb(13 148 136 / 0.12)",
    atrasoAnimacao: "0.6s",
    icone: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18M5 21V7l7-4 7 4v14" />
        <path d="M9 21v-6h6v6" />
      </svg>
    ),
  },
  {
    nome: "Cassi / Petrobras",
    sigla: "EMP",
    detalhe: "Planos corporativos e caixas",
    corDestaque: "#1d4ed8",
    fundoSuave: "rgb(29 78 216 / 0.12)",
    atrasoAnimacao: "1s",
    icone: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
  },
  {
    nome: "Atendimento Particular",
    sigla: "PIX",
    detalhe: "Preço claro sem mensalidade",
    corDestaque: "var(--color-primary)",
    fundoSuave: "var(--color-primary-soft)",
    atrasoAnimacao: "1.4s",
    icone: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M14.5 9.5a2.5 2.5 0 0 0-5 0c0 2.5 5 2 5 4.5a2.5 2.5 0 0 1-5 0M12 6.5v11" />
      </svg>
    ),
  },
];

/**
 * Seção de Planos e Convênios com layout assimétrico inspirado no BoaConsulta
 * e ícones grandes com flutuação contínua e reação interativa ao hover/toque.
 */
export default function SecaoConvenios() {
  const [convenioSelecionado, setConvenioSelecionado] = useState("");
  const [convenios, setConvenios] = useState([]);
  const [erro, setErro] = useState("");
  const navegar = useNavigate();

  useEffect(() => {
    let ativo = true;
    apiRequest("/api/convenios")
      .then((resposta) => {
        if (ativo) setConvenios(resposta.convenios ?? []);
      })
      .catch((falha) => {
        if (ativo) setErro(falha.message || "Não foi possível carregar os convênios.");
      });
    return () => { ativo = false; };
  }, []);

  function filtrarPorConvenio(convenio) {
    navegar(`/busca?convenioId=${encodeURIComponent(convenio.id)}`);
  }

  function aoEnviarConvenio(evento) {
    evento.preventDefault();
    if (convenioSelecionado) navegar(`/busca?convenioId=${encodeURIComponent(convenioSelecionado)}`);
  }

  return (
    <Box
      id="convenios"
      scrollMarginTop="var(--header-offset)"
      mt={{ base: "var(--space-16)", md: "var(--space-16)" }}
      py={{ base: "var(--space-12)", md: "var(--space-16)" }}
      bg="var(--color-surface)"
      borderTop="var(--border-width) solid var(--color-border-soft)"
      borderBottom="var(--border-width) solid var(--color-border-soft)"
      position="relative"
      overflow="hidden"
      className="revelar-secao"
    >
      {/* Animações exclusivas dos ícones dos convênios */}
      <style>{`
        @keyframes flutuarEmblemaConvenio {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-5px) rotate(-3deg);
          }
        }

        .emblema-convenio-animado {
          animation: flutuarEmblemaConvenio 3.6s ease-in-out infinite;
          transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 240ms ease;
        }

        .cartao-convenio:hover .emblema-convenio-animado,
        .cartao-convenio:focus-visible .emblema-convenio-animado {
          animation-play-state: paused;
          transform: scale(1.1) rotate(-5deg);
        }
      `}</style>

      {/* Forma orgânica decorativa suave ao fundo */}
      <Box
        position="absolute"
        top="calc(var(--space-16) * -1.5)"
        right="calc(var(--space-16) * -1.75)"
        w="var(--decor-lg)"
        h="var(--decor-lg)"
        borderRadius="44% 56% 62% 38% / 42% 45% 55% 58%"
        bg="var(--color-primary-soft)"
        opacity={0.55}
        pointerEvents="none"
        aria-hidden="true"
      />

      <Container maxW="var(--container-max)" px={{ base: "var(--space-4)", md: "var(--space-6)" }} position="relative">
        <Grid
          templateColumns={{ base: "1fr", lg: "0.82fr 1.18fr" }}
          gap={{ base: "var(--space-8)", lg: "var(--space-12)" }}
          alignItems="center"
        >
          {/* Coluna esquerda: Chamada editorial + Filtro de convênio */}
          <VStack align="flex-start" gap="var(--space-4)" minW="0">
            <Badge
              px="var(--space-3)"
              py="var(--space-1)"
              borderRadius="var(--radius-full)"
              bg="var(--color-primary-soft)"
              color="var(--color-primary)"
              fontFamily="var(--font-heading)"
              fontWeight="var(--weight-bold)"
              fontSize="var(--text-xs)"
            >
              Cobertura e transparência
            </Badge>

            <Heading
              as="h2"
              fontFamily="var(--font-heading)"
              fontWeight="var(--weight-bold)"
              fontSize={{ base: "var(--text-xl)", md: "var(--text-2xl)" }}
              lineHeight="var(--leading-tight)"
              color="var(--color-text)"
            >
              Planos e convênios{" "}
              <Box as="span" color="var(--color-text-highlight)">
                aceitos na rede
              </Box>
            </Heading>

            <Text
              fontFamily="var(--font-body)"
              fontSize="var(--text-xs)"
              lineHeight="var(--leading-normal)"
              color="var(--color-text-muted)"
            >
              Consulte as ofertas cadastradas e filtre os resultados pelo convênio escolhido.
            </Text>

            {/* Filtro por convênio selecionado no cadastro oficial da API */}
            <Box as="form" onSubmit={aoEnviarConvenio} w="100%" maxW="var(--width-text)" pt="var(--space-1)">
              <Flex
                align="center"
                bg="var(--color-bg)"
                border="1.5px solid var(--color-border-soft)"
                borderRadius="var(--radius-lg)"
                p="var(--space-2)"
                _focusWithin={{
                  borderColor: "var(--color-primary)",
                  boxShadow: "0 0 0 3px var(--color-primary-soft)",
                }}
              >
                <Box
                  as="select"
                  value={convenioSelecionado}
                  onChange={(evento) => setConvenioSelecionado(evento.target.value)}
                  aria-label="Selecione seu convênio"
                  border="none"
                  bg="transparent"
                  color="var(--color-text)"
                  fontFamily="var(--font-body)"
                  fontSize="var(--text-xs)"
                  minH="var(--touch-target-min)"
                  minW="0"
                  flex="1"
                  _focusVisible={{ boxShadow: "none", outline: "none" }}
                >
                  <option value="">Selecione um convênio</option>
                  {convenios.map((convenio) => <option key={convenio.id} value={convenio.id}>{convenio.nome}</option>)}
                </Box>
                <Button
                  type="submit"
                  bg="var(--color-primary)"
                  _hover={{ bg: "var(--color-primary-hover)" }}
                  color="var(--color-text-on-primary)"
                  fontFamily="var(--font-heading)"
                  fontWeight="var(--weight-bold)"
                  fontSize="var(--text-xs)"
                  minH="var(--touch-target-min)"
                  px="var(--space-6)"
                  borderRadius="var(--radius-md)"
                  flexShrink={0}
                >
                  Ver clínicas
                </Button>
              </Flex>
            </Box>

            <Text fontFamily="var(--font-body)" fontSize="var(--text-xs)" color="var(--color-text-muted)">
              {erro || "A disponibilidade depende das ofertas publicadas por cada clínica."}
            </Text>
          </VStack>

          {/* Coluna direita: Mosaico desalinhado (staggered) com ícones grandes animados */}
          <SimpleGrid
            columns={{ base: 1, sm: 2 }}
            gap={{ base: "var(--space-4)", md: "var(--space-4)" }}
            pb={{ lg: "var(--space-6)" }}
          >
            {convenios.map((convenio, indice) => {
              const estilo = ESTILOS_CONVENIOS[indice % ESTILOS_CONVENIOS.length];
              // Desloca os cards da coluna direita no desktop para quebrar a linha reta
              const deslocadoVerticalmente = indice % 2 === 1;

              return (
                <Flex
                  key={convenio.id}
                  as="button"
                  type="button"
                  onClick={() => filtrarPorConvenio(convenio)}
                  className="cartao-convenio"
                  align="center"
                  gap="var(--space-4)"
                  p="var(--space-4)"
                  minH="var(--space-16)"
                  w="100%"
                  minW="0"
                  textAlign="left"
                  bg="var(--color-bg)"
                  border="var(--border-width) solid var(--color-border-soft)"
                  borderRadius="var(--radius-lg)"
                  boxShadow="var(--shadow-sm)"
                  cursor="pointer"
                  transform={{
                    base: "none",
                    lg: deslocadoVerticalmente ? "translateY(18px)" : "translateY(0px)",
                  }}
                  transition="border-color 220ms ease, box-shadow 220ms ease, background-color 220ms ease"
                  _hover={{
                    borderColor: "var(--color-primary)",
                    boxShadow: "var(--shadow-md)",
                  }}
                >
                  {/* Ícone grande com flutuação própria */}
                  <Flex
                    className="emblema-convenio-animado"
                    direction="column"
                    align="center"
                    justify="center"
                    boxSize="var(--space-16)"
                    borderRadius="var(--radius-lg)"
                    bg={estilo.fundoSuave}
                    color={estilo.corDestaque}
                    border="var(--border-width) solid"
                    borderColor="var(--color-border-soft)"
                    flexShrink={0}
                    style={{ animationDelay: estilo.atrasoAnimacao }}
                  >
                    {estilo.icone}
                    <Text
                      fontFamily="var(--font-heading)"
                      fontWeight="var(--weight-bold)"
                      fontSize="var(--text-xs)"
                      letterSpacing="var(--tracking-wide)"
                      mt="var(--space-1)"
                    >
                      {(convenio.nome ?? "").slice(0, 3).toUpperCase()}
                    </Text>
                  </Flex>

                  <Box minW="0" flex="1">
                    <Text
                      fontFamily="var(--font-heading)"
                      fontWeight="var(--weight-bold)"
                      fontSize="var(--text-sm)"
                      color="var(--color-text)"
                      truncate
                    >
                      {convenio.nome}
                    </Text>
                    <Text
                      fontFamily="var(--font-body)"
                      fontSize="var(--text-xs)"
                      color="var(--color-text-muted)"
                      mt="var(--space-1)"
                      lineHeight="1.35"
                    >
                      {convenio.descricao || "Convênio cadastrado"}
                    </Text>
                  </Box>
                </Flex>
              );
            })}
            {convenios.length === 0 && !erro && (
              <Text color="var(--color-text-muted)" role="status">Carregando convênios disponíveis...</Text>
            )}
          </SimpleGrid>
        </Grid>
      </Container>
    </Box>
  );
}
