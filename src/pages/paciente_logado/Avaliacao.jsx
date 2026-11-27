import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Container, Flex, Stack, Text } from "@chakra-ui/react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import CampoTexto from "@/components/ui/CampoTexto";
import Select from "@/components/ui/Select";
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

  const voltar = <Button asChild variant="outline"><Link to="/paciente/historico">Voltar ao histórico</Link></Button>;
  const container = (conteudo) => (
    <Container maxW="var(--container-sm)" px={{ base: "var(--space-4)", md: "var(--space-6)" }} py="var(--space-8)" pb={{ base: "var(--bottom-nav-offset)", md: "var(--space-12)" }}>
      <PageHeader title="Avaliar atendimento" description="Sua avaliação só é publicada ligada a este atendimento concluído." />
      {conteudo}
    </Container>
  );

  if (!agendamentoId) return container(<ErrorState title="Avaliação indisponível" description="Selecione um agendamento concluído no histórico para avaliá-lo." action={voltar} />);
  if (status === "loading") return container(<ListSkeleton count={1} />);
  if (status === "error") return container(<ErrorState title="Avaliação indisponível" description={erro} action={voltar} />);

  const nomeClinica = agendamento.clinicaNome || agendamento.nomeClinica || agendamento.clinica?.nomeFantasia || agendamento.clinica?.nome || `Clínica ${agendamento.clinicaUid}`;

  return container(
    <Card>
      <Stack as="form" onSubmit={enviar} gap="var(--space-4)">
        <Stack gap="var(--space-1)">
          <Text fontFamily="var(--font-heading)" fontWeight="var(--weight-bold)" fontSize="var(--text-lg)" color="var(--color-text)">{agendamento.nomeExame}</Text>
          <Text fontSize="var(--text-sm)" color="var(--color-text-muted)">{nomeClinica}</Text>
        </Stack>
        {jaAvaliado && <Text role="status" fontSize="var(--text-sm)" color="var(--color-text-muted)">Este atendimento não está disponível para uma nova avaliação. {erro}</Text>}
        <Select
          id="notaAvaliacao"
          label="Nota"
          options={[5, 4, 3, 2, 1].map((valor) => ({ value: String(valor), label: `${valor} ${valor === 1 ? "estrela" : "estrelas"}` }))}
          value={String(nota)}
          onChange={(evento) => setNota(Number(evento.target.value))}
          disabled={jaAvaliado}
        />
        <CampoTexto
          id="comentarioAvaliacao"
          label="Comentário"
          helperText={`Opcional. ${comentario.length} de 1000 caracteres.`}
          multiline
          rows={5}
          value={comentario}
          onChange={(evento) => setComentario(evento.target.value.slice(0, 1000))}
          maxLength={1000}
          disabled={jaAvaliado}
        />
        {!jaAvaliado && <FeedbackErro mensagem={erro} titulo="Não foi possível enviar a avaliação" />}
        <Flex gap="var(--space-2)" wrap="wrap">
          {!jaAvaliado && <Button type="submit" disabled={enviando}>{enviando ? "Enviando avaliação…" : "Enviar avaliação"}</Button>}
          {voltar}
        </Flex>
      </Stack>
    </Card>
  );
}
