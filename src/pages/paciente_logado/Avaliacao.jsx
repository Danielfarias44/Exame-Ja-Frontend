import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button, Container, Stack, Text, Textarea } from "@chakra-ui/react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import ErrorState from "@/components/ui/ErrorState";
import ListSkeleton from "@/components/ui/Skeleton";
import FeedbackErro from "@/components/ui/FeedbackErro";
import { createReview, getAppointment } from "@/services/api";

export default function Avaliacao() {
  const [params] = useSearchParams();
  const navegar = useNavigate();
  const agendamentoId = params.get("id") || "";
  const [agendamento, setAgendamento] = useState(null);
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState("");
  const [status, setStatus] = useState("loading");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [jaAvaliado, setJaAvaliado] = useState(false);

  useEffect(() => {
    let ativo = true;
    if (!agendamentoId) return () => { ativo = false; };
    getAppointment(agendamentoId).then((resposta) => {
      if (!ativo) return;
      const dados = resposta.agendamento ?? resposta;
      if (dados.status !== "concluido") throw new Error("Só é possível avaliar agendamentos concluídos.");
      setAgendamento(dados);
      const avaliacaoExistente = dados.avaliacao ?? dados.review;
      if (dados.avaliado === true || dados.avaliacaoId || dados.reviewId || avaliacaoExistente) {
        setJaAvaliado(true);
      }
      setStatus("ready");
    }).catch((falha) => {
      if (!ativo) return;
      setErro(falha.message || "Não foi possível carregar o agendamento.");
      setStatus("error");
    });
    return () => { ativo = false; };
  }, [agendamentoId]);

  async function enviar(evento) {
    evento.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      await createReview({ agendamentoId, nota, ...(comentario.trim() ? { comentario: comentario.trim() } : {}) });
      navegar(`/estabelecimento/${encodeURIComponent(agendamento.clinicaUid)}`, { replace: true });
    } catch (falha) {
      if (falha.status === 409) {
        setJaAvaliado(true);
        setErro("A API informou que este atendimento já possui uma avaliação ou não aceita outra avaliação para ele.");
      } else {
        setErro(falha.message || "Não foi possível enviar a avaliação.");
      }
      setEnviando(false);
    }
  }

  if (!agendamentoId) return <Container py={8}><ErrorState title="Avaliação indisponível" description="Selecione um agendamento concluído no histórico para avaliá-lo." /></Container>;
  if (status === "loading") return <Container py={8}><ListSkeleton count={1} /></Container>;
  if (status === "error") return <Container py={8}><ErrorState title="Avaliação indisponível" description={erro} /></Container>;

  return (
    <Container maxW="720px" px={{ base: 4, md: 6 }} py={8} pb={{ base: "110px", md: 12 }}>
      <PageHeader title="Avaliar atendimento" description="Sua avaliação só será publicada vinculada a este atendimento concluído." />
      <Card>
        {jaAvaliado && <Text role="status" mb={4} color="var(--color-text-muted)">Este atendimento não está disponível para uma nova avaliação. {erro}</Text>}
        <Stack as="form" onSubmit={enviar} gap={4}>
          <Text><strong>{agendamento.nomeExame}</strong> · {agendamento.clinicaNome || agendamento.nomeClinica || agendamento.clinica?.nomeFantasia || agendamento.clinica?.nome || `Clínica ${agendamento.clinicaUid}`}</Text>
          <label htmlFor="notaAvaliacao">Nota</label>
          <select id="notaAvaliacao" value={nota} onChange={(evento) => setNota(Number(evento.target.value))} disabled={jaAvaliado}>
            {[5, 4, 3, 2, 1].map((valor) => <option key={valor} value={valor}>{valor} {valor === 1 ? "estrela" : "estrelas"}</option>)}
          </select>
          <label htmlFor="comentarioAvaliacao">Comentário (opcional, até 1000 caracteres)</label>
          <Textarea id="comentarioAvaliacao" value={comentario} onChange={(evento) => setComentario(evento.target.value.slice(0, 1000))} maxLength={1000} rows={5} disabled={jaAvaliado} />
          {!jaAvaliado && <FeedbackErro mensagem={erro} titulo="Não foi possível enviar a avaliação" />}
          {!jaAvaliado && <Button type="submit" disabled={enviando}>{enviando ? "Enviando avaliação..." : "Enviar avaliação"}</Button>}
          <Button asChild variant="outline"><Link to="/paciente/historico">Voltar ao histórico</Link></Button>
        </Stack>
      </Card>
    </Container>
  );
}
