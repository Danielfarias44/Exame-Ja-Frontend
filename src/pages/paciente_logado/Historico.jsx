import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Container, Flex, Stack, Text } from "@chakra-ui/react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import ListSkeleton from "@/components/ui/Skeleton";
import { listAppointments } from "@/services/api";

function paraData(valor) {
  if (typeof valor === "string") return new Date(valor);
  if (valor?._seconds != null) return new Date(valor._seconds * 1000 + (valor._nanoseconds || 0) / 1e6);
  if (valor?.seconds != null) return new Date(valor.seconds * 1000 + (valor.nanoseconds || 0) / 1e6);
  return null;
}

function nomeDaClinica(agendamento) {
  return agendamento.clinicaNome ?? agendamento.nomeClinica ?? agendamento.clinica?.nomeFantasia ?? agendamento.clinica?.nome ?? `Clínica ${agendamento.clinicaUid}`;
}

export default function Historico() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [status, setStatus] = useState("loading");
  const [erro, setErro] = useState("");
  const [proximoCursor, setProximoCursor] = useState(null);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [temConcluidosEmPaginasFuturas, setTemConcluidosEmPaginasFuturas] = useState(false);

  const carregar = useCallback(async () => {
    const pagina = await listAppointments();
    setAgendamentos((pagina.agendamentos ?? []).filter((item) => item.status === "concluido"));
    setProximoCursor(pagina.proximoCursor ?? null);
    setTemConcluidosEmPaginasFuturas(Boolean(pagina.proximoCursor));
    setStatus("ready");
  }, []);

  async function carregarMais() {
    if (!proximoCursor || carregandoMais) return;
    setCarregandoMais(true);
    setErro("");
    try {
      let cursor = proximoCursor;
      let novosConcluidos = [];
      let proximo = null;
      // Avança páginas que contenham apenas solicitações ainda não concluídas,
      // até encontrar exames concluídos ou chegar ao fim do histórico.
      do {
        const pagina = await listAppointments({ cursor });
        novosConcluidos = (pagina.agendamentos ?? []).filter((item) => item.status === "concluido");
        proximo = pagina.proximoCursor ?? null;
        cursor = proximo;
      } while (cursor && novosConcluidos.length === 0);
      if (novosConcluidos.length) setAgendamentos((atuais) => [...atuais, ...novosConcluidos]);
      setProximoCursor(proximo);
      setTemConcluidosEmPaginasFuturas(Boolean(proximo));
    } catch (falha) {
      setErro(falha.message || "Não foi possível carregar mais registros.");
    } finally {
      setCarregandoMais(false);
    }
  }

  useEffect(() => {
    let ativo = true;
    carregar().catch((falha) => {
      if (!ativo) return;
      setErro(falha.message || "Não foi possível carregar o histórico.");
      setStatus("error");
    });
    return () => { ativo = false; };
  }, [carregar]);

  if (status === "loading") return <Container py={8}><ListSkeleton count={3} /></Container>;
  if (status === "error") return <Container py={8}><ErrorState title="Histórico indisponível" description={erro} onRetry={() => { setStatus("loading"); setErro(""); carregar().catch((falha) => { setErro(falha.message); setStatus("error"); }); }} /></Container>;

  return (
    <Container maxW="960px" px={{ base: 4, md: 6 }} py={8} pb={{ base: "110px", md: 12 }}>
      <PageHeader title="Histórico de exames" description="Consulte seus agendamentos concluídos e avalie o atendimento." />
      {agendamentos.length === 0
        ? <EmptyState title={proximoCursor ? "Nenhum exame concluído nesta página" : "Nenhum exame concluído"} description={proximoCursor ? "Ainda há outras páginas do histórico. Carregue mais para continuar procurando." : "Agendamentos concluídos pela clínica aparecerão aqui."} />
        : <Stack gap={4}>
          {agendamentos.map((item) => {
            const data = paraData(item.dataHora);
            return <Card key={item.id}><Flex justify="space-between" align={{ base: "stretch", sm: "center" }} direction={{ base: "column", sm: "row" }} gap={4}>
              <Stack gap={1}><Text fontWeight="bold">{item.nomeExame}</Text><Text fontSize="sm" color="var(--color-text-muted)">{data?.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })} · {nomeDaClinica(item)}</Text></Stack>
              <Flex gap={2} wrap="wrap"><Button asChild><Link to={`/paciente/avaliacao?id=${encodeURIComponent(item.id)}`}>Avaliar atendimento</Link></Button><Button asChild variant="outline"><Link to={`/estabelecimento/${encodeURIComponent(item.clinicaUid)}`}>Ver clínica</Link></Button></Flex>
            </Flex></Card>;
          })}
        </Stack>}
      {proximoCursor && <Button mt={4} variant="outline" onClick={carregarMais} disabled={carregandoMais}>{carregandoMais ? "Procurando exames concluídos..." : agendamentos.length === 0 || temConcluidosEmPaginasFuturas ? "Procurar mais exames concluídos" : "Carregar mais"}</Button>}
    </Container>
  );
}
