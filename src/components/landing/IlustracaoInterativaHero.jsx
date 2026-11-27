import { useState } from "react";
import { Badge, Box, Flex, HStack, Text, VStack } from "@chakra-ui/react";

const CENARIOS_INTERATIVOS = [
  {
    id: "preco",
    aba: "Preços",
    exame: "Ofertas de exames",
    clinica: "Valores publicados pelas clínicas",
    distancia: "Ordene por menor preço",
    valor: "Consultar",
    selo: "Filtro por preço",
    corSeloBg: "var(--color-success-soft)",
    corSeloTexto: "var(--color-success)",
    observacao: "Compare os valores disponíveis para o exame selecionado.",
  },
  {
    id: "convenio",
    aba: "Convênio",
    exame: "Ofertas por convênio",
    clinica: "Planos cadastrados pelas clínicas",
    distancia: "Filtre pelo seu plano",
    valor: "Consultar",
    selo: "Filtro por convênio",
    corSeloBg: "var(--color-primary-soft)",
    corSeloTexto: "var(--color-primary)",
    observacao: "A cobertura deve ser confirmada diretamente com a unidade.",
  },
  {
    id: "mapa",
    aba: "Mapa",
    exame: "Clínicas próximas",
    clinica: "Resultados com endereço e localização",
    distancia: "Busca por endereço ou GPS",
    valor: "Explorar",
    selo: "Mapa interativo",
    corSeloBg: "var(--color-accent-soft)",
    corSeloTexto: "var(--color-accent)",
    observacao: "Informe sua localização para encontrar ofertas na região.",
  },
];

/**
 * Vitrine ilustrativa interativa para apresentar filtros e localização.
 */
