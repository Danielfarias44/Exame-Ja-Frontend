import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Flex, Stack, Text } from "@chakra-ui/react";
import { obterDadosPacienteLogado } from "@/services/pacienteLogadoService";
import PageHeader from "@/components/ui/PageHeader";
import SectionTitle from "@/components/ui/SectionTitle";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import StatusBadge from "@/components/ui/StatusBadge";

export default function Historico() {
  const navegar = useNavigate();
  const { agendamentos } = useMemo(() => obterDadosPacienteLogado(), []);

  const concluidos = agendamentos.filter((ag) => ag.status === "Concluído");

  return (
    <Container
      maxW="960px"
      px={{ base: 4, md: 6 }}
      py={{ base: 6, md: 8 }}
      pb={{ base: "110px", md: 12 }}
      className="animar-entrada"
    >
      <PageHeader
        title="Histórico de Exames"
        description="Consulte exames já realizados e avalie o atendimento das unidades."
      />

      {concluidos.length === 0 ? (
        <EmptyState
          title="Nenhum exame concluído até o momento"
          description="Quando você fizer um exame agendado pelo Exame Já, ele aparece aqui."
        />
      ) : (
        <Stack gap="var(--space-4)">
          {concluidos.map((ag) => {
            const nomeExame = ag.exameNome || ag.exame;
            return (
              <Card key={ag.id}>
                <Flex
                  justify="space-between"
                  align={{ base: "flex-start", sm: "center" }}
                  direction={{ base: "column", sm: "row" }}
                  gap="var(--space-3)"
                >
                  <Stack gap="var(--space-1)">
                    <Flex align="center" gap="var(--space-2)" wrap="wrap">
                      <StatusBadge>Concluído</StatusBadge>
                      <Text fontSize="var(--text-xs)" color="var(--color-text-muted)">
                        Realizado em {ag.data} às {ag.horario}
                      </Text>
                    </Flex>
                    <SectionTitle fontSize="var(--text-base)">{nomeExame}</SectionTitle>
                    <Text fontSize="var(--text-xs)" color="var(--color-text-muted)">
                      {ag.clinicaNome || ag.clinica} — {ag.unidade} • {ag.modalidade}
                    </Text>
                  </Stack>

                  <Flex gap="var(--space-2)" align="center" wrap="wrap">
                    {ag.avaliado ? (
                      <StatusBadge tone="success">Atendimento avaliado</StatusBadge>
                    ) : (
                      <Button
                        aria-label={`Avaliar atendimento: ${nomeExame}`}
                        onClick={() => navegar(`/paciente/avaliacao?id=${ag.id}`)}
                      >
                        Avaliar atendimento
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      aria-label={`Agendar novamente: ${nomeExame}`}
                      onClick={() =>
                        navegar(
                          `/paciente/agendar?clinicaId=${ag.clinicaId}&exame=${encodeURIComponent(nomeExame)}`
                        )
                      }
                    >
                      Agendar novamente
                    </Button>
                  </Flex>
                </Flex>
              </Card>
            );
          })}
        </Stack>
      )}
    </Container>
  );
}
