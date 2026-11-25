import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Input,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
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
    termoBusca: "Unimed",
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
    termoBusca: "Bradesco Saúde",
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
    termoBusca: "Hapvida",
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
    termoBusca: "SulAmérica",
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
    termoBusca: "Amil",
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
    termoBusca: "IASEP",
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
    termoBusca: "Cassi",
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
    termoBusca: "Particular",
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
  const [planoDigitado, setPlanoDigitado] = useState("");
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

  function filtrarPorPlano(termo) {
    const limpo = termo.trim();
    if (!limpo) {
      navegar("/busca");
      return;
    }
    navegar(`/busca?q=${encodeURIComponent(limpo)}`);
  }

  function aoEnviarPlano(evento) {
    evento.preventDefault();
    filtrarPorPlano(planoDigitado);
  }

  return (
    <Box
      id="convenios"
      scrollMarginTop="90px"
      mt={{ base: 14, md: 22 }}
      py={{ base: 10, md: 16 }}
      bg="var(--color-surface)"
      borderTop="1px solid var(--color-border-soft)"
      borderBottom="1px solid var(--color-border-soft)"
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
        top="-90px"
        right="-110px"
        w="340px"
        h="340px"
        borderRadius="44% 56% 62% 38% / 42% 45% 55% 58%"
        bg="var(--color-primary-soft)"
        opacity={0.55}
        pointerEvents="none"
        aria-hidden="true"
      />

      <Container maxW="var(--container-max)" px={{ base: 4, md: 6 }} position="relative">
        <Grid
          templateColumns={{ base: "1fr", lg: "0.82fr 1.18fr" }}
          gap={{ base: 8, lg: 12 }}
          alignItems="center"
        >
          {/* Coluna esquerda: Chamada editorial + Filtro de convênio */}
          <VStack align="flex-start" gap={4} minW="0">
            <Badge
              px={3}
              py={1}
              borderRadius="var(--radius-full)"
              bg="var(--color-primary-soft)"
              color="var(--color-primary)"
              fontFamily="var(--font-heading)"
              fontWeight="var(--weight-bold)"
              fontSize="0.76rem"
            >
              Cobertura e transparência
            </Badge>

            <Heading
              as="h2"
              fontFamily="var(--font-heading)"
              fontWeight="var(--weight-bold)"
              fontSize={{ base: "1.55rem", md: "2rem" }}
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
              fontSize="0.86rem"
              lineHeight="var(--leading-normal)"
              color="var(--color-text-muted)"
            >
              Consulte as ofertas cadastradas e filtre os resultados pelo convênio escolhido.
            </Text>

            {/* Campo de busca de convênio */}
            <Box as="form" onSubmit={aoEnviarPlano} w="100%" maxW="420px" pt={1}>
              <Flex
                align="center"
                bg="var(--color-bg)"
                border="1.5px solid var(--color-border-soft)"
                borderRadius="var(--radius-lg)"
                p={1.5}
                _focusWithin={{
                  borderColor: "var(--color-primary)",
                  boxShadow: "0 0 0 3px var(--color-primary-soft)",
                }}
              >
                <Input
                  value={planoDigitado}
                  onChange={(e) => setPlanoDigitado(e.target.value)}
                  placeholder="Digite o nome do seu plano..."
                  aria-label="Pesquisar pelo nome do seu plano de saúde"
                  border="none"
                  bg="transparent"
                  color="var(--color-text)"
                  _placeholder={{ color: "var(--color-text-muted)" }}
                  fontFamily="var(--font-body)"
                  fontSize="0.9rem"
                  minH="42px"
                  _focusVisible={{ boxShadow: "none", outline: "none" }}
                />
                <Button
                  type="submit"
                  bg="var(--color-primary)"
                  _hover={{ bg: "var(--color-primary-hover)" }}
                  color="var(--color-text-on-primary)"
                  fontFamily="var(--font-heading)"
                  fontWeight="var(--weight-bold)"
                  fontSize="0.88rem"
                  minH="42px"
                  px={5}
                  borderRadius="var(--radius-md)"
                  flexShrink={0}
                >
                  Filtrar
                </Button>
              </Flex>
            </Box>

            <Text fontFamily="var(--font-body)" fontSize="0.76rem" color="var(--color-text-muted)">
              {erro || "A disponibilidade depende das ofertas publicadas por cada clínica."}
            </Text>
          </VStack>

          {/* Coluna direita: Mosaico desalinhado (staggered) com ícones grandes animados */}
          <SimpleGrid
            columns={{ base: 1, sm: 2 }}
            gap={{ base: 3.5, md: 4 }}
            pb={{ lg: 5 }}
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
                  gap={4}
                  p={4}
                  minH="88px"
                  w="100%"
                  minW="0"
                  textAlign="left"
                  bg="var(--color-bg)"
                  border="1px solid var(--color-border-soft)"
                  borderRadius="20px"
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
                    boxSize="64px"
                    borderRadius="18px"
                    bg={estilo.fundoSuave}
                    color={estilo.corDestaque}
                    border="1px solid"
                    borderColor="var(--color-border-soft)"
                    flexShrink={0}
                    style={{ animationDelay: estilo.atrasoAnimacao }}
                  >
                    {estilo.icone}
                    <Text
                      fontFamily="var(--font-heading)"
                      fontWeight="var(--weight-bold)"
                      fontSize="0.65rem"
                      letterSpacing="0.06em"
                      mt={0.5}
                    >
                      {(convenio.nome ?? "").slice(0, 3).toUpperCase()}
                    </Text>
                  </Flex>

                  <Box minW="0" flex="1">
                    <Text
                      fontFamily="var(--font-heading)"
                      fontWeight="var(--weight-bold)"
                      fontSize="1.05rem"
                      color="var(--color-text)"
                      truncate
                    >
                      {convenio.nome}
                    </Text>
                    <Text
                      fontFamily="var(--font-body)"
                      fontSize="0.75rem"
                      color="var(--color-text-muted)"
                      mt={0.5}
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
