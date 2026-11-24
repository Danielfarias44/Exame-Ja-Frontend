import { useEffect, useRef } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Image,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import IlustracaoInterativaHero from "@/components/landing/IlustracaoInterativaHero";
import VitrineFuncionalidades from "@/components/landing/VitrineFuncionalidades";
import SecaoConvenios from "@/components/landing/SecaoConvenios";
import CarrosselDepoimentos from "@/components/landing/CarrosselDepoimentos";
import SecaoFaq from "@/components/landing/SecaoFaq";
import SearchBar from "@/components/establishment/SearchBar";
import fotoLaboratorio from "@/assets/laboratorio-exame.jpeg";
import fotoClinica from "@/assets/clinica-atendimento.jpeg";

const INDICADORES_CONFIANCA = [
  { destaque: "Preço transparente", descricao: "Saiba o valor antes de agendar" },
  { destaque: "Convênio ou particular", descricao: "Filtre clínicas em segundos" },
  { destaque: "Alertas de preparo", descricao: "Avisos de jejum no app e e-mail" },
];

const CATEGORIAS_EXAMES = [
  {
    titulo: "Análises Clínicas",
    exemplos: "Hemograma, glicemia, colesterol e hormônios.",
    termo: "Sangue",
    tag: "Coleta rápida",
    raioCard: "22px 22px 22px 6px",
  },
  {
    titulo: "Diagnóstico por Imagem",
    exemplos: "Ultrassom, Raio-X, tomografia e ressonância.",
    termo: "Imagem",
    tag: "Laudo digital",
    raioCard: "22px 22px 6px 22px",
  },
  {
    titulo: "Cardiologia",
    exemplos: "Eletrocardiograma, ecocardiograma e teste ergométrico.",
    termo: "Cardio",
    tag: "Especialistas",
    raioCard: "22px 6px 22px 22px",
  },
  {
    titulo: "Check-up Preventivo",
    exemplos: "Pacotes completos com histórico organizado.",
    termo: "Check-up",
    tag: "Pacotes",
    raioCard: "6px 22px 22px 22px",
  },
];

const ETAPAS_FUNCIONAMENTO = [
  {
    numero: "01",
    antesDestaque: "Escolha a clínica ",
    destaque: "ideal",
    descricao: "Compare preço, distância, convênios e avaliações reais.",
  },
  {
    numero: "02",
    antesDestaque: "Agende ou tire dúvidas",
    destaque: "",
    descricao: "Solicite horário online ou fale direto no chat da unidade.",
  },
  {
    numero: "03",
    antesDestaque: "Vá preparado e ",
    destaque: "sem filas",
    descricao: "Receba lembretes de jejum e salve tudo no seu histórico.",
  },
];

