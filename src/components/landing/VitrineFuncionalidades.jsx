import { useRef, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  HStack,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

/**
 * Slides do carrossel de funcionalidades do Exame Já.
 * Copy enxuta para leitura rápida no celular e no desktop.
 */
const SLIDES_FUNCIONALIDADES = [
  {
    id: "busca-comparacao",
    etiqueta: "01 / 04 • Descoberta",
    rotuloCurto: "Busca & Comparação",
    tituloPilar: "Busque pelo convênio e compare clínicas lado a lado",
    recursos: [
      {
        titulo: "Busca por exame, especialidade e convênio",
        descricao:
          "Pesquise o exame e veja na hora quais planos de saúde cada unidade aceita.",
      },
      {
        titulo: "Filtros inteligentes de resultados",
        descricao:
          "Ordene por menor preço, proximidade, convênio ou atendimento particular.",
      },
      {
        titulo: "Comparador de locais",
        descricao:
          "Compare valores, prazos de laudo e avaliações antes de escolher.",
      },
    ],
  },
  {
    id: "clinica-mapa",
    etiqueta: "02 / 04 • Localização",
    rotuloCurto: "Clínicas & Maps",
    tituloPilar: "Veja detalhes da clínica e trace a rota no mapa",
    recursos: [
      {
        titulo: "Perfil completo do estabelecimento",
        descricao:
          "Consulte endereço, preços, planos aceitos, horários e avaliações reais.",
      },
      {
        titulo: "Mapa interativo com Google Maps",
        descricao:
          "Veja as unidades próximas no mapa e abra a rota até a clínica escolhida.",
      },
    ],
  },
  {
    id: "agendamento-comunicacao",
    etiqueta: "03 / 04 • Atendimento",
    rotuloCurto: "Agenda, Chat & Alertas",
    tituloPilar: "Agende online, fale no chat e receba avisos de preparo",
    recursos: [
      {
        titulo: "Solicitação e agendamento online",
        descricao:
          "Escolha data e turno disponíveis sem precisar ligar ou enfrentar filas.",
      },
      {
        titulo: "Chat direto com clínicas e laboratórios",
        descricao:
          "Tire dúvidas sobre pedidos médicos e cobertura direto com a recepção.",
      },
      {
        titulo: "Lembretes de jejum e avisos por e-mail",
        descricao:
          "Receba alertas automáticos de preparo no celular e confirmações por e-mail.",
      },
    ],
  },
  {
    id: "historico-acessibilidade",
    etiqueta: "04 / 04 • Cuidado contínuo",
    rotuloCurto: "Histórico & 60+",
    tituloPilar: "Histórico organizado e leitura facilitada para todos",
    recursos: [
      {
        titulo: "Histórico de exames e locais",
        descricao:
          "Consulte todos os exames já feitos, datas e em qual laboratório foram realizados.",
      },
      {
        titulo: "Personalização e modo acessível (60+)",
        descricao:
          "Interface adaptada com fontes ampliadas e navegação simples para usuários mais velhos.",
      },
    ],
  },
];

/**
 * Carrossel interativo controlado pelo usuário (setas, pílulas, indicadores e swipe).
 */
export default function VitrineFuncionalidades() {
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [modoAcessivelAtivo, setModoAcessivelAtivo] = useState(false);
  const toqueInicialX = useRef(null);

  const totalSlides = SLIDES_FUNCIONALIDADES.length;
  const slideAtivo = SLIDES_FUNCIONALIDADES[indiceAtual];

  function irParaAnterior() {
    setIndiceAtual((anterior) => (anterior - 1 + totalSlides) % totalSlides);
  }

  function irParaProximo() {
    setIndiceAtual((anterior) => (anterior + 1) % totalSlides);
  }

  function aoIniciarToque(evento) {
    toqueInicialX.current = evento.touches[0].clientX;
  }

  function aoFinalizarToque(evento) {
    if (toqueInicialX.current === null) return;
    const diferenca = toqueInicialX.current - evento.changedTouches[0].clientX;
    if (diferenca > 45) irParaProximo();
    if (diferenca < -45) irParaAnterior();
    toqueInicialX.current = null;
  }

  return (
    <Container
      id="recursos-plataforma"
      scrollMarginTop="90px"
      maxW="var(--container-max)"
      px={{ base: 4, md: 6 }}
      mt={{ base: 14, md: 20 }}
      className="revelar-secao"
    >
      {/* Cabeçalho + Setas */}
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "flex-start", md: "flex-end" }}
        gap={4}
        mb={5}
      >
        <Box>
          <Badge
            mb={2}
            px={3}
            py={1}
            borderRadius="var(--radius-full)"
            bg="var(--color-primary-soft)"
            color="var(--color-primary)"
            fontFamily="var(--font-heading)"
            fontWeight="var(--weight-bold)"
            fontSize="0.76rem"
          >
            Tudo em um só lugar
          </Badge>

          <Heading
            as="h2"
            fontFamily="var(--font-heading)"
            fontWeight="var(--weight-bold)"
            fontSize={{ base: "1.45rem", md: "1.8rem" }}
            color="var(--color-text)"
          >
            O que você resolve no Exame Já
          </Heading>
        </Box>

        <HStack gap={2.5} alignSelf={{ base: "flex-end", md: "auto" }}>
          <Text
            fontFamily="var(--font-body)"
            fontSize="0.76rem"
            color="var(--color-text-muted)"
            mr={1}
          >
            {indiceAtual + 1} de {totalSlides}
          </Text>

          <Box
            as="button"
            type="button"
            onClick={irParaAnterior}
            aria-label="Slide anterior"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            boxSize="42px"
            borderRadius="var(--radius-full)"
            bg="var(--color-surface)"
            border="1px solid var(--color-border-soft)"
            color="var(--color-text)"
            cursor="pointer"
            transition="all var(--duration-fast)"
            _hover={{
              borderColor: "var(--color-primary)",
              color: "var(--color-primary)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Box>

          <Box
            as="button"
            type="button"
            onClick={irParaProximo}
            aria-label="Próximo slide"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            boxSize="42px"
            borderRadius="var(--radius-full)"
            bg="var(--color-primary)"
            color="var(--color-text-on-primary)"
            cursor="pointer"
            boxShadow="var(--shadow-sm)"
            transition="all var(--duration-fast)"
            _hover={{ bg: "var(--color-primary-hover)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Box>
        </HStack>
      </Flex>

      {/* Pílulas de acesso direto */}
      <Flex gap={2} wrap="wrap" mb={5} role="tablist" aria-label="Pilares da plataforma">
        {SLIDES_FUNCIONALIDADES.map((slide, idx) => {
          const ativo = idx === indiceAtual;
          return (
            <Box
              key={slide.id}
              as="button"
              type="button"
              role="tab"
              aria-selected={ativo}
              onClick={() => setIndiceAtual(idx)}
              px={3.5}
              py={2}
              minH="38px"
              borderRadius="var(--radius-full)"
              fontFamily="var(--font-heading)"
              fontWeight="var(--weight-bold)"
              fontSize="0.82rem"
              cursor="pointer"
              border="1px solid"
              borderColor={ativo ? "var(--color-primary)" : "var(--color-border-soft)"}
              bg={ativo ? "var(--color-primary)" : "var(--color-surface)"}
              color={ativo ? "var(--color-text-on-primary)" : "var(--color-text-muted)"}
              transition="all var(--duration-fast)"
            >
              {slide.rotuloCurto}
            </Box>
          );
        })}
      </Flex>

      {/* Container do Carrossel */}
      <Box
        onTouchStart={aoIniciarToque}
        onTouchEnd={aoFinalizarToque}
        p={{ base: 5, md: 8 }}
        bg="var(--color-surface)"
        border="1px solid var(--color-border-soft)"
        borderRadius="var(--radius-lg)"
        boxShadow="var(--shadow-md)"
        overflow="hidden"
      >
        <Grid
          key={slideAtivo.id}
          className="slide-carrossel-ativo"
          templateColumns={{ base: "1fr", lg: "1fr 1.05fr" }}
          gap={{ base: 6, lg: 8 }}
          alignItems="center"
        >
          {/* Coluna de texto enxuto */}
          <VStack align="stretch" gap={4} minW="0">
            <Box>
              <Text
                fontFamily="var(--font-heading)"
                fontWeight="var(--weight-bold)"
                fontSize="0.78rem"
                color="var(--color-text-highlight)"
                letterSpacing="0.04em"
                mb={1}
              >
                {slideAtivo.etiqueta}
              </Text>
              <Heading
                as="h3"
                fontFamily="var(--font-heading)"
                fontWeight="var(--weight-bold)"
                fontSize={{ base: "1.2rem", md: "1.45rem" }}
                color="var(--color-text)"
              >
                {slideAtivo.tituloPilar}
              </Heading>
            </Box>

            {slideAtivo.recursos.map((recurso, idx) => (
              <Flex key={recurso.titulo} align="flex-start" gap={3} minW="0">
                <Flex
                  align="center"
                  justify="center"
                  boxSize="26px"
                  borderRadius="var(--radius-full)"
                  bg="var(--color-primary-soft)"
                  color="var(--color-primary)"
                  fontFamily="var(--font-heading)"
                  fontWeight="var(--weight-bold)"
                  fontSize="0.8rem"
                  flexShrink={0}
                  mt={0.5}
                >
                  {idx + 1}
                </Flex>
                <Box minW="0">
                  <Text
                    fontFamily="var(--font-heading)"
                    fontWeight="var(--weight-bold)"
                    fontSize="0.98rem"
                    color="var(--color-text)"
                    mb={0.5}
                  >
                    {recurso.titulo}
                  </Text>
                  <Text
                    fontFamily="var(--font-body)"
                    fontSize="0.78rem"
                    lineHeight="var(--leading-normal)"
                    color="var(--color-text-muted)"
                  >
                    {recurso.descricao}
                  </Text>
                </Box>
              </Flex>
            ))}

            <Box pt={1}>
              <Button
                asChild
                bg="var(--color-primary)"
                _hover={{ bg: "var(--color-primary-hover)" }}
                color="var(--color-text-on-primary)"
                fontFamily="var(--font-heading)"
                fontWeight="var(--weight-bold)"
                fontSize="0.9rem"
                px={5}
                minH="44px"
                borderRadius="var(--radius-md)"
              >
                <RouterLink to="/busca">Testar na busca agora →</RouterLink>
              </Button>
            </Box>
          </VStack>

          {/* Coluna de prévia interativa */}
          <Box
            minW="0"
            p={{ base: 4, md: 5 }}
            bg="var(--color-bg)"
            border="1px solid var(--color-border-soft)"
            borderRadius="var(--radius-lg)"
          >
            {slideAtivo.id === "busca-comparacao" && (
              <VStack align="stretch" gap={3.5}>
                <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                  <Text fontFamily="var(--font-heading)" fontWeight="var(--weight-bold)" fontSize="0.9rem" color="var(--color-text)">
                    Comparação: Ressonância Magnética
                  </Text>
                  <HStack gap={1.5}>
                    <Badge bg="var(--color-primary-soft)" color="var(--color-primary)">Unimed</Badge>
                    <Badge bg="var(--color-success-soft)" color="var(--color-success)">Menor preço</Badge>
                  </HStack>
                </Flex>

                <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
                  <Box p={3.5} bg="var(--color-surface)" border="2px solid var(--color-primary)" borderRadius="var(--radius-md)">
                    <Badge mb={2} bg="var(--color-success-soft)" color="var(--color-success)" fontSize="0.68rem">
                      Melhor custo-benefício
                    </Badge>
                    <Text fontFamily="var(--font-heading)" fontWeight="var(--weight-bold)" fontSize="0.94rem" color="var(--color-text)">
                      Imagem Belém Centro
                    </Text>
                    <Text fontSize="0.72rem" color="var(--color-text-muted)" mb={2}>
                      1,2 km • ★ 4.9
                    </Text>
                    <Text fontFamily="var(--font-heading)" fontWeight="var(--weight-bold)" fontSize="1.08rem" color="var(--color-success)">
                      R$ 380,00
                    </Text>
                  </Box>

                  <Box p={3.5} bg="var(--color-surface)" border="1px solid var(--color-border-soft)" borderRadius="var(--radius-md)">
                    <Badge mb={2} bg="var(--color-primary-soft)" color="var(--color-primary)" fontSize="0.68rem">
                      Laudo em 24h
                    </Badge>
                    <Text fontFamily="var(--font-heading)" fontWeight="var(--weight-bold)" fontSize="0.94rem" color="var(--color-text)">
                      Diagnóstica Nazaré
                    </Text>
                    <Text fontSize="0.72rem" color="var(--color-text-muted)" mb={2}>
                      2,5 km • ★ 4.8
                    </Text>
                    <Text fontFamily="var(--font-heading)" fontWeight="var(--weight-bold)" fontSize="1.08rem" color="var(--color-text)">
                      R$ 430,00
                    </Text>
                  </Box>
                </SimpleGrid>
              </VStack>
            )}

            {slideAtivo.id === "clinica-mapa" && (
              <VStack align="stretch" gap={3.5}>
                <Flex justify="space-between" align="center" gap={2}>
                  <Box>
                    <Text fontFamily="var(--font-heading)" fontWeight="var(--weight-bold)" fontSize="0.95rem" color="var(--color-text)">
                      LabVida • Unidade Umarizal
                    </Text>
                    <Text fontSize="0.72rem" color="var(--color-text-muted)">
                      Av. Alcindo Cacela, 1420 — Belém
                    </Text>
                  </Box>
                  <Badge bg="var(--color-success-soft)" color="var(--color-success)">★ 4.9</Badge>
                </Flex>

                <Box position="relative" h="125px" borderRadius="var(--radius-md)" bg="var(--color-primary-soft)" border="1px solid var(--color-border-soft)" overflow="hidden" p={3}>
                  <svg width="100%" height="100%" viewBox="0 0 360 110" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M0 30 L360 75 M90 0 L140 110 M240 0 L210 110 M0 85 L360 20" stroke="var(--color-primary)" strokeOpacity="0.25" strokeWidth="6" fill="none" />
                  </svg>

                  <Flex position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" align="center" gap={2} px={3.5} py={2} bg="var(--color-surface)" border="2px solid var(--color-primary)" borderRadius="var(--radius-full)" boxShadow="var(--shadow-md)">
                    <Box boxSize="10px" borderRadius="full" bg="var(--color-accent)" className="forma-pulso" />
                    <Text fontFamily="var(--font-heading)" fontWeight="var(--weight-bold)" fontSize="0.76rem" color="var(--color-text)">
                      Google Maps • 1,4 km (6 min)
                    </Text>
                  </Flex>
                </Box>

                <Flex wrap="wrap" gap={2}>
                  {["Unimed", "Bradesco", "Hapvida", "Particular: R$ 45"].map((plano) => (
                    <Badge key={plano} px={2.5} py={1} borderRadius="var(--radius-full)" bg="var(--color-surface)" border="1px solid var(--color-border-soft)" color="var(--color-text)" fontSize="0.7rem">
                      {plano}
                    </Badge>
                  ))}
                </Flex>
              </VStack>
            )}

            {slideAtivo.id === "agendamento-comunicacao" && (
              <VStack align="stretch" gap={3}>
                <Box p={3} bg="var(--color-surface)" borderLeft="4px solid var(--color-accent)" borderRadius="var(--radius-md)" border="1px solid var(--color-border-soft)">
                  <Text fontFamily="var(--font-heading)" fontWeight="var(--weight-bold)" fontSize="0.8rem" color="var(--color-accent)">
                    Lembrete de preparo + E-mail enviado
                  </Text>
                  <Text fontSize="0.73rem" color="var(--color-text)" mt={0.5}>
                    Exame de Glicemia amanhã às 07:30. Jejum de 8h a partir das 23:30.
                  </Text>
                </Box>

                <Box p={3.5} bg="var(--color-surface)" border="1px solid var(--color-border-soft)" borderRadius="var(--radius-md)">
                  <Text fontFamily="var(--font-heading)" fontWeight="var(--weight-bold)" fontSize="0.78rem" color="var(--color-text-muted)" mb={2}>
                    Chat direto • Clínica São Lucas
                  </Text>
                  <VStack align="stretch" gap={2} fontSize="0.73rem">
                    <Box alignSelf="flex-end" bg="var(--color-primary)" color="var(--color-text-on-primary)" px={3} py={1.5} borderRadius="var(--radius-md)" maxW="85%">
                      Posso apresentar o pedido médico em PDF no celular?
                    </Box>
                    <Box alignSelf="flex-start" bg="var(--color-bg)" color="var(--color-text)" border="1px solid var(--color-border-soft)" px={3} py={1.5} borderRadius="var(--radius-md)" maxW="85%">
                      Sim! Aceitamos o pedido digital direto na recepção.
                    </Box>
                  </VStack>
                </Box>
              </VStack>
            )}

            {slideAtivo.id === "historico-acessibilidade" && (
              <VStack align="stretch" gap={3}>
                <Flex align="center" justify="space-between" gap={2} p={3} bg="var(--color-surface)" border="1px solid var(--color-border-soft)" borderRadius="var(--radius-md)">
                  <Box>
                    <Text fontFamily="var(--font-heading)" fontWeight="var(--weight-bold)" fontSize="0.85rem" color="var(--color-text)">
                      Modo Leitura Facilitada (60+)
                    </Text>
                    <Text fontSize="0.7rem" color="var(--color-text-muted)">
                      Amplia fontes e botões
                    </Text>
                  </Box>

                  <Box
                    as="button"
                    type="button"
                    onClick={() => setModoAcessivelAtivo((ativo) => !ativo)}
                    px={3}
                    py={1.5}
                    minH="36px"
                    borderRadius="var(--radius-full)"
                    bg={modoAcessivelAtivo ? "var(--color-success)" : "var(--color-primary-soft)"}
                    color={modoAcessivelAtivo ? "#ffffff" : "var(--color-primary)"}
                    fontFamily="var(--font-heading)"
                    fontWeight="var(--weight-bold)"
                    fontSize="0.76rem"
                    cursor="pointer"
                  >
                    {modoAcessivelAtivo ? "Ativado ✓" : "Testar"}
                  </Box>
                </Flex>

                <Box p={3.5} bg="var(--color-surface)" border="1px solid var(--color-border-soft)" borderRadius="var(--radius-md)">
                  <Text fontFamily="var(--font-heading)" fontWeight="var(--weight-bold)" fontSize={modoAcessivelAtivo ? "1.02rem" : "0.84rem"} color="var(--color-text)" mb={2} transition="font-size 150ms ease">
                    Histórico de Exames
                  </Text>

                  <VStack align="stretch" gap={2}>
                    <Box p={2.5} bg="var(--color-bg)" borderRadius="var(--radius-md)" border="1px solid var(--color-border-soft)">
                      <Text fontFamily="var(--font-heading)" fontWeight="var(--weight-bold)" fontSize={modoAcessivelAtivo ? "1rem" : "0.82rem"} color="var(--color-text)">
                        Hemograma + Glicemia
                      </Text>
                      <Text fontSize={modoAcessivelAtivo ? "0.86rem" : "0.7rem"} color="var(--color-text-muted)">
                        14/10/2026 • LabVida Umarizal
                      </Text>
                    </Box>

                    <Box p={2.5} bg="var(--color-bg)" borderRadius="var(--radius-md)" border="1px solid var(--color-border-soft)">
                      <Text fontFamily="var(--font-heading)" fontWeight="var(--weight-bold)" fontSize={modoAcessivelAtivo ? "1rem" : "0.82rem"} color="var(--color-text)">
                        Eletrocardiograma (ECG)
                      </Text>
                      <Text fontSize={modoAcessivelAtivo ? "0.86rem" : "0.7rem"} color="var(--color-text-muted)">
                        02/08/2026 • CardioCenter Belém
                      </Text>
                    </Box>
                  </VStack>
                </Box>
              </VStack>
            )}
          </Box>
        </Grid>

        {/* Indicadores inferiores */}
        <Flex justify="center" align="center" gap={2} mt={5} pt={4} borderTop="1px solid var(--color-border-soft)">
          {SLIDES_FUNCIONALIDADES.map((slide, idx) => {
            const ativo = idx === indiceAtual;
            return (
              <Box
                key={slide.id}
                as="button"
                type="button"
                onClick={() => setIndiceAtual(idx)}
                aria-label={`Ir para slide ${idx + 1}: ${slide.rotuloCurto}`}
                h="9px"
                w={ativo ? "28px" : "9px"}
                borderRadius="var(--radius-full)"
                bg={ativo ? "var(--color-primary)" : "var(--color-border-soft)"}
                transition="all 220ms var(--ease-standard)"
                cursor="pointer"
              />
            );
          })}
        </Flex>
      </Box>
    </Container>
  );
}