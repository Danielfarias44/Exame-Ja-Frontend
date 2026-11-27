import { useEffect, useRef } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Badge, Box, Container, Flex, Grid, Heading, Image, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import Button from "@/components/ui/Button";
import IlustracaoInterativaHero from "@/components/landing/IlustracaoInterativaHero";
import VitrineFuncionalidades from "@/components/landing/VitrineFuncionalidades";
import SecaoConvenios from "@/components/landing/SecaoConvenios";
import SecaoFaq from "@/components/landing/SecaoFaq";
import SearchBar from "@/components/establishment/SearchBar";
import fotoLaboratorio from "@/assets/laboratorio-exame.jpeg";
import fotoClinica from "@/assets/clinica-atendimento.jpeg";

const INDICADORES_CONFIANCA = [
  { destaque: "Preços disponíveis", descricao: "Consulte valores publicados pelas clínicas" },
  { destaque: "Convênio ou particular", descricao: "Encontre ofertas conforme seu plano" },
  { destaque: "Busca por localização", descricao: "Veja clínicas próximas no mapa" },
];

const CATEGORIAS_EXAMES = [
  {
    titulo: "Análises Clínicas",
    exemplos: "Hemograma, glicemia, colesterol e hormônios.",
    tag: "Laboratório",
    raioCard: "22px 22px 22px 6px",
  },
  {
    titulo: "Diagnóstico por Imagem",
    exemplos: "Ultrassom, Raio-X, tomografia e ressonância.",
    tag: "Imagem",
    raioCard: "22px 22px 6px 22px",
  },
  {
    titulo: "Cardiologia",
    exemplos: "Eletrocardiograma, ecocardiograma e teste ergométrico.",
    tag: "Diagnóstico",
    raioCard: "22px 6px 22px 22px",
  },
  {
    titulo: "Check-up Preventivo",
    exemplos: "Encontre exames preventivos no catálogo disponível.",
    tag: "Preventivo",
    raioCard: "6px 22px 22px 22px",
  },
];

const ETAPAS_FUNCIONAMENTO = [
  {
    numero: "01",
    antesDestaque: "Escolha a clínica ",
    destaque: "ideal",
    descricao: "Consulte preço, distância e convênios das ofertas disponíveis.",
  },
  {
    numero: "02",
    antesDestaque: "Escolha uma oferta",
    destaque: "",
    descricao: "Veja os dados da clínica e tire dúvidas pelo chat.",
  },
  {
    numero: "03",
    antesDestaque: "Entre em contato com a ",
    destaque: "clínica",
    descricao: "Confirme diretamente com a unidade a disponibilidade e as orientações do exame.",
  },
];

