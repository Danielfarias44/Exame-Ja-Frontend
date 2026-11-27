import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import { LuArrowLeft } from "react-icons/lu";
import Button from "@/components/ui/Button";
import SectionTitle from "@/components/ui/SectionTitle";
import ErrorState from "@/components/ui/ErrorState";
import MessageBubble from "@/components/chat/MessageBubble";
import MessageComposer from "@/components/chat/MessageComposer";
import {
  LIMITE_TEXTO_MENSAGEM,
  assinarChat,
  enviarMensagem,
  listarMensagens,
} from "@/services/chatService";

function adicionarSemRepetir(lista, mensagem) {
  return lista.some((item) => item.id === mensagem.id) ? lista : [...lista, mensagem];
}

export default function ChatThread({ conversa, participante, focarAoAbrir, onVoltar }) {
  const [mensagens, setMensagens] = useState([]);
  const [proximoCursor, setProximoCursor] = useState(null);
  const [status, setStatus] = useState("loading");
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);
  const [carregandoAntigas, setCarregandoAntigas] = useState(false);
  const areaRef = useRef(null);
  const tituloRef = useRef(null);
  const rolarParaFimRef = useRef(true);

  const souCliente = participante.tipo === "cliente";
  const outraParte = souCliente ? conversa.clinicaNome : conversa.clienteNome;

  useEffect(() => {
    let ativo = true;
    setStatus("loading");
    setErro("");
    rolarParaFimRef.current = true;
    listarMensagens(conversa.id)
      .then((resultado) => {
        if (!ativo) return;
        setMensagens([...resultado.mensagens].reverse());
        setProximoCursor(resultado.proximoCursor);
        setStatus("success");
      })
      .catch((falha) => {
        if (!ativo) return;
        setErro(falha.message || "Verifique sua conexão e tente novamente.");
        setStatus("error");
      });

    const cancelar = assinarChat((evento) => {
      if (evento.tipo !== "nova-mensagem" || evento.conversaId !== conversa.id) return;
      rolarParaFimRef.current = true;
      setMensagens((atuais) => adicionarSemRepetir(atuais, evento.mensagem));
    });
    const intervalo = window.setInterval(() => {
      listarMensagens(conversa.id)
        .then((resultado) => {
          if (!ativo) return;
          setErro("");
          setMensagens((atuais) => [...resultado.mensagens].reverse().reduce(
            (lista, mensagem) => adicionarSemRepetir(lista, mensagem),
            atuais
          ));
        })
        .catch((falha) => {
          if (ativo) setErro(falha.message || "Não foi possível atualizar as mensagens.");
        });
    }, 10000);

    return () => {
      ativo = false;
      cancelar();
      window.clearInterval(intervalo);
    };
  }, [conversa.id, tentativa]);

  useEffect(() => {
    if (focarAoAbrir) tituloRef.current?.focus();
  }, [conversa.id, focarAoAbrir]);

  useLayoutEffect(() => {
    if (rolarParaFimRef.current && areaRef.current) {
      areaRef.current.scrollTop = areaRef.current.scrollHeight;
    }
  }, [mensagens]);

  async function carregarAntigas() {
    if (!proximoCursor) return;
    setCarregandoAntigas(true);
    rolarParaFimRef.current = false;
    const area = areaRef.current;
    const alturaAntes = area?.scrollHeight ?? 0;
    try {
      const resultado = await listarMensagens(conversa.id, { cursor: proximoCursor });
      setErro("");
      setMensagens((atuais) => [...[...resultado.mensagens].reverse(), ...atuais]);
      setProximoCursor(resultado.proximoCursor);
      requestAnimationFrame(() => {
        if (area) area.scrollTop = area.scrollHeight - alturaAntes;
      });
    } catch (falha) {
      setErro(falha.message || "Não foi possível carregar as mensagens anteriores.");
    } finally {
      setCarregandoAntigas(false);
    }
  }

  async function enviar(texto) {
    const mensagem = await enviarMensagem(conversa.id, texto);
    rolarParaFimRef.current = true;
    setMensagens((atuais) => adicionarSemRepetir(atuais, mensagem));
  }

  return (
    <Flex direction="column" h="100%" minH={0}>
      <Flex
        align="center"
        gap="var(--space-2)"
        px="var(--space-4)"
        py="var(--space-3)"
        borderBottomWidth="var(--border-width)"
        borderBottomStyle="solid"
        borderBottomColor="var(--color-border-soft)"
      >
        <Box display={{ base: "block", lg: "none" }}>
          <Button variant="ghost" px="var(--space-2)" onClick={onVoltar} aria-label="Voltar para as conversas">
            <LuArrowLeft aria-hidden="true" />
            Conversas
          </Button>
        </Box>
        <SectionTitle ref={tituloRef} tabIndex={-1} fontSize="var(--text-base)" _focusVisible={{ outline: "none" }}>
          {outraParte}
        </SectionTitle>
      </Flex>

      <Box
        ref={areaRef}
        flex="1"
        minH={0}
        h={{ base: "var(--chat-height)", lg: "auto" }}
        overflowY="auto"
        px="var(--space-4)"
        py="var(--space-4)"
        bg="var(--color-bg)"
        role="log"
        aria-busy={status === "loading"}
        aria-label={`Mensagens com ${outraParte}`}
        tabIndex={0}
        _focusVisible={{ outline: "var(--border-width-strong) solid var(--color-focus)", outlineOffset: "calc(var(--focus-offset) * -1)" }}
      >
        {status === "loading" && (
          <Text fontSize="var(--text-sm)" color="var(--color-text-muted)">
            Carregando mensagens...
          </Text>
        )}
        {erro && <Box role="alert" mb="var(--space-3)"><ErrorState title={status === "error" ? "Não foi possível abrir a conversa" : "Problema ao atualizar a conversa"} description={erro} onRetry={() => { setErro(""); setTentativa((atual) => atual + 1); }} /></Box>}
        {status === "success" && (
          <Stack gap="var(--space-3)">
            {proximoCursor && (
              <Box alignSelf="center">
                <Button variant="outline" onClick={carregarAntigas} loading={carregandoAntigas}>
                  Carregar mensagens anteriores
                </Button>
              </Box>
            )}
            {mensagens.length === 0 ? (
              <Text fontSize="var(--text-sm)" color="var(--color-text-muted)" textAlign="center">
                {souCliente
                  ? "Escreva sua dúvida sobre exames, convênios ou horários."
                  : "Nenhuma mensagem nesta conversa ainda."}
              </Text>
            ) : (
              <Stack as="ul" role="list" gap="var(--space-3)" m={0} p={0} listStyleType="none">
                {mensagens.map((mensagem) => (
                  <MessageBubble
                    key={mensagem.id}
                    mensagem={mensagem}
                    minha={mensagem.remetenteUid === participante.uid}
                    nomeRemetente={outraParte}
                  />
                ))}
              </Stack>
            )}
          </Stack>
        )}
      </Box>

      <MessageComposer destinatario={outraParte} limite={LIMITE_TEXTO_MENSAGEM} onEnviar={enviar} />
    </Flex>
  );
}
