import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button, Container, Flex, Stack, Text } from "@chakra-ui/react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import ListSkeleton from "@/components/ui/Skeleton";
import ConfirmacaoInline from "@/components/ui/ConfirmacaoInline";
import { rotuloStatusAgendamento } from "@/utils/statusAgendamento";
import { listAppointments, updateAppointment } from "@/services/api";

function paraData(valor) {
  if (typeof valor === "string") return new Date(valor);
  if (valor?._seconds != null) return new Date(valor._seconds * 1000 + (valor._nanoseconds || 0) / 1e6);
  if (valor?.seconds != null) return new Date(valor.seconds * 1000 + (valor.nanoseconds || 0) / 1e6);
  return null;
}

function nomeDaClinica(agendamento) {
  return agendamento.clinicaNome ?? agendamento.nomeClinica ?? agendamento.clinica?.nomeFantasia ?? agendamento.clinica?.nome ?? `Clínica ${agendamento.clinicaUid}`;
}

export default function MeusAgendamentos() {
  const [params] = useSearchParams();
  const [agendamentos, setAgendamentos] = useState([]);
  const [status, setStatus] = useState("loading");
  const [erro, setErro] = useState("");
  const [acaoAtiva, setAcaoAtiva] = useState("");
  const [confirmando, setConfirmando] = useState("");
  const [proximoCursor, setProximoCursor] = useState(null);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const recemCriado = params.get("novo") === "1";

  const carregar = useCallback(async () => {
    const pagina = await listAppointments();
    setAgendamentos(pagina.agendamentos ?? []);
    setProximoCursor(pagina.proximoCursor ?? null);
    setStatus("ready");
  }, []);

  async function carregarMais() {
    if (!proximoCursor || carregandoMais) return;
    setCarregandoMais(true);
    setErro("");
    try {
      const pagina = await listAppointments({ cursor: proximoCursor });
      setAgendamentos((atuais) => [...atuais, ...(pagina.agendamentos ?? [])]);
      setProximoCursor(pagina.proximoCursor ?? null);
    } catch (falha) {
      setErro(falha.message || "Não foi possível carregar mais agendamentos.");
    } finally {
      setCarregandoMais(false);
    }
  }

  useEffect(() => {
    let ativo = true;
    carregar().catch((falha) => {
      if (!ativo) return;
      setErro(falha.message || "Não foi possível carregar seus agendamentos.");
      setStatus("error");
    });
    return () => { ativo = false; };
  }, [carregar]);

  async function cancelar(id) {
    setAcaoAtiva(id);
    setErro("");
    try {
      await updateAppointment(id, { acao: "cancelar" });
      setConfirmando("");
      await carregar();
    } catch (falha) {
      setErro(falha.message || "Não foi possível cancelar o agendamento.");
    } finally {
      setAcaoAtiva("");
    }
  }

  if (status === "loading") return <Container py={8}><ListSkeleton count={3} /></Container>;
  if (status === "error") return <Container py={8}><ErrorState title="Agendamentos indisponíveis" description={erro} onRetry={() => { setStatus("loading"); setErro(""); carregar().catch((falha) => { setErro(falha.message); setStatus("error"); }); }} /></Container>;

  return (
    <Container maxW="960px" px={{ base: 4, md: 6 }} py={8} pb={{ base: "110px", md: 12 }}>
      <PageHeader title="Meus agendamentos" description="Acompanhe as solicitações e os horários confirmados pelas clínicas." actions={<Flex gap={2} wrap="wrap"><Button asChild variant="outline"><Link to="/paciente/historico">Histórico</Link></Button><Button asChild><Link to="/busca">Buscar exames</Link></Button></Flex>} />
      {recemCriado && <Text role="status" color="var(--color-success)" mb={4}>Solicitação enviada. Ela ficará pendente até a clínica responder.</Text>}
      {erro && <Text role="alert" color="var(--color-error)" mb={4}>{erro}</Text>}
      {agendamentos.length === 0
        ? <EmptyState title="Você ainda não tem agendamentos" description="Encontre uma oferta e solicite um horário disponível." />
        : <Stack as="ul" listStyle="none" p={0} gap={4}>
          {agendamentos.map((agendamento) => {
            const data = paraData(agendamento.dataHora);
            const podeCancelar = ["pendente", "confirmado"].includes(agendamento.status);
            return <li key={agendamento.id}><Card><Flex justify="space-between" align={{ base: "stretch", sm: "center" }} direction={{ base: "column", sm: "row" }} gap={4}>
              <Stack gap={1}>
                <Text fontWeight="var(--weight-bold)">{agendamento.nomeExame}</Text>
                <Text fontSize="var(--text-xs)" color="var(--color-text-muted)">{data && !Number.isNaN(data.getTime()) ? data.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" }) : "Horário não informado"}</Text>
                <Text fontSize="var(--text-xs)" color="var(--color-text-muted)">Clínica: {nomeDaClinica(agendamento)}</Text>
                <Text fontSize="var(--text-xs)">{rotuloStatusAgendamento(agendamento.status)}{agendamento.motivo ? ` · ${agendamento.motivo}` : ""}</Text>
              </Stack>
              {podeCancelar && confirmando !== agendamento.id && <Button type="button" variant="outline" colorPalette="red" disabled={Boolean(acaoAtiva)} onClick={() => setConfirmando(agendamento.id)}>Cancelar solicitação</Button>}
            </Flex>
            {confirmando === agendamento.id && <Stack mt={4}><ConfirmacaoInline pergunta="Cancelar este agendamento? A clínica será avisada e o horário pode voltar a ficar disponível." rotuloConfirmar="Sim, cancelar" rotuloEnviando="Cancelando…" rotuloVoltar="Manter agendamento" ocupado={acaoAtiva === agendamento.id} onConfirmar={() => cancelar(agendamento.id)} onCancelar={() => setConfirmando("")} /></Stack>}
            </Card></li>;
          })}
        </Stack>}
      {proximoCursor && <Button mt={4} variant="outline" onClick={carregarMais} disabled={carregandoMais}>{carregandoMais ? "Carregando..." : "Carregar mais"}</Button>}
    </Container>
  );
}
