import { useEffect, useRef, useState } from "react";
import { Box, Container, Flex, Heading, HStack, Text } from "@chakra-ui/react";

/**
 * Relatos de pacientes sobre agilidade, transparência e lembretes de preparo.
 */
const DEPOIMENTOS_PACIENTES = [
  {
    id: 1,
    texto:
      "Marquei meus exames muito mais rápido do que antes, sabendo exatamente quanto ia pagar.",
    autor: "Renata A.",
    contexto: "Hemograma e Raio-X • Belém",
  },
  {
    id: 2,
    texto:
      "Vi o preço do exame antes de sair de casa. Nada de chegar lá e descobrir outro valor na recepção.",
    autor: "Marcos T.",
    contexto: "Ressonância Magnética • Umarizal",
  },
  {
    id: 3,
    texto:
      "O lembrete de jejum me salvou — quase esquecia que precisava chegar em jejum às 7h da manhã.",
    autor: "Juliana S.",
    contexto: "Exames de sangue • Marco",
  },
  {
    id: 4,
    texto:
      "Consegui agendar o check-up do meu pai com a letra ampliada e recebi tudo organizado no e-mail.",
    autor: "Carlos E.",
    contexto: "Check-up preventivo • Ananindeua",
  },
  {
    id: 5,
    texto:
      "Tirei dúvida pelo chat da clínica sobre o pedido médico em dois minutos, sem precisar ligar.",
    autor: "Fernanda L.",
    contexto: "Ultrassonografia • Nazaré",
  },
];

function CartaoDepoimento({ depoimento }) {
  return (
    <Flex
      direction="column"
      justify="space-between"
      w={{ base: "285px", sm: "320px", md: "350px" }}
      minW={{ base: "285px", sm: "320px", md: "350px" }}
      bg="var(--color-surface)"
      border="1px solid var(--color-border-soft)"
      borderRadius="var(--radius-lg)"
      p={5}
      boxShadow="var(--shadow-sm)"
      gap={4}
      userSelect="none"
      flexShrink={0}
      transition="border-color var(--duration-fast), transform var(--duration-fast)"
      _hover={{
        borderColor: "var(--color-primary)",
        transform: "translateY(-3px)",
      }}
    >
      <Box minW="0">
        <HStack justify="space-between" mb={3}>
          <Box color="var(--color-text-highlight)" aria-hidden="true">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </Box>

          <Text fontSize="0.85rem" color="#eab308" aria-label="Avaliação 5 de 5 estrelas">
            ★★★★★
          </Text>
        </HStack>

        <Text
          fontFamily="var(--font-body)"
          fontSize="0.8rem"
          lineHeight="var(--leading-normal)"
          color="var(--color-text)"
        >
          “{depoimento.texto}”
        </Text>
      </Box>

      <Box pt={3} borderTop="1px solid var(--color-border-soft)">
        <Text
          fontFamily="var(--font-heading)"
          fontWeight="var(--weight-bold)"
          fontSize="0.95rem"
          color="var(--color-text)"
        >
          {depoimento.autor}
        </Text>
        <Text fontFamily="var(--font-body)" fontSize="0.74rem" color="var(--color-text-muted)">
          {depoimento.contexto}
        </Text>
      </Box>
    </Flex>
  );
}

/**
 * Esteira contínua de depoimentos com acumulação de sub-pixel via scrollLeft.
 * Funciona em desktop e mobile, pausa no hover e permite arrastar com o dedo.
 */
