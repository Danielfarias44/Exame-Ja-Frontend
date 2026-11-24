import { useId, useState } from "react";
import { Box, Flex, Text, Textarea } from "@chakra-ui/react";
import Button from "@/components/ui/Button";

export default function MessageComposer({ destinatario, limite, onEnviar }) {
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const idCampo = useId();
  const idContador = useId();
  const idErro = useId();

  const tamanho = texto.trim().length;
  const passouDoLimite = tamanho > limite;

  async function enviar() {
    if (enviando) return;
    if (tamanho === 0) {
      setErro("Escreva uma mensagem antes de enviar.");
      return;
    }
    if (passouDoLimite) {
      setErro(`A mensagem pode ter no máximo ${limite} caracteres.`);
      return;
    }
    setEnviando(true);
    setErro("");
    try {
      await onEnviar(texto);
      setTexto("");
    } catch (falha) {
      setErro(falha.message || "Não foi possível enviar. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    enviar();
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      enviar();
    }
  }

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      p="var(--space-4)"
      borderTopWidth="var(--border-width)"
      borderTopStyle="solid"
      borderTopColor="var(--color-border-soft)"
      bg="var(--color-surface)"
    >
      <Text
        as="label"
        htmlFor={idCampo}
        display="block"
        mb="var(--space-2)"
        fontFamily="var(--font-heading)"
        fontWeight="var(--weight-semibold)"
        fontSize="var(--text-sm)"
        color="var(--color-text)"
      >
        Mensagem para {destinatario}
      </Text>
      <Flex gap="var(--space-3)" align="flex-end" direction={{ base: "column", sm: "row" }}>
        <Textarea
          id={idCampo}
          value={texto}
          onChange={(event) => {
            setTexto(event.target.value);
            if (erro) setErro("");
          }}
          onKeyDown={handleKeyDown}
          rows={2}
          resize="vertical"
          aria-invalid={Boolean(erro) || passouDoLimite}
          aria-describedby={erro ? `${idContador} ${idErro}` : idContador}
          bg="var(--color-surface)"
          color="var(--color-text)"
          fontFamily="var(--font-body)"
          fontSize="var(--text-sm)"
          borderWidth="var(--border-width-strong)"
          borderColor={erro || passouDoLimite ? "var(--color-error)" : "var(--color-border)"}
          borderRadius="var(--radius-md)"
          _focusVisible={{
            outline: "var(--border-width-strong) solid var(--color-focus)",
            outlineOffset: "2px",
            borderColor: "var(--color-focus)",
          }}
        />
        <Button type="submit" loading={enviando} loadingText="Enviando" w={{ base: "100%", sm: "auto" }}>
          Enviar
        </Button>
      </Flex>
      <Flex justify="space-between" gap="var(--space-3)" mt="var(--space-2)" wrap="wrap">
        <Text id={idContador} fontSize="var(--text-xs)" color="var(--color-text-muted)">
          Enter envia, Shift+Enter quebra a linha.{" "}
          <Text as="span" color={passouDoLimite ? "var(--color-error)" : undefined}>
            {tamanho} de {limite} caracteres
          </Text>
        </Text>
        {erro && (
          <Text id={idErro} role="alert" fontSize="var(--text-xs)" color="var(--color-error)">
            {erro}
          </Text>
        )}
      </Flex>
    </Box>
  );
}
