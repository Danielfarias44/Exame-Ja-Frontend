import { useRef, useState } from "react";
import { Flex, Stack } from "@chakra-ui/react";
import Button from "@/components/ui/Button";
import CampoTexto from "@/components/ui/CampoTexto";
import FeedbackErro from "@/components/ui/FeedbackErro";

export default function FormularioDecisao({ rotulo, ajuda, minimo = 10, maximo = 500, acoes, aoConfirmar }) {
  const [texto, setTexto] = useState("");
  const [erroCampo, setErroCampo] = useState("");
  const [erroEnvio, setErroEnvio] = useState("");
  const [enviando, setEnviando] = useState("");
  const campo = useRef(null);

  async function executar(acao) {
    const valor = texto.trim();
    if (acao.exigeTexto && valor.length < minimo) {
      setErroCampo(`Escreva pelo menos ${minimo} caracteres para ${acao.verbo}.`);
      campo.current?.focus();
      return;
    }
    setErroCampo("");
    setErroEnvio("");
    setEnviando(acao.valor);
    try {
      await aoConfirmar(acao.valor, valor);
    } catch (falha) {
      setErroEnvio(falha.message || "Não foi possível registrar a decisão.");
      setEnviando("");
    }
  }

  return (
    <Stack gap="var(--space-3)">
      <CampoTexto
        ref={campo}
        multiline
        label={rotulo}
        helperText={ajuda}
        value={texto}
        maxLength={maximo}
        error={erroCampo}
        onChange={(evento) => {
          setTexto(evento.target.value);
          if (erroCampo) setErroCampo("");
        }}
      />
      <FeedbackErro mensagem={erroEnvio} titulo="Não foi possível registrar a decisão" />
      <Flex gap="var(--space-2)" wrap="wrap">
        {acoes.map((acao) => (
          <Button
            key={acao.valor}
            variant={acao.variante || "primary"}
            disabled={Boolean(enviando)}
            onClick={() => executar(acao)}
          >
            {enviando === acao.valor ? acao.rotuloEnviando : acao.rotulo}
          </Button>
        ))}
      </Flex>
    </Stack>
  );
}
