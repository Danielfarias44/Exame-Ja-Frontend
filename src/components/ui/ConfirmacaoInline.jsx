import { useEffect, useId, useRef, useState } from "react";
import { Flex, Stack, Text } from "@chakra-ui/react";
import Button from "@/components/ui/Button";
import CampoTexto from "@/components/ui/CampoTexto";

export default function ConfirmacaoInline({
  pergunta,
  rotuloConfirmar,
  rotuloEnviando = "Enviando…",
  rotuloVoltar = "Voltar",
  motivo,
  ocupado = false,
  focarAoAbrir = true,
  onConfirmar,
  onCancelar,
}) {
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState("");
  const idPergunta = useId();
  const primeiroFoco = useRef(null);

  useEffect(() => {
    if (focarAoAbrir) primeiroFoco.current?.focus();
  }, [focarAoAbrir]);

  function confirmar() {
    const valor = texto.trim();
    if (motivo && valor.length < (motivo.minimo ?? 1)) {
      setErro(`Escreva pelo menos ${motivo.minimo ?? 1} caracteres.`);
      primeiroFoco.current?.focus();
      return;
    }
    onConfirmar(motivo ? valor : undefined);
  }

  return (
    <Stack
      role="group"
      aria-labelledby={idPergunta}
      gap="var(--space-3)"
      p="var(--space-4)"
      bg="var(--color-warning-soft)"
      borderWidth="var(--border-width)"
      borderStyle="solid"
      borderColor="var(--color-warning)"
      borderRadius="var(--radius-md)"
    >
      <Text id={idPergunta} fontSize="var(--text-sm)" fontWeight="var(--weight-bold)" color="var(--color-text)">
        {pergunta}
      </Text>
      {motivo && (
        <CampoTexto
          ref={primeiroFoco}
          multiline
          label={motivo.rotulo}
          helperText={motivo.ajuda}
          maxLength={motivo.maximo}
          value={texto}
          error={erro}
          onChange={(evento) => {
            setTexto(evento.target.value);
            if (erro) setErro("");
          }}
        />
      )}
      <Flex gap="var(--space-2)" wrap="wrap">
        <Button ref={motivo ? undefined : primeiroFoco} onClick={confirmar} disabled={ocupado}>
          {ocupado ? rotuloEnviando : rotuloConfirmar}
        </Button>
        <Button variant="outline" onClick={onCancelar} disabled={ocupado}>{rotuloVoltar}</Button>
      </Flex>
    </Stack>
  );
}
