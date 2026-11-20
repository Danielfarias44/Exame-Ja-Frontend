import { useState } from "react";
import { Badge, Box, Flex, HStack, Text, VStack } from "@chakra-ui/react";

const CENARIOS_INTERATIVOS = [
  {
    id: "preco",
    aba: "Preço claro",
    exame: "Hemograma Completo",
    clinica: "LabVida Diagnósticos • Umarizal",
    distancia: "1,4 km de você",
    valor: "R$ 45,00",
    selo: "Menor preço da região",
    corSeloBg: "var(--color-success-soft)",
    corSeloTexto: "var(--color-success)",
    observacao: "Resultado digital no mesmo dia às 17h",
  },
  {
    id: "convenio",
    aba: "Convênio",
    exame: "Ultrassonografia Abdominal",
    clinica: "Centro Médico Nazaré • Belém",
    distancia: "2,1 km de você",
    valor: "Coberto (Unimed)",
    selo: "Aceita seu plano",
    corSeloBg: "var(--color-primary-soft)",
    corSeloTexto: "var(--color-primary)",
    observacao: "Horários disponíveis amanhã a partir das 08:00",
  },
  {
    id: "preparo",
    aba: "Preparo",
    exame: "Glicemia e Colesterol Total",
    clinica: "Clínica São Lucas • Marco",
    distancia: "900 m de você",
    valor: "R$ 58,00",
    selo: "Alerta de jejum ativo",
    corSeloBg: "var(--color-accent-soft)",
    corSeloTexto: "var(--color-accent)",
    observacao: "Jejum obrigatório de 8 a 12 horas (água permitida)",
  },
];

/**
 * Vitrine interativa do Hero com formas geométricas orbitais
 * e simulação real de consulta de exame, preço, convênio e preparo.
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
      maxW={{ base: "100%", sm: "440px", lg: "470px" }}
      mx="auto"
      py={{ base: 4, md: 6 }}
      px={{ base: 2, sm: 4 }}
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
        top="12px"
        left={{ base: "8px", sm: "16px" }}
        boxSize="36px"
        borderRadius="10px"
        bg="var(--color-accent)"
        opacity="0.85"
        transform={`rotate(18deg) translate(${deslocamento.x * -0.6}px, ${deslocamento.y * -0.6}px)`}
        transition="transform 180ms ease-out"
        pointerEvents="none"
        aria-hidden="true"
      />
      <Box
        position="absolute"
        bottom="14px"
        right={{ base: "12px", sm: "22px" }}
        boxSize="42px"
        borderRadius="full"
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
        bg="var(--color-surface)"
        border="1px solid var(--color-border-soft)"
        borderRadius="var(--radius-lg)"
        boxShadow="var(--shadow-lg)"
        p={{ base: 4, sm: 5 }}
        transform={`translate(${deslocamento.x * 0.4}px, ${deslocamento.y * 0.4}px)`}
        transition="transform 180ms ease-out"
      >
        {/* Cabeçalho do cartão */}
        <Flex align="center" justify="space-between" gap={2} mb={4}>
          <HStack gap={2}>
            <Flex
              align="center"
              justify="center"
              boxSize="34px"
              borderRadius="var(--radius-md)"
              bg="var(--color-primary)"
              color="#ffffff"
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
                fontSize="0.88rem"
                color="var(--color-text)"
              >
                Simulação em tempo real
              </Text>
              <Text
                fontFamily="var(--font-body)"
                fontSize="0.72rem"
                color="var(--color-text-muted)"
              >
                {cenario.distancia}
              </Text>
            </Box>
          </HStack>

          <Badge
            bg={cenario.corSeloBg}
            color={cenario.corSeloTexto}
            px={2.5}
            py={1}
            borderRadius="var(--radius-full)"
            fontFamily="var(--font-heading)"
            fontWeight="var(--weight-bold)"
            fontSize="0.72rem"
          >
            {cenario.selo}
          </Badge>
        </Flex>

        {/* Detalhes do exame selecionado */}
        <Box
          p={4}
          borderRadius="var(--radius-md)"
          bg="var(--color-bg)"
          border="1px solid var(--color-border-soft)"
          mb={4}
        >
          <Flex
            direction={{ base: "column", sm: "row" }}
            justify="space-between"
            align={{ base: "flex-start", sm: "center" }}
            gap={2}
            mb={2}
          >
            <Box>
              <Text
                fontFamily="var(--font-heading)"
                fontWeight="var(--weight-bold)"
                fontSize="1.05rem"
                color="var(--color-text)"
              >
                {cenario.exame}
              </Text>
              <Text
                fontFamily="var(--font-body)"
                fontSize="0.76rem"
                color="var(--color-text-muted)"
              >
                {cenario.clinica}
              </Text>
            </Box>

            <Text
              fontFamily="var(--font-heading)"
              fontWeight="var(--weight-bold)"
              fontSize="1.15rem"
              color="var(--color-success)"
              flexShrink={0}
            >
              {cenario.valor}
            </Text>
          </Flex>

          <Text
            fontFamily="var(--font-body)"
            fontSize="0.75rem"
            color="var(--color-text)"
            pt={2}
            borderTop="1px dashed var(--color-border-soft)"
          >
            {cenario.observacao}
          </Text>
        </Box>

        {/* Seletor interativo de cenários (100% responsivo, sem colisão) */}
        <VStack align="stretch" gap={2}>
          <Text
            fontFamily="var(--font-body)"
            fontSize="0.7rem"
            color="var(--color-text-muted)"
          >
            Alterne para ver como o Exame Já funciona:
          </Text>

          <Flex gap={2} wrap="wrap">
            {CENARIOS_INTERATIVOS.map((item, idx) => {
              const ativo = idx === indiceAtivo;
              return (
                <Box
                  key={item.id}
                  as="button"
                  type="button"
                  onClick={() => setIndiceAtivo(idx)}
                  flex="1"
                  minW="92px"
                  minH="40px"
                  px={3}
                  py={1.5}
                  borderRadius="var(--radius-md)"
                  fontFamily="var(--font-heading)"
                  fontWeight="var(--weight-bold)"
                  fontSize="0.82rem"
                  cursor="pointer"
                  border="1px solid"
                  borderColor={ativo ? "var(--color-accent)" : "var(--color-border-soft)"}
                  bg={ativo ? "var(--color-accent)" : "var(--color-surface)"}
                  color={ativo ? "#ffffff" : "var(--color-text)"}
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