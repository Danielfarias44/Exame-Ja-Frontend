import { useCallback, useEffect, useState } from "react";
import { Box, Grid, Text } from "@chakra-ui/react";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import ListSkeleton from "@/components/ui/Skeleton";
import ConversationList from "@/components/chat/ConversationList";
import ChatThread from "@/components/chat/ChatThread";
import { assinarChat, listarConversas } from "@/services/chatService";

export default function ChatPanel({ participante, conversaInicialId, vazio }) {
  const [conversas, setConversas] = useState([]);
  const [status, setStatus] = useState("loading");
  const [conversaAtivaId, setConversaAtivaId] = useState(conversaInicialId ?? null);
  const [abertaNoCelular, setAbertaNoCelular] = useState(Boolean(conversaInicialId));
  const [escolhidaPelaPessoa, setEscolhidaPelaPessoa] = useState(false);

  const souCliente = participante.tipo === "cliente";

  const carregar = useCallback(() => {
    return listarConversas()
      .then((resultado) => {
        setConversas(resultado.conversas);
        setConversaAtivaId((atual) => atual ?? resultado.conversas[0]?.id ?? null);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, []);

  useEffect(() => {
    carregar();
    return assinarChat(() => carregar());
  }, [carregar]);

  useEffect(() => {
    if (conversaInicialId) {
      setConversaAtivaId(conversaInicialId);
      setAbertaNoCelular(true);
    }
  }, [conversaInicialId]);

  function selecionar(id) {
    setConversaAtivaId(id);
    setAbertaNoCelular(true);
    setEscolhidaPelaPessoa(true);
  }

  function voltarParaLista() {
    setAbertaNoCelular(false);
    requestAnimationFrame(() => {
      document.getElementById(`conversa-${conversaAtivaId}`)?.focus();
    });
  }

  if (status === "loading") return <ListSkeleton count={2} />;
  if (status === "error") {
    return <ErrorState title="Não foi possível carregar as conversas" />;
  }
  if (conversas.length === 0) {
    return (
      <EmptyState
        title={vazio?.title ?? "Nenhuma conversa ainda"}
        description={vazio?.description}
        action={vazio?.action}
      />
    );
  }

  const conversaAtiva = conversas.find((conversa) => conversa.id === conversaAtivaId) ?? conversas[0];

  return (
    <Grid
      templateColumns={{ base: "1fr", lg: "minmax(16rem, 1fr) minmax(0, 2fr)" }}
      h={{ base: "auto", lg: "var(--chat-height)" }}
      bg="var(--color-surface)"
      borderWidth="var(--border-width)"
      borderStyle="solid"
      borderColor="var(--color-border-soft)"
      borderRadius="var(--radius-lg)"
      boxShadow="var(--shadow-sm)"
      overflow="hidden"
    >
      <Box
        display={{ base: abertaNoCelular ? "none" : "block", lg: "block" }}
        borderRightWidth={{ lg: "var(--border-width)" }}
        borderRightStyle="solid"
        borderRightColor="var(--color-border-soft)"
        overflowY="auto"
        minH={0}
      >
        <Text
          px="var(--space-4)"
          py="var(--space-3)"
          fontSize="var(--text-xs)"
          color="var(--color-text-muted)"
          borderBottomWidth="var(--border-width)"
          borderBottomStyle="solid"
          borderBottomColor="var(--color-border-soft)"
        >
          {conversas.length} {conversas.length === 1 ? "conversa" : "conversas"}
        </Text>
        <ConversationList
          conversas={conversas}
          conversaAtivaId={conversaAtiva.id}
          souCliente={souCliente}
          onSelecionar={selecionar}
        />
      </Box>

      <Box display={{ base: abertaNoCelular ? "block" : "none", lg: "block" }} h={{ lg: "100%" }} minH={0}>
        <ChatThread
          key={conversaAtiva.id}
          conversa={conversaAtiva}
          participante={participante}
          focarAoAbrir={escolhidaPelaPessoa}
          onVoltar={voltarParaLista}
        />
      </Box>
    </Grid>
  );
}
