import { useState } from "react";
import {
  Badge,
  Box,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";

/**
 * Dúvidas mais comuns de pacientes e clínicas parceiras.
 * Respostas curtas e objetivas para leitura rápida.
 */
const PERGUNTAS_FREQUENTES = [
  {
    id: "gratuito",
    pergunta: "O Exame Já é gratuito para pacientes?",
    resposta:
      "Sim. Pesquisar exames, filtrar por convênio, comparar clínicas, conversar no chat e acompanhar seu histórico são 100% gratuitos para pacientes. Você paga apenas o valor do exame diretamente à clínica, caso seja atendimento particular.",
  },
  {
    id: "preco-convenio",
    pergunta: "Consigo saber o preço e se aceita meu plano antes de ir?",
    resposta:
      "Sim. Cada clínica exibe antecipadamente os convênios credenciados (como Unimed, Bradesco, Hapvida, SulAmérica, Amil e IASEP) e os valores transparentes para atendimento particular.",
  },
  {
    id: "lembretes",
    pergunta: "Como funcionam os lembretes de jejum e preparo?",
    resposta:
      "Após agendar, você recebe avisos automáticos no aplicativo e por e-mail informando horários de jejum, documentos necessários e recomendações específicas do seu exame.",
  },
  {
    id: "pwa-celular",
    pergunta: "Preciso baixar algum aplicativo para usar no celular?",
    resposta:
      "Não precisa baixar na Play Store ou App Store. O Exame Já funciona como PWA: você pode instalar um atalho direto pelo navegador (Chrome ou Safari) em segundos, ocupando quase zero memória.",
  },
  {
    id: "acessibilidade",
    pergunta: "A plataforma é fácil de usar para pessoas mais velhas?",
    resposta:
      "Sim. Contamos com personalização de interface e modo de leitura facilitada (60+), que amplia fontes, aumenta botões e simplifica as etapas para uma navegação confortável.",
  },
  {
    id: "clinicas",
    pergunta: "Tenho uma clínica ou laboratório. Como me torno parceiro?",
    resposta:
      "Clique em “Credenciar minha clínica”, preencha os dados da unidade e cadastre seus exames, preços e convênios atendidos para começar a receber solicitações de agendamento.",
  },
];

/**
 * Seção de Perguntas Frequentes (FAQ) em formato sanfona (accordion),
 * mantendo a interface limpa e revelando apenas a resposta selecionada.
 */
export default function SecaoFaq() {
  const [perguntaAberta, setPerguntaAberta] = useState("gratuito");

  function alternarPergunta(id) {
    setPerguntaAberta((atual) => (atual === id ? null : id));
  }

  return (
    <Container
      id="perguntas-frequentes"
      scrollMarginTop="90px"
      maxW="860px"
      px={{ base: 4, md: 6 }}
      mt={{ base: 14, md: 20 }}
      className="revelar-secao"
    >
      <VStack align="center" textAlign="center" gap={2} mb={7}>
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
          Tire suas dúvidas
        </Badge>

        <Heading
          as="h2"
          fontFamily="var(--font-heading)"
          fontWeight="var(--weight-bold)"
          fontSize={{ base: "1.45rem", md: "1.8rem" }}
          color="var(--color-text)"
        >
          Perguntas frequentes
        </Heading>
      </VStack>

      <VStack align="stretch" gap={3}>
        {PERGUNTAS_FREQUENTES.map((item) => {
          const aberta = perguntaAberta === item.id;
          return (
            <Box
              key={item.id}
              bg="var(--color-surface)"
              border="1px solid"
              borderColor={aberta ? "var(--color-primary)" : "var(--color-border-soft)"}
              borderRadius="var(--radius-md)"
              boxShadow={aberta ? "var(--shadow-sm)" : "none"}
              transition="border-color var(--duration-fast)"
              overflow="hidden"
            >
              <Flex
                as="button"
                type="button"
                onClick={() => alternarPergunta(item.id)}
                aria-expanded={aberta}
                aria-controls={`resposta-${item.id}`}
                w="100%"
                align="center"
                justify="space-between"
                gap={4}
                p={{ base: 4, md: 5 }}
                minH="56px"
                textAlign="left"
                cursor="pointer"
              >
                <Text
                  fontFamily="var(--font-heading)"
                  fontWeight="var(--weight-bold)"
                  fontSize={{ base: "0.95rem", md: "1.02rem" }}
                  color="var(--color-text)"
                >
                  {item.pergunta}
                </Text>

                <Flex
                  align="center"
                  justify="center"
                  boxSize="30px"
                  borderRadius="var(--radius-full)"
                  bg={aberta ? "var(--color-primary)" : "var(--color-bg)"}
                  color={aberta ? "var(--color-text-on-primary)" : "var(--color-text-muted)"}
                  flexShrink={0}
                  transition="transform 200ms ease, background-color 200ms ease"
                  transform={aberta ? "rotate(180deg)" : "rotate(0deg)"}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </Flex>
              </Flex>

              {aberta && (
                <Box
                  id={`resposta-${item.id}`}
                  px={{ base: 4, md: 5 }}
                  pb={{ base: 4, md: 5 }}
                  pt={0}
                  className="slide-carrossel-ativo"
                >
                  <Text
                    fontFamily="var(--font-body)"
                    fontSize="0.82rem"
                    lineHeight="var(--leading-normal)"
                    color="var(--color-text-muted)"
                    pt={2}
                    borderTop="1px solid var(--color-border-soft)"
                  >
                    {item.resposta}
                  </Text>
                </Box>
              )}
            </Box>
          );
        })}
      </VStack>
    </Container>
  );
}