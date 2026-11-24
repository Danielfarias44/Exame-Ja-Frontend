import { Box, Flex, Text } from "@chakra-ui/react";
import { formatarHorarioCompleto, formatarHorarioCurto } from "@/utils/formatarHorario";

export default function ConversationList({ conversas, conversaAtivaId, souCliente, onSelecionar }) {
  return (
    <Box as="nav" aria-label="Conversas">
      <Box as="ul" role="list" m={0} p={0} listStyleType="none">
        {conversas.map((conversa) => {
          const ativa = conversa.id === conversaAtivaId;
          const nome = souCliente ? conversa.clinicaNome : conversa.clienteNome;

          return (
            <li key={conversa.id}>
              <Box
                as="button"
                type="button"
                id={`conversa-${conversa.id}`}
                onClick={() => onSelecionar(conversa.id)}
                aria-current={ativa ? "true" : undefined}
                w="100%"
                minH="var(--touch-target-min)"
                textAlign="left"
                px="var(--space-4)"
                py="var(--space-3)"
                bg={ativa ? "var(--color-primary-soft)" : "transparent"}
                borderLeftWidth="var(--border-width-strong)"
                borderLeftStyle="solid"
                borderLeftColor={ativa ? "var(--color-primary)" : "transparent"}
                borderBottomWidth="var(--border-width)"
                borderBottomStyle="solid"
                borderBottomColor="var(--color-border-soft)"
                cursor="pointer"
                transition="background var(--duration-fast) var(--ease-standard)"
                _hover={{ bg: "var(--color-primary-soft)" }}
                _focusVisible={{
                  outline: "var(--border-width-strong) solid var(--color-focus)",
                  outlineOffset: "-2px",
                }}
              >
                <Flex justify="space-between" align="baseline" gap="var(--space-2)">
                  <Text
                    as="span"
                    fontFamily="var(--font-heading)"
                    fontWeight={ativa ? "var(--weight-bold)" : "var(--weight-semibold)"}
                    fontSize="var(--text-sm)"
                    color="var(--color-text)"
                    lineClamp={1}
                  >
                    {nome}
                  </Text>
                  <Text
                    as="time"
                    dateTime={conversa.atualizadoEm}
                    title={formatarHorarioCompleto(conversa.atualizadoEm)}
                    fontSize="var(--text-xs)"
                    color="var(--color-text-muted)"
                    flexShrink={0}
                  >
                    {formatarHorarioCurto(conversa.atualizadoEm)}
                  </Text>
                </Flex>
                <Text fontSize="var(--text-xs)" color="var(--color-text-muted)" lineClamp={1}>
                  {conversa.ultimaMensagem ?? "Nenhuma mensagem ainda"}
                </Text>
              </Box>
            </li>
          );
        })}
      </Box>
    </Box>
  );
}
