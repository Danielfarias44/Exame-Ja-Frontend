import { Box, Text } from "@chakra-ui/react";
import { formatarHorarioCompleto, formatarHorarioCurto } from "@/utils/formatarHorario";

export default function MessageBubble({ mensagem, minha, nomeRemetente }) {
  return (
    <Box
      as="li"
      alignSelf={minha ? "flex-end" : "flex-start"}
      maxW={{ base: "85%", md: "70%" }}
      px="var(--space-4)"
      py="var(--space-3)"
      borderRadius="var(--radius-lg)"
      borderBottomRightRadius={minha ? "var(--radius-sm)" : "var(--radius-lg)"}
      borderBottomLeftRadius={minha ? "var(--radius-lg)" : "var(--radius-sm)"}
      bg={minha ? "var(--color-primary)" : "var(--color-surface)"}
      color={minha ? "var(--color-text-on-primary)" : "var(--color-text)"}
      borderWidth="var(--border-width)"
      borderStyle="solid"
      borderColor={minha ? "var(--color-primary)" : "var(--color-border-soft)"}
      boxShadow="var(--shadow-sm)"
    >
      <Text
        as="span"
        display="block"
        fontFamily="var(--font-heading)"
        fontWeight="var(--weight-semibold)"
        fontSize="var(--text-xs)"
        mb="var(--space-1)"
      >
        {minha ? "Você" : nomeRemetente}
      </Text>
      <Text fontSize="var(--text-sm)" whiteSpace="pre-wrap" overflowWrap="anywhere">
        {mensagem.texto}
      </Text>
      <Text
        as="time"
        display="block"
        dateTime={mensagem.criadoEm}
        title={formatarHorarioCompleto(mensagem.criadoEm)}
        mt="var(--space-1)"
        fontSize="var(--text-xs)"
        textAlign="right"
      >
        {formatarHorarioCurto(mensagem.criadoEm)}
      </Text>
    </Box>
  );
}