export default function CarrosselDepoimentos() {
  const [pausadoManualmente, setPausadoManualmente] = useState(false);
  const viewportRef = useRef(null);
  const acumuladorScrollRef = useRef(0);
  const interacaoAtivaRef = useRef(false);

  useEffect(() => {
    let quadroId;
    let ultimoTempo = performance.now();
    const velocidadePxPorSegundo = 48;

    function animar(agora) {
      const deltaSegundos = Math.min((agora - ultimoTempo) / 1000, 0.05);
      ultimoTempo = agora;

      const viewport = viewportRef.current;
      if (viewport && !pausadoManualmente && !interacaoAtivaRef.current) {
        const metadeLargura = viewport.scrollWidth / 2;
        if (metadeLargura > 0) {
          acumuladorScrollRef.current += velocidadePxPorSegundo * deltaSegundos;
          if (acumuladorScrollRef.current >= metadeLargura) {
            acumuladorScrollRef.current -= metadeLargura;
          }
          viewport.scrollLeft = acumuladorScrollRef.current;
        }
      }

      quadroId = window.requestAnimationFrame(animar);
    }

    quadroId = window.requestAnimationFrame(animar);
    return () => window.cancelAnimationFrame(quadroId);
  }, [pausadoManualmente]);

  function aoRolarManualmente() {
    const viewport = viewportRef.current;
    if (viewport && interacaoAtivaRef.current) {
      acumuladorScrollRef.current = viewport.scrollLeft;
    }
  }

  return (
    <Box
      id="depoimentos"
      scrollMarginTop="90px"
      mt={{ base: 14, md: 20 }}
      className="revelar-secao"
    >
      {/* Oculta a barra de rolagem horizontal mantendo o deslize nativo ativo */}
      <style>{`
        [data-esteira-depoimentos]::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <Container maxW="var(--container-max)" px={{ base: 4, md: 6 }} mb={6}>
        <Flex
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          align={{ base: "flex-start", sm: "flex-end" }}
          gap={3}
        >
          <Box>
            <Heading
              as="h2"
              fontFamily="var(--font-heading)"
              fontWeight="var(--weight-bold)"
              fontSize={{ base: "1.5rem", md: "1.85rem" }}
              color="var(--color-text)"
            >
              Quem já agendou pelo Exame Já
            </Heading>
            <Text fontFamily="var(--font-body)" fontSize="0.82rem" color="var(--color-text-muted)" mt={1}>
              Experiências reais de pacientes que agendaram sem surpresas
            </Text>
          </Box>

          <Box
            as="button"
            type="button"
            onClick={() => setPausadoManualmente((atual) => !atual)}
            px={3.5}
            py={2}
            minH="38px"
            borderRadius="var(--radius-full)"
            bg="var(--color-surface)"
            border="1px solid var(--color-border-soft)"
            color="var(--color-text)"
            fontFamily="var(--font-heading)"
            fontWeight="var(--weight-bold)"
            fontSize="0.8rem"
            cursor="pointer"
            _hover={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
          >
            {pausadoManualmente ? "▶ Retomar movimento" : "❚❚ Pausar relatos"}
          </Box>
        </Flex>
      </Container>

      {/* Viewport rolável com máscara suave nas laterais */}
      <Box
        ref={viewportRef}
        data-esteira-depoimentos=""
        overflowX="auto"
        scrollBehavior="auto"
        py={2}
        w="100%"
        onMouseEnter={() => {
          interacaoAtivaRef.current = true;
        }}
        onMouseLeave={() => {
          if (viewportRef.current) {
            acumuladorScrollRef.current = viewportRef.current.scrollLeft;
          }
          interacaoAtivaRef.current = false;
        }}
        onTouchStart={() => {
          interacaoAtivaRef.current = true;
        }}
        onTouchEnd={() => {
          if (viewportRef.current) {
            acumuladorScrollRef.current = viewportRef.current.scrollLeft;
          }
          interacaoAtivaRef.current = false;
        }}
        onScroll={aoRolarManualmente}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)",
          maskImage:
            "linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)",
        }}
      >
        <Flex w="max-content" gap="20px" px="20px">
          {[...DEPOIMENTOS_PACIENTES, ...DEPOIMENTOS_PACIENTES].map((item, idx) => (
            <CartaoDepoimento key={`${item.id}-${idx}`} depoimento={item} />
          ))}
        </Flex>
      </Box>
    </Box>
  );
}