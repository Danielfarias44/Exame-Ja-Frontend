import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import Button from "@/components/ui/Button";
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
  const [erro, setErro] = useState("");
  const [proximoCursor, setProximoCursor] = useState(null);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const carregouTodasRef = useRef(false);

  const souCliente = participante.tipo === "cliente";

  const carregar = useCallback(async () => {
    try {
      const resultado = await listarConversas();
      setConversas((atuais) => {
        const idsRecentes = new Set(resultado.conversas.map((item) => item.id));
        const antigas = atuais.filter((item) => !idsRecentes.has(item.id));
        return [...resultado.conversas, ...antigas];
      });
      if (!resultado.proximoCursor) carregouTodasRef.current = true;
      if (!carregouTodasRef.current) setProximoCursor((atual) => atual ?? resultado.proximoCursor ?? null);
      setConversaAtivaId((atual) => atual ?? resultado.conversas[0]?.id ?? null);
      setErro("");
      setStatus("success");
    } catch (falha) {
      setErro(falha.message || "Verifique sua conexão e tente novamente.");
      setStatus((atual) => atual === "success" ? atual : "error");
    }
  }, []);

  const carregarMais = useCallback(async () => {
    if (!proximoCursor || carregandoMais) return;
    setCarregandoMais(true);
    try {
      const pagina = await listarConversas({ cursor: proximoCursor });
      setConversas((atuais) => {
        const ids = new Set(atuais.map((item) => item.id));
        return [...atuais, ...pagina.conversas.filter((item) => !ids.has(item.id))];
      });
      setProximoCursor(pagina.proximoCursor ?? null);
      if (!pagina.proximoCursor) carregouTodasRef.current = true;
      setErro("");
    } catch (falha) {
      setErro(falha.message || "Não foi possível carregar mais conversas.");
    } finally {
      setCarregandoMais(false);
    }
  }, [proximoCursor, carregandoMais]);

  useEffect(() => {
    carregar();
    const cancelar = assinarChat(() => carregar());
    const intervalo = window.setInterval(carregar, 10000);
    return () => {
      cancelar();
      window.clearInterval(intervalo);
    };
  }, [carregar]);

  useEffect(() => {
    if (conversaInicialId) {
      setConversaAtivaId(conversaInicialId);
      setAbertaNoCelular(true);
    }
  }, [conversaInicialId]);

  useEffect(() => {
    if (!conversaInicialId || conversas.some((item) => item.id === conversaInicialId) || !proximoCursor) return;
    carregarMais();
  }, [conversaInicialId, conversas, proximoCursor, carregarMais]);

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
    return <ErrorState title="Não foi possível carregar as conversas" description={erro} onRetry={carregar} />;
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
        <Flex justify="space-between" align="center" px="var(--space-4)" py="var(--space-3)" borderBottomWidth="var(--border-width)" borderBottomStyle="solid" borderBottomColor="var(--color-border-soft)">
        <Text
          fontSize="var(--text-xs)"
          color="var(--color-text-muted)"
        >
          {conversas.length} {conversas.length === 1 ? "conversa" : "conversas"}
        </Text>
        <Button variant="ghost" onClick={carregar}>Atualizar</Button>
        </Flex>
        {erro && <Text role="status" px="var(--space-4)" py="var(--space-2)" fontSize="var(--text-xs)" color="var(--color-error)">{erro} A lista exibida pode estar desatualizada.</Text>}
        <ConversationList
          conversas={conversas}
          conversaAtivaId={conversaAtiva.id}
          souCliente={souCliente}
          onSelecionar={selecionar}
        />
        {proximoCursor && <Box p="var(--space-3)"><Button w="100%" variant="outline" onClick={carregarMais} loading={carregandoMais}>Carregar mais conversas</Button></Box>}
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
