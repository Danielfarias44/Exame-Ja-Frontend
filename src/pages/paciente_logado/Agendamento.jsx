import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button, Container, Stack, Text } from "@chakra-ui/react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import ErrorState from "@/components/ui/ErrorState";
import ListSkeleton from "@/components/ui/Skeleton";
import FeedbackErro from "@/components/ui/FeedbackErro";
import { createAppointment, getClinicAvailability, getEstablishment } from "@/services/api";

function janelaDisponibilidade() {
  const inicio = new Date((Math.floor(Date.now() / 60000) + 1) * 60000);
  const fim = new Date(inicio.getTime() + 30 * 24 * 60 * 60 * 1000);
  return { inicio: inicio.toISOString(), fim: fim.toISOString() };
}

function formatarHorario(valor) {
  return new Date(valor).toLocaleString("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function Agendamento() {
  const [params] = useSearchParams();
  const navegar = useNavigate();
  const clinicaUid = params.get("clinicaId") || "";
  const codigoExame = params.get("codigoExame") || "";
  const nomeExame = params.get("nomeExame") || "";
  const [clinica, setClinica] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [horarioSelecionado, setHorarioSelecionado] = useState("");
  const [status, setStatus] = useState("loading");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let ativo = true;
    if (!clinicaUid || !nomeExame) return () => { ativo = false; };

    const intervalo = janelaDisponibilidade();
    Promise.allSettled([
      getEstablishment(clinicaUid),
      getClinicAvailability(clinicaUid, intervalo),
    ]).then(async ([detalhesResultado, disponibilidadeResultado]) => {
      if (!ativo) return;
      if (disponibilidadeResultado.status === "rejected") throw disponibilidadeResultado.reason;
      const detalhes = detalhesResultado.status === "fulfilled" ? detalhesResultado.value : null;
      setClinica(detalhes?.clinic ?? null);
      const primeiraPagina = disponibilidadeResultado.value;
      let slots = primeiraPagina.horarios ?? [];
      let cursor = primeiraPagina.proximoCursor;
      while (cursor) {
        const pagina = await getClinicAvailability(clinicaUid, { ...intervalo, cursor });
        slots = slots.concat(pagina.horarios ?? []);
        cursor = pagina.proximoCursor;
      }
      if (!ativo) return;
      setHorarios(slots);
      setStatus("ready");
    }).catch((falha) => {
      if (!ativo) return;
      setErro(falha.message || "Não foi possível carregar os horários disponíveis.");
      setStatus("error");
    });
    return () => { ativo = false; };
  }, [clinicaUid, nomeExame]);

  async function enviarSolicitacao(evento) {
    evento.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      await createAppointment({
        clinicaUid,
        nomeExame,
        ...(codigoExame ? { codigoExame } : {}),
        dataHora: horarioSelecionado,
      });
      navegar("/paciente/agendamentos?novo=1", { replace: true });
    } catch (falha) {
      setErro(falha.message || "Não foi possível solicitar este horário.");
      setEnviando(false);
    }
  }

  if (!clinicaUid || !nomeExame) return <Container py={8}><ErrorState title="Agendamento inválido" description="Abra esta tela a partir de uma oferta de exame para escolher a clínica e o exame." /></Container>;
  if (status === "loading") return <Container py={8}><ListSkeleton count={2} /></Container>;
  if (status === "error") return <Container py={8}><ErrorState title="Não foi possível carregar o agendamento" description={erro} /></Container>;

  return (
    <Container maxW="760px" px={{ base: 4, md: 6 }} py={8} pb={{ base: "110px", md: 12 }}>
      <PageHeader title="Solicitar agendamento" description="Escolha um horário publicado pela clínica. A solicitação ficará pendente até a confirmação da unidade." />
      <Card>
        <Stack as="form" onSubmit={enviarSolicitacao} gap={4}>
          <Text fontWeight="bold">{clinica?.nomeFantasia || `Clínica ${clinicaUid}`}</Text>
          <Text color="var(--color-text-muted)">{nomeExame}{codigoExame ? ` · TUSS ${codigoExame}` : ""}</Text>
          <label htmlFor="horarioAgendamento">Horários disponíveis</label>
          <select id="horarioAgendamento" value={horarioSelecionado} onChange={(evento) => setHorarioSelecionado(evento.target.value)} required>
            <option value="">Selecione um horário</option>
            {horarios.map(({ dataHora }) => <option key={dataHora} value={dataHora}>{formatarHorario(dataHora)}</option>)}
          </select>
          {horarios.length === 0 && <Text color="var(--color-text-muted)">A clínica não publicou horários disponíveis nos próximos 30 dias.</Text>}
          <FeedbackErro mensagem={erro} titulo="Não foi possível solicitar o horário" />
          <Button type="submit" disabled={!horarioSelecionado || enviando}>{enviando ? "Enviando solicitação..." : "Solicitar horário"}</Button>
        </Stack>
      </Card>
    </Container>
  );
}