export default function IlustracaoInterativaHero() {
  const [indiceAtivo, setIndiceAtivo] = useState(0);
  const [deslocamento, setDeslocamento] = useState({ x: 0, y: 0 });

  function lidarComMovimentoPonteiro(evento) {
    const retangulo = evento.currentTarget.getBoundingClientRect();
    const relX = (evento.clientX - retangulo.left) / retangulo.width - 0.5;
    const relY = (evento.clientY - retangulo.top) / retangulo.height - 0.5;
    setDeslocamento({ x: relX * 14, y: relY * 14 });
  }

  function resetarPonteiro() {
    setDeslocamento({ x: 0, y: 0 });
  }

  const cenario = CENARIOS_INTERATIVOS[indiceAtivo];

  return (
    <Box
      position="relative"
      w="100%"
      maxW={{ base: "100%", sm: "var(--width-text)", lg: "var(--width-text)" }}
      mx="auto"
      py={{ base: "var(--space-4)", md: "var(--space-6)" }}
      px={{ base: "var(--space-2)", sm: "var(--space-4)" }}
      onMouseMove={lidarComMovimentoPonteiro}
      onMouseLeave={resetarPonteiro}
    >
      {/* Fundo geométrico orbital animado (estilo SVGator) */}
      <Box
        position="absolute"
        inset="0"
        display="flex"
        alignItems="center"
        justifyContent="center"
        pointerEvents="none"
        aria-hidden="true"
        overflow="hidden"
      >
        <svg viewBox="0 0 440 440" width="100%" height="100%">
          <g className="forma-orbita-lenta">
            <circle
              cx="220"
              cy="220"
              r="195"
              fill="none"
              stroke="var(--color-primary)"
              strokeOpacity="0.22"
              strokeWidth="2"
              strokeDasharray="10 10"
            />
          </g>
          <g className="forma-orbita-reversa">
            <circle
              cx="220"
              cy="220"
              r="150"
              fill="none"
              stroke="var(--color-accent)"
              strokeOpacity="0.22"
              strokeWidth="2"
              strokeDasharray="6 12"
            />
          </g>
        </svg>
      </Box>

      {/* Formas geométricas flutuantes nos cantos */}
      <Box
        position="absolute"
        top="var(--space-3)"
        left={{ base: "var(--space-2)", sm: "var(--space-4)" }}
        boxSize="var(--icon-md)"
        borderRadius="var(--radius-md)"
        bg="var(--color-accent)"
        opacity="0.85"
        transform={`rotate(18deg) translate(${deslocamento.x * -0.6}px, ${deslocamento.y * -0.6}px)`}
        transition="transform 180ms ease-out"
        pointerEvents="none"
        aria-hidden="true"
      />
      <Box
        position="absolute"
        bottom="var(--space-3)"
        right={{ base: "var(--space-3)", sm: "var(--space-6)" }}
        boxSize="var(--icon-lg)"
        borderRadius="var(--radius-full)"
        bg="var(--color-primary)"
        opacity="0.8"
        className="forma-pulso"
        pointerEvents="none"
        aria-hidden="true"
      />

      {/* Cartão de Produto Real (HTML + Flexbox limpo, sem texto sobreposto) */}
      <Box
        position="relative"
        zIndex={1}
        className="landing-cartao"
        bg="var(--color-surface)"
        border="var(--border-width) solid var(--color-border-soft)"
        borderRadius="var(--radius-lg)"
        boxShadow="var(--shadow-lg)"
        p={{ base: "var(--space-4)", sm: "var(--space-6)" }}
        transform={`translate(${deslocamento.x * 0.4}px, ${deslocamento.y * 0.4}px)`}
        transition="transform 180ms ease-out"
      >
        {/* Cabeçalho do cartão */}
        <Flex align="center" justify="space-between" gap="var(--space-2)" mb="var(--space-4)">
          <HStack gap="var(--space-2)">
            <Flex
              align="center"
              justify="center"
              boxSize="var(--icon-md)"
              borderRadius="var(--radius-md)"
              bg="var(--color-primary)"
              color="var(--color-text-on-primary)"
              flexShrink={0}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </Flex>
            <Box>
              <Text
                fontFamily="var(--font-heading)"
                fontWeight="var(--weight-bold)"
                fontSize="var(--text-xs)"
                color="var(--color-text)"
              >
                Prévia da experiência
              </Text>
              <Text
                fontFamily="var(--font-body)"
                fontSize="var(--text-xs)"
                color="var(--color-text-muted)"
              >
                {cenario.distancia}
              </Text>
            </Box>
          </HStack>

          <Badge
            bg={cenario.corSeloBg}
            color={cenario.corSeloTexto}
            px="var(--space-3)"
            py="var(--space-1)"
            borderRadius="var(--radius-full)"
            fontFamily="var(--font-heading)"
            fontWeight="var(--weight-bold)"
            fontSize="var(--text-xs)"
          >
            {cenario.selo}
          </Badge>
        </Flex>

        {/* Detalhes do exame selecionado */}
        <Box
          key={cenario.id}
          className="cenario-entrada"
          p="var(--space-4)"
          borderRadius="var(--radius-md)"
          bg="var(--color-bg)"
          border="var(--border-width) solid var(--color-border-soft)"
          mb="var(--space-4)"
        >
          <Flex
            direction={{ base: "column", sm: "row" }}
            justify="space-between"
            align={{ base: "flex-start", sm: "center" }}
            gap="var(--space-2)"
            mb="var(--space-2)"
          >
            <Box>
              <Text
                fontFamily="var(--font-heading)"
                fontWeight="var(--weight-bold)"
                fontSize="var(--text-sm)"
                color="var(--color-text)"
              >
                {cenario.exame}
              </Text>
              <Text
                fontFamily="var(--font-body)"
                fontSize="var(--text-xs)"
                color="var(--color-text-muted)"
              >
                {cenario.clinica}
              </Text>
            </Box>

            <Text
              fontFamily="var(--font-heading)"
              fontWeight="var(--weight-bold)"
              fontSize="var(--text-base)"
              color="var(--color-success)"
              flexShrink={0}
            >
              {cenario.valor}
            </Text>
          </Flex>

          <Text
            fontFamily="var(--font-body)"
            fontSize="var(--text-xs)"
            color="var(--color-text)"
            pt="var(--space-2)"
            borderTop="1px dashed var(--color-border-soft)"
          >
            {cenario.observacao}
          </Text>
        </Box>

        {/* Seletor interativo de cenários (100% responsivo, sem colisão) */}
        <VStack align="stretch" gap="var(--space-2)">
          <Text
            fontFamily="var(--font-body)"
            fontSize="var(--text-xs)"
            color="var(--color-text-muted)"
          >
            Alterne para ver como o Exame Já funciona:
          </Text>

          <Flex gap="var(--space-2)" wrap="wrap">
            {CENARIOS_INTERATIVOS.map((item, idx) => {
              const ativo = idx === indiceAtivo;
              return (
                <Box
                  key={item.id}
                  as="button"
                  type="button"
                  onClick={() => setIndiceAtivo(idx)}
                  aria-pressed={ativo}
                  flex="1"
                  minW="var(--space-16)"
                  minH="var(--touch-target-min)"
                  px="var(--space-3)"
                  py="var(--space-2)"
                  borderRadius="var(--radius-md)"
                  fontFamily="var(--font-heading)"
                  fontWeight="var(--weight-bold)"
                  fontSize="var(--text-xs)"
                  cursor="pointer"
                  border="var(--border-width) solid"
                  borderColor={ativo ? "var(--color-accent)" : "var(--color-border-soft)"}
                  bg={ativo ? "var(--color-accent)" : "var(--color-surface)"}
                  color={ativo ? "var(--color-text-on-accent)" : "var(--color-text)"}
                  transition="all var(--duration-fast) var(--ease-standard)"
                  _hover={{
                    borderColor: "var(--color-accent)",
                  }}
                >
                  {item.aba}
                </Box>
              );
            })}
          </Flex>
        </VStack>
      </Box>
    </Box>
  );
}