export default function PaginaInicial() {
  const navegar = useNavigate();
  const referenciaConteudo = useRef(null);

  useEffect(() => {
    const conteiner = referenciaConteudo.current;
    if (!conteiner) return;

    const elementos = conteiner.querySelectorAll(".revelar-secao");
    if (!window.IntersectionObserver || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elementos.forEach((elemento) => elemento.classList.add("visivel"));
      return;
    }
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

  function executarBusca(codigoExame) {
    if (codigoExame) navegar(`/busca?codigoExame=${encodeURIComponent(codigoExame)}`);
  }

  return (
    <Box ref={referenciaConteudo} pb={{ base: "var(--space-16)", md: "var(--space-16)" }} overflowX="clip">
      {/* 1. HERO E BUSCA */}
      <Container
        maxW="var(--container-max)"
        px={{ base: "var(--space-4)", md: "var(--space-6)" }}
        pt={{ base: "var(--space-6)", md: "var(--space-12)" }}
      >
        <Flex
          direction={{ base: "column", lg: "row" }}
          align="center"
          justify="space-between"
          gap={{ base: "var(--space-8)", lg: "var(--space-12)" }}
        >
          <VStack
            align={{ base: "center", lg: "flex-start" }}
            textAlign={{ base: "center", lg: "left" }}
            maxW="var(--width-text)"
            gap="var(--space-4)"
            w="100%"
            minW="0"
            className="animar-entrada"
          >
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
              Gratuito para pacientes • Belém e região
            </Badge>

            <Heading
              as="h1"
              fontFamily="var(--font-heading)"
              fontWeight="var(--weight-bold)"
              fontSize={{ base: "var(--text-2xl)", sm: "var(--text-3xl)", md: "var(--text-3xl)" }}
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
              fontSize={{ base: "var(--text-xs)", md: "var(--text-sm)" }}
              lineHeight="var(--leading-normal)"
              color="var(--color-text-muted)"
            >
              Selecione o exame e veja onde atender{" "}
              <Box
                as="span"
                color="var(--color-text-highlight)"
                fontWeight="var(--weight-bold)"
              >
                perto de você
              </Box>
              , com ofertas e informações de localização disponíveis para consulta.
            </Text>

            <Box w="100%" maxW="var(--width-text)" pt="var(--space-1)">
              <SearchBar
                onSearch={executarBusca}
                label="Qual exame você precisa fazer?"
                align={{ base: "center", lg: "flex-start" }}
              />
            </Box>
          </VStack>

          <Box w="100%" maxW="var(--width-text)" minW="0" className="animar-entrada animar-atraso-1">
            <IlustracaoInterativaHero />
          </Box>
        </Flex>

        {/* Indicadores rápidos */}
        <SimpleGrid
          columns={{ base: 1, md: 3 }}
          gap="var(--space-6)"
          mt={{ base: "var(--space-12)", md: "var(--space-16)" }}
          pt="var(--space-6)"
          borderTop="var(--border-width) solid var(--color-border-soft)"
          className="animar-entrada animar-atraso-2"
        >
          {INDICADORES_CONFIANCA.map((item) => (
            <Flex key={item.destaque} align="center" gap="var(--space-3)" minW="0">
              <Flex
                align="center"
                justify="center"
                boxSize="var(--icon-md)"
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
                <Text fontFamily="var(--font-heading)" fontWeight="var(--weight-bold)" fontSize="var(--text-sm)" color="var(--color-text)">
                  {item.destaque}
                </Text>
                <Text fontFamily="var(--font-body)" fontSize="var(--text-xs)" color="var(--color-text-muted)">
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
        scrollMarginTop="var(--header-offset)"
        maxW="var(--container-max)"
        px={{ base: "var(--space-4)", md: "var(--space-6)" }}
        mt={{ base: "var(--space-16)", md: "var(--space-16)" }}
        className="revelar-secao"
      >
        <Flex
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          align={{ base: "flex-start", sm: "flex-end" }}
          gap="var(--space-3)"
          mb="var(--space-8)"
        >
          <Heading
            as="h2"
            fontFamily="var(--font-heading)"
            fontWeight="var(--weight-bold)"
            fontSize={{ base: "var(--text-xl)", md: "var(--text-2xl)" }}
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
            minH="var(--touch-target-min)"
            px="var(--space-2)"
          >
            <RouterLink to="/busca">Ver catálogo completo →</RouterLink>
          </Button>
        </Flex>

        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="var(--space-4)" pb={{ lg: "var(--space-4)" }}>
          {CATEGORIAS_EXAMES.map((cat, idx) => (
            <Flex
              key={cat.titulo}
              as="button"
              type="button"
              onClick={() => navegar("/busca")}
              direction="column"
              align="flex-start"
              justify="space-between"
              textAlign="left"
              w="100%"
              minW="0"
              p="var(--space-6)"
              className="landing-cartao"
              bg="var(--color-surface)"
              border="var(--border-width) solid var(--color-border-soft)"
              borderRadius={cat.raioCard}
              boxShadow="var(--shadow-sm)"
              cursor="pointer"
              gap="var(--space-4)"
              transform={{ base: "none", lg: idx % 2 === 1 ? "translateY(14px)" : "none" }}
              transition="all var(--duration-base) var(--ease-standard)"
              _hover={{
                borderColor: "var(--color-primary)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <Box w="100%">
                <Badge
                  mb="var(--space-3)"
                  px="var(--space-3)"
                  py="var(--space-1)"
                  borderRadius="var(--radius-full)"
                  bg="var(--color-primary-soft)"
                  color="var(--color-primary)"
                  fontFamily="var(--font-heading)"
                  fontWeight="var(--weight-bold)"
                  fontSize="var(--text-xs)"
                >
                  {cat.tag}
                </Badge>

                <Heading
                  as="h3"
                  fontFamily="var(--font-heading)"
                  fontWeight="var(--weight-bold)"
                  fontSize="var(--text-base)"
                  color="var(--color-text)"
                  mb="var(--space-2)"
                >
                  {cat.titulo}
                </Heading>

                <Text fontFamily="var(--font-body)" fontSize="var(--text-xs)" color="var(--color-text-muted)">
                  {cat.exemplos}
                </Text>
              </Box>

              <Text fontFamily="var(--font-heading)" fontWeight="var(--weight-bold)" fontSize="var(--text-xs)" color="var(--color-text-highlight)">
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
        scrollMarginTop="var(--header-offset)"
        maxW="var(--container-max)"
        px={{ base: "var(--space-4)", md: "var(--space-6)" }}
        mt={{ base: "var(--space-16)", md: "var(--space-16)" }}
        className="revelar-secao"
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "flex-start", md: "flex-end" }}
          gap="var(--space-3)"
          mb="var(--space-8)"
        >
          <Box>
            <Badge
              mb="var(--space-2)"
              px="var(--space-3)"
              py="var(--space-1)"
              borderRadius="var(--radius-full)"
              bg="var(--color-primary-soft)"
              color="var(--color-primary)"
              fontFamily="var(--font-heading)"
              fontWeight="var(--weight-bold)"
              fontSize="var(--text-xs)"
            >
              Simples e rápido
            </Badge>
            <Heading
              as="h2"
              fontFamily="var(--font-heading)"
              fontWeight="var(--weight-bold)"
              fontSize={{ base: "var(--text-xl)", md: "var(--text-2xl)" }}
              color="var(--color-text)"
            >
              Do pedido médico ao exame em 3 passos
            </Heading>
          </Box>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 3 }} gap="var(--space-6)" mb={{ base: "var(--space-12)", md: "var(--space-16)" }}>
          {ETAPAS_FUNCIONAMENTO.map((etapa, idx) => (
            <Box
              key={etapa.numero}
              minW="0"
              p="var(--space-6)"
              bg="var(--color-surface)"
              border="var(--border-width) solid var(--color-border-soft)"
              borderRadius="var(--radius-lg)"
              boxShadow="var(--shadow-sm)"
              mt={{ base: 0, md: `${idx * 16}px` }}
            >
              <Flex align="center" gap="var(--space-3)" mb="var(--space-3)">
                <Flex
                  align="center"
                  justify="center"
                  boxSize="var(--icon-md)"
                  borderRadius="var(--radius-full)"
                  bg="var(--color-primary)"
                  color="var(--color-text-on-primary)"
                  fontFamily="var(--font-heading)"
                  fontWeight="var(--weight-bold)"
                  fontSize="var(--text-xs)"
                >
                  {etapa.numero}
                </Flex>
                <Box flex="1" h="var(--border-width)" bg="var(--color-border-soft)" />
              </Flex>

              <Heading as="h3" fontFamily="var(--font-heading)" fontWeight="var(--weight-bold)" fontSize="var(--text-base)" color="var(--color-text)" mb="var(--space-2)">
                {etapa.antesDestaque}
                {etapa.destaque && (
                  <Box as="span" color="var(--color-text-highlight)">
                    {etapa.destaque}
                  </Box>
                )}
              </Heading>

              <Text fontFamily="var(--font-body)" fontSize="var(--text-xs)" color="var(--color-text-muted)">
                {etapa.descricao}
              </Text>
            </Box>
          ))}
        </SimpleGrid>

        <Grid templateColumns={{ base: "1fr", lg: "0.95fr 1.05fr" }} gap="var(--space-6)" alignItems="center">
          <Box
            position="relative"
            borderRadius="var(--radius-lg)"
            overflow="hidden"
            border="var(--border-width) solid var(--color-border-soft)"
            boxShadow="var(--shadow-md)"
            minH={{ base: "var(--media-sm)", md: "var(--media-md)" }}
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
              p="var(--space-4)"
              bg="linear-gradient(to top, var(--color-overlay), transparent)"
              color="var(--color-inverse-text)"
            >
              <Text fontFamily="var(--font-heading)" fontWeight="var(--weight-bold)" fontSize="var(--text-sm)">
                Unidades verificadas e sem surpresas na recepção
              </Text>
            </Box>
          </Box>

          <SimpleGrid columns={{ base: 1, sm: 2 }} gap="var(--space-4)">
            <Box p="var(--space-6)" borderRadius="var(--radius-lg)" bg="var(--color-surface)" border="var(--border-width) solid var(--color-border-soft)">
              <Badge mb="var(--space-3)" bg="var(--color-error-soft)" color="var(--color-error)" px="var(--space-3)" py="var(--space-1)" borderRadius="var(--radius-full)" fontFamily="var(--font-heading)" fontWeight="var(--weight-bold)">
                Jeito tradicional
              </Badge>
              <VStack align="stretch" gap="var(--space-2)" fontSize="var(--text-xs)" color="var(--color-text-muted)">
                <Text>• Demora no telefone ou WhatsApp</Text>
                <Text>• Preço descoberto só na hora</Text>
                <Text>• Dificuldade para comparar opções</Text>
              </VStack>
            </Box>

            <Box
              p="var(--space-6)"
              borderRadius="var(--radius-lg)"
              bg="var(--color-surface)"
              border="var(--border-width-strong) solid var(--color-primary)"
              transform={{ base: "none", sm: "translateY(-10px)" }}
              boxShadow="var(--shadow-md)"
            >
              <Badge mb="var(--space-3)" bg="var(--color-success-soft)" color="var(--color-success)" px="var(--space-3)" py="var(--space-1)" borderRadius="var(--radius-full)" fontFamily="var(--font-heading)" fontWeight="var(--weight-bold)">
                Com o Exame Já
              </Badge>
              <VStack align="stretch" gap="var(--space-2)" fontSize="var(--text-xs)" color="var(--color-text)">
                <Text>✓ Valores e distância das ofertas</Text>
                <Text>✓ Filtro direto pelo convênio</Text>
                <Text>✓ Busca por exame, convênio e localização</Text>
              </VStack>
            </Box>
          </SimpleGrid>
        </Grid>
      </Container>

      {/* 6. PARA CLÍNICAS E LABORATÓRIOS */}
      <Box
        id="para-clinicas"
        scrollMarginTop="var(--header-offset)"
        mt={{ base: "var(--space-16)", md: "var(--space-16)" }}
        py={{ base: "var(--space-12)", md: "var(--space-16)" }}
        bg="var(--color-surface)"
        borderTop="var(--border-width) solid var(--color-border-soft)"
        borderBottom="var(--border-width) solid var(--color-border-soft)"
        className="revelar-secao"
      >
        <Container maxW="var(--container-max)" px={{ base: "var(--space-4)", md: "var(--space-6)" }}>
          <Grid
            templateColumns={{ base: "1fr", lg: "1.15fr 0.85fr" }}
            gap={{ base: "var(--space-6)", lg: "var(--space-12)" }}
            alignItems="center"
          >
            <Flex direction="column" align="flex-start" minW="0">
              <Badge mb="var(--space-3)" px="var(--space-3)" py="var(--space-1)" borderRadius="var(--radius-full)" bg="var(--color-accent-soft)" color="var(--color-accent)" fontFamily="var(--font-heading)" fontWeight="var(--weight-bold)" fontSize="var(--text-xs)">
                Parceiros de saúde
              </Badge>

              <Heading as="h2" fontFamily="var(--font-heading)" fontWeight="var(--weight-bold)" fontSize={{ base: "var(--text-xl)", md: "var(--text-2xl)" }} color="var(--color-text)" mb="var(--space-3)">
                Tem uma clínica ou laboratório? Receba pacientes todos os dias.
              </Heading>

              <Text fontFamily="var(--font-body)" fontSize="var(--text-xs)" color="var(--color-text-muted)" mb="var(--space-6)" maxW="var(--width-text)">
                Cadastre sua unidade, publique ofertas de exames e informe os convênios aceitos.
              </Text>

              <Button
                asChild
                bg="var(--color-accent)"
                _hover={{ bg: "var(--color-accent-hover)" }}
                color="var(--color-text-on-accent)"
                fontFamily="var(--font-heading)"
                fontWeight="var(--weight-bold)"
                fontSize="var(--text-sm)"
                px="var(--space-6)"
                minH="var(--touch-target-min)"
                w={{ base: "100%", sm: "auto" }}
                borderRadius="var(--radius-md)"
              >
                <RouterLink to="/cadastro?perfil=clinica">Credenciar minha clínica</RouterLink>
              </Button>
            </Flex>

            <Box
              position="relative"
              borderRadius="var(--radius-lg)"
              overflow="hidden"
              border="var(--border-width) solid var(--color-border-soft)"
              boxShadow="var(--shadow-md)"
              minH={{ base: "var(--media-sm)", lg: "var(--media-md)" }}
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

      {/* 7. PERGUNTAS FREQUENTES */}
      <SecaoFaq />
    </Box>
  );
}
