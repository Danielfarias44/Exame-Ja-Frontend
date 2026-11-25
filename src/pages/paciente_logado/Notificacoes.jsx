import { useEffect, useState } from "react";
import { Container, Flex, Stack, Text } from "@chakra-ui/react";
import { apiRequest, apiRequestWithCsrf } from "@/services/httpClient";
import PageHeader from "@/components/ui/PageHeader";
import SectionTitle from "@/components/ui/SectionTitle";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import StatusBadge from "@/components/ui/StatusBadge";

function dataLegivel(valor) {
  const data = typeof valor === "string" ? new Date(valor)
    : Number.isFinite(valor?._seconds) ? new Date(valor._seconds * 1000)
      : Number.isFinite(valor?.seconds) ? new Date(valor.seconds * 1000) : null;
  return data && Number.isFinite(data.getTime()) ? data.toLocaleString("pt-BR") : "";
}

export default function Notificacoes() {
  const [notificacoes, setNotificacoes] = useState([]);
  const [status, setStatus] = useState("loading");
  const [erro, setErro] = useState("");
  const [idAtualizando, setIdAtualizando] = useState(null);
  const [proximoCursor, setProximoCursor] = useState(null);
  const [carregandoMais, setCarregandoMais] = useState(false);

  useEffect(() => {
    let ativo = true;
    apiRequest("/api/users/notifications?limit=50")
      .then((resultado) => {
        if (!ativo) return;
        setNotificacoes(resultado.notificacoes ?? []);
        setProximoCursor(resultado.proximoCursor ?? null);
        setStatus("ready");
      })
      .catch((falha) => {
        if (!ativo) return;
        setErro(falha.message);
        setStatus("error");
      });
    return () => { ativo = false; };
  }, []);

  async function marcarComoLida(item) {
    setIdAtualizando(item.id);
    setErro("");
    try {
      await apiRequestWithCsrf(`/api/users/notifications/${encodeURIComponent(item.id)}/read`, "PATCH", {});
      setNotificacoes((atuais) => atuais.map((notificacao) => notificacao.id === item.id ? { ...notificacao, lida: true } : notificacao));
      window.dispatchEvent(new Event("exameja:notificacoes-atualizadas"));
    } catch (falha) {
      setErro(falha.message || "Não foi possível atualizar esta notificação.");
    } finally {
      setIdAtualizando(null);
    }
  }

  async function carregarMais() {
    if (!proximoCursor || carregandoMais) return;
    setCarregandoMais(true);
    setErro("");
    try {
      const params = new URLSearchParams({ limit: "50", cursor: proximoCursor });
      const resultado = await apiRequest(`/api/users/notifications?${params}`);
      setNotificacoes((atuais) => [...atuais, ...(resultado.notificacoes ?? [])]);
      setProximoCursor(resultado.proximoCursor ?? null);
    } catch (falha) {
      setErro(falha.message || "Não foi possível carregar mais notificações.");
    } finally {
      setCarregandoMais(false);
    }
  }

  const naoLidas = notificacoes.filter((item) => !item.lida).length;
  if (status === "loading") return <Container py={8}><Text>Carregando notificações...</Text></Container>;
  if (status === "error") return <Container py={8}><ErrorState title="Não foi possível carregar as notificações" description={erro} /></Container>;

  return (
    <Container maxW="880px" px={{ base: 4, md: 6 }} py={{ base: 6, md: 8 }} pb={{ base: "110px", md: 12 }}>
      <PageHeader title="Notificações" description="Avisos enviados pelo backend para sua conta." badge={naoLidas > 0 && <StatusBadge solid>{naoLidas} {naoLidas === 1 ? "não lida" : "não lidas"}</StatusBadge>} />
      {erro && <Text role="alert" color="var(--color-error)" mt={4}>{erro}</Text>}
      {notificacoes.length === 0 ? <EmptyState title="Nenhuma notificação" description="Novos avisos da sua conta aparecerão aqui." /> : (
        <Stack gap="var(--space-4)" mt={5}>
          {notificacoes.map((item) => (
            <Card key={item.id} borderWidth="var(--border-width-strong)" borderColor={item.lida ? "var(--color-border-soft)" : "var(--color-primary)"}>
              <Flex justify="space-between" align={{ base: "flex-start", sm: "center" }} direction={{ base: "column", sm: "row" }} gap="var(--space-3)">
                <Stack gap="var(--space-1)">
                  <Flex align="center" gap="var(--space-2)" wrap="wrap">
                    {!item.lida && <StatusBadge>Não lida</StatusBadge>}
                    <SectionTitle fontSize="var(--text-base)">{item.titulo}</SectionTitle>
                    <Text fontSize="var(--text-xs)" color="var(--color-text-muted)">{dataLegivel(item.criadoEm)}</Text>
                  </Flex>
                  <Text fontSize="var(--text-sm)" color="var(--color-text-muted)">{item.mensagem}</Text>
                  {item.motivo && <Text fontSize="var(--text-sm)">Motivo: {item.motivo}</Text>}
                </Stack>
                {!item.lida && <Button variant="outline" disabled={idAtualizando === item.id} onClick={() => marcarComoLida(item)}>{idAtualizando === item.id ? "Atualizando..." : "Marcar como lida"}</Button>}
              </Flex>
            </Card>
          ))}
          {proximoCursor && <Button variant="outline" onClick={carregarMais} disabled={carregandoMais}>{carregandoMais ? "Carregando..." : "Carregar mais"}</Button>}
        </Stack>
      )}
    </Container>
  );
}