export default function PaginaInicial() {
  const navegar = useNavigate();
  const referenciaConteudo = useRef(null);

  useEffect(() => {
    const conteiner = referenciaConteudo.current;
    if (!conteiner) return;

    const elementos = conteiner.querySelectorAll(".revelar-secao");
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            entrada.target.classList.add("visivel");
            observador.unobserve(entrada.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    elementos.forEach((el) => observador.observe(el));
    return () => observador.disconnect();
  }, []);

  function executarBusca(consulta) {
    const consultaLimpa = consulta.trim();
    if (!consultaLimpa) {
      navegar("/busca");
      return;
    }
    navegar(`/busca?q=${encodeURIComponent(consultaLimpa)}`);
  }

  return (
    <Box ref={referenciaConteudo} pb={{ base: 14, md: 24 }} overflowX="clip">
      {/* 1. HERO E BUSCA */}
      <Container
        maxW="var(--container-max)"
        px={{ base: 4, md: 6 }}
        pt={{ base: 6, md: 12 }}
      >
        <Flex
          direction={{ base: "column", lg: "row" }}
          align="center"
          justify="space-between"
          gap={{ base: 8, lg: 10 }}
        >
          <VStack
            align={{ base: "center", lg: "flex-start" }}
            textAlign={{ base: "center", lg: "left" }}
            maxW="560px"
            gap={4}
            w="100%"
            minW="0"
            className="animar-entrada"
          >
            <Badge
              px={3}
              py={1}
              borderRadius="var(--radius-full)"
              bg="var(--color-primary-soft)"
              color="var(--color-primary)"
              fontFamily="var(--font-heading)"
              fontWeight="var(--weight-bold)"
              fontSize="0.78rem"
            >
              Gratuito para pacientes • Belém e região
            </Badge>

            <Heading
              as="h1"
              fontFamily="var(--font-heading)"
              fontWeight="var(--weight-bold)"
              fontSize={{ base: "1.85rem", sm: "2.35rem", md: "var(--text-3xl)" }}
              lineHeight="var(--leading-tight)"
              color="var(--color-text)"
            >
              Achar uma clínica não devia ser{" "}
              <Box as="span" color="var(--color-text-highlight)">
                mais difícil
              </Box>{" "}
              que fazer os seus exames.
            </Heading>

            <Text
              fontFamily="var(--font-body)"
              fontSize={{ base: "0.9rem", md: "0.96rem" }}
              lineHeight="var(--leading-normal)"
              color="var(--color-text-muted)"
            >
              Informe o exame ou seu convênio e veja onde atender{" "}
              <Box
                as="span"
                color="var(--color-text-highlight)"
                fontWeight="var(--weight-bold)"
              >
                perto de você
              </Box>
              , com preço e preparo claros antes de sair de casa.
            </Text>

            <Box w="100%" maxW="500px" pt={1}>
              <SearchBar
                onSearch={executarBusca}
                label="Qual exame você precisa fazer?"
                align={{ base: "center", lg: "flex-start" }}
              />
            </Box>
          </VStack>

          <Box w="100%" maxW="460px" minW="0" className="animar-entrada animar-atraso-1">
            <IlustracaoInterativaHero />
          </Box>
        </Flex>

        {/* Indicadores rápidos */}
        <SimpleGrid
          columns={{ base: 1, md: 3 }}
          gap={5}
          mt={{ base: 10, md: 14 }}
          pt={6}
          borderTop="1px solid var(--color-border-soft)"
          className="animar-entrada animar-atraso-2"
        >
          {INDICADORES_CONFIANCA.map((item) => (
            <Flex key={item.destaque} align="center" gap={3} minW="0">
              <Flex
                align="center"
                justify="center"
                boxSize="36px"
                borderRadius="var(--radius-md)"
                bg="var(--color-success-soft)"
                color="var(--color-success)"
                flexShrink={0}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </Flex>
              <Box minW="0">
                <Text fontFamily="var(--font-heading)" fontWeight="var(--weight-bold)" fontSize="0.98rem" color="var(--color-text)">
                  {item.destaque}
                </Text>
                <Text fontFamily="var(--font-body)" fontSize="0.76rem" color="var(--color-text-muted)">
                  {item.descricao}
                </Text>
              </Box>
            </Flex>
          ))}
        </SimpleGrid>
      </Container>

      {/* 2. ESPECIALIDADES COM RITMO ESCALONADO */}
      <Container
        id="especialidades"
        scrollMarginTop="90px"
        maxW="var(--container-max)"
        px={{ base: 4, md: 6 }}
        mt={{ base: 14, md: 20 }}
        className="revelar-secao"
      >
        <Flex
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          align={{ base: "flex-start", sm: "flex-end" }}
          gap={3}
          mb={7}
        >
          <Heading
            as="h2"
            fontFamily="var(--font-heading)"
            fontWeight="var(--weight-bold)"
            fontSize={{ base: "1.45rem", md: "1.8rem" }}
            color="var(--color-text)"
          >
            Principais exames e especialidades
          </Heading>

          <Button
            asChild
            variant="ghost"
            color="var(--color-primary)"
            fontFamily="var(--font-heading)"
            fontWeight="var(--weight-bold)"
            minH="40px"
            px={2}
          >
            <RouterLink to="/busca">Ver catálogo completo →</RouterLink>
          </Button>
        </Flex>

        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4} pb={{ lg: 4 }}>
          {CATEGORIAS_EXAMES.map((cat, idx) => (
            <Flex
              key={cat.titulo}
              as="button"
              type="button"
              onClick={() => executarBusca(cat.termo)}
              direction="column"
              align="flex-start"
              justify="space-between"
              textAlign="left"
              w="100%"
              minW="0"
              p={5}
              bg="var(--color-surface)"
              border="1px solid var(--color-border-soft)"
              borderRadius={cat.raioCard}
              boxShadow="var(--shadow-sm)"
              cursor="pointer"
              gap={3.5}
              transform={{ base: "none", lg: idx % 2 === 1 ? "translateY(14px)" : "none" }}
              transition="all var(--duration-base) var(--ease-standard)"
              _hover={{
                borderColor: "var(--color-primary)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <Box w="100%">
                <Badge
                  mb={2.5}
                  px={2.5}
                  py={0.5}
                  borderRadius="var(--radius-full)"
                  bg="var(--color-primary-soft)"
                  color="var(--color-primary)"
                  fontFamily="var(--font-heading)"
                  fontWeight="var(--weight-bold)"
                  fontSize="0.7rem"
                >
                  {cat.tag}
                </Badge>

                <Heading
                  as="h3"
                  fontFamily="var(--font-heading)"
                  fontWeight="var(--weight-bold)"
                  fontSize="1.1rem"
                  color="var(--color-text)"
                  mb={1.5}
                >
                  {cat.titulo}
                </Heading>

                <Text fontFamily="var(--font-body)" fontSize="0.78rem" color="var(--color-text-muted)">
                  {cat.exemplos}
                </Text>
              </Box>

              <Text fontFamily="var(--font-heading)" fontWeight="var(--weight-bold)" fontSize="0.88rem" color="var(--color-text-highlight)">
                Explorar →
              </Text>
            </Flex>
          ))}
        </SimpleGrid>
      </Container>

      {/* 3. CARROSSEL DOS RECURSOS DA PLATAFORMA */}
      <VitrineFuncionalidades />

      {/* 4. CONVÊNIOS E PLANOS ACEITOS */}
      <SecaoConvenios />

      {/* 5. COMO FUNCIONA EM TRILHA + COMPARATIVO ABERTO */}
      <Container
        id="como-funciona"
        scrollMarginTop="90px"
        maxW="var(--container-max)"
        px={{ base: 4, md: 6 }}
        mt={{ base: 14, md: 20 }}
        className="revelar-secao"
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "flex-start", md: "flex-end" }}
          gap={3}
          mb={8}
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
              Simples e rápido
            </Badge>
            <Heading
              as="h2"
              fontFamily="var(--font-heading)"
              fontWeight="var(--weight-bold)"
              fontSize={{ base: "1.45rem", md: "1.8rem" }}
              color="var(--color-text)"
            >
              Do pedido médico ao exame em 3 passos
            </Heading>
          </Box>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} mb={{ base: 10, md: 16 }}>
          {ETAPAS_FUNCIONAMENTO.map((etapa, idx) => (
            <Box
              key={etapa.numero}
              minW="0"
              p={5}
              bg="var(--color-surface)"
              border="1px solid var(--color-border-soft)"
              borderRadius="20px"
              boxShadow="var(--shadow-sm)"
              mt={{ base: 0, md: `${idx * 16}px` }}
            >
              <Flex align="center" gap={2.5} mb={2.5}>
                <Flex
                  align="center"
                  justify="center"
                  boxSize="32px"
                  borderRadius="var(--radius-full)"
                  bg="var(--color-primary)"
                  color="var(--color-text-on-primary)"
                  fontFamily="var(--font-heading)"
                  fontWeight="var(--weight-bold)"
                  fontSize="0.82rem"
                >
                  {etapa.numero}
                </Flex>
                <Box flex="1" h="1px" bg="var(--color-border-soft)" />
              </Flex>

              <Heading as="h3" fontFamily="var(--font-heading)" fontWeight="var(--weight-bold)" fontSize="1.15rem" color="var(--color-text)" mb={1.5}>
                {etapa.antesDestaque}
                {etapa.destaque && (
                  <Box as="span" color="var(--color-text-highlight)">
                    {etapa.destaque}
                  </Box>
                )}
              </Heading>

              <Text fontFamily="var(--font-body)" fontSize="0.78rem" color="var(--color-text-muted)">
                {etapa.descricao}
              </Text>
            </Box>
          ))}
        </SimpleGrid>

        <Grid templateColumns={{ base: "1fr", lg: "0.95fr 1.05fr" }} gap={6} alignItems="center">
          <Box
            position="relative"
            borderRadius="24px"
            overflow="hidden"
            border="1px solid var(--color-border-soft)"
            boxShadow="var(--shadow-md)"
            minH={{ base: "220px", md: "270px" }}
            bg="var(--color-surface)"
          >
            <Image
              src={fotoLaboratorio}
              alt="Ambiente moderno de laboratório diagnóstico credenciado ao Exame Já"
              loading="lazy"
              decoding="async"
              w="100%"
              h="100%"
              objectFit="cover"
            />
            <Box
              position="absolute"
              insetX="0"
              bottom="0"
              p={4}
              bg="linear-gradient(to top, rgb(15 23 34 / 0.85), transparent)"
              color="#ffffff"
            >
              <Text fontFamily="var(--font-heading)" fontWeight="var(--weight-bold)" fontSize="0.92rem">
                Unidades verificadas e sem surpresas na recepção
              </Text>
            </Box>
          </Box>

          <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
            <Box p={5} borderRadius="20px" bg="var(--color-surface)" border="1px solid var(--color-border-soft)">
              <Badge mb={3} bg="var(--color-error-soft)" color="var(--color-error)" px={2.5} py={0.5} borderRadius="var(--radius-full)" fontFamily="var(--font-heading)" fontWeight="var(--weight-bold)">
                Jeito tradicional
              </Badge>
              <VStack align="stretch" gap={2} fontSize="0.78rem" color="var(--color-text-muted)">
                <Text>• Demora no telefone ou WhatsApp</Text>
                <Text>• Preço descoberto só na hora</Text>
                <Text>• Risco de esquecer o jejum</Text>
              </VStack>
            </Box>

            <Box
              p={5}
              borderRadius="20px"
              bg="var(--color-surface)"
              border="2px solid var(--color-primary)"
              transform={{ base: "none", sm: "translateY(-10px)" }}
              boxShadow="var(--shadow-md)"
            >
              <Badge mb={3} bg="var(--color-success-soft)" color="var(--color-success)" px={2.5} py={0.5} borderRadius="var(--radius-full)" fontFamily="var(--font-heading)" fontWeight="var(--weight-bold)">
                Com o Exame Já
              </Badge>
              <VStack align="stretch" gap={2} fontSize="0.78rem" color="var(--color-text)">
                <Text>✓ Valores e notas na hora</Text>
                <Text>✓ Filtro direto pelo convênio</Text>
                <Text>✓ Alertas automáticos de preparo</Text>
              </VStack>
            </Box>
          </SimpleGrid>
        </Grid>
      </Container>

      {/* 6. PARA CLÍNICAS E LABORATÓRIOS */}
      <Box
        id="para-clinicas"
        scrollMarginTop="90px"
        mt={{ base: 14, md: 20 }}
        py={{ base: 10, md: 14 }}
        bg="var(--color-surface)"
        borderTop="1px solid var(--color-border-soft)"
        borderBottom="1px solid var(--color-border-soft)"
        className="revelar-secao"
      >
        <Container maxW="var(--container-max)" px={{ base: 4, md: 6 }}>
          <Grid
            templateColumns={{ base: "1fr", lg: "1.15fr 0.85fr" }}
            gap={{ base: 6, lg: 10 }}
            alignItems="center"
          >
            <Flex direction="column" align="flex-start" minW="0">
              <Badge mb={2.5} px={2.5} py={0.5} borderRadius="var(--radius-full)" bg="var(--color-accent-soft)" color="var(--color-accent)" fontFamily="var(--font-heading)" fontWeight="var(--weight-bold)" fontSize="0.74rem">
                Parceiros de saúde
              </Badge>

              <Heading as="h2" fontFamily="var(--font-heading)" fontWeight="var(--weight-bold)" fontSize={{ base: "1.4rem", md: "1.75rem" }} color="var(--color-text)" mb={2.5}>
                Tem uma clínica ou laboratório? Receba pacientes todos os dias.
              </Heading>

              <Text fontFamily="var(--font-body)" fontSize="0.82rem" color="var(--color-text-muted)" mb={5} maxW="520px">
                Cadastre sua unidade, divulgue seus convênios e reduza faltas com lembretes automáticos.
              </Text>

              <Button
                asChild
                bg="var(--color-accent)"
                _hover={{ bg: "var(--color-accent-hover)" }}
                color="#ffffff"
                fontFamily="var(--font-heading)"
                fontWeight="var(--weight-bold)"
                fontSize="0.92rem"
                px={6}
                minH="46px"
                w={{ base: "100%", sm: "auto" }}
                borderRadius="var(--radius-md)"
              >
                <RouterLink to="/cadastro?perfil=clinica">Credenciar minha clínica</RouterLink>
              </Button>
            </Flex>

            <Box
              position="relative"
              borderRadius="24px"
              overflow="hidden"
              border="1px solid var(--color-border-soft)"
              boxShadow="var(--shadow-md)"
              minH={{ base: "210px", lg: "260px" }}
              bg="var(--color-bg)"
            >
              <Image
                src={fotoClinica}
                alt="Atendimento acolhedor em clínica médica credenciada"
                loading="lazy"
                decoding="async"
                w="100%"
                h="100%"
                objectFit="cover"
              />
            </Box>
          </Grid>
        </Container>
      </Box>

      {/* 7. DEPOIMENTOS ANIMADOS */}
       <CarrosselDepoimentos/>

      {/* 8. PERGUNTAS FREQUENTES */}
      <SecaoFaq />
    </Box>
  );
}