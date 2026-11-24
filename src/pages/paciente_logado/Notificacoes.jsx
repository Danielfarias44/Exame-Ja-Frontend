import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Flex, Stack, Text } from "@chakra-ui/react";
import {
  marcarNotificacaoComoLida,
  marcarTodasNotificacoesComoLidas,
  obterNotificacoesPaciente,
} from "@/services/pacienteLogadoService";
import PageHeader from "@/components/ui/PageHeader";
import SectionTitle from "@/components/ui/SectionTitle";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import StatusBadge from "@/components/ui/StatusBadge";

export default function Notificacoes() {
  const navegar = useNavigate();
  const [notificacoes, setNotificacoes] = useState(() =>
    obterNotificacoesPaciente()
  );

  useEffect(() => {
    function sincronizar() {
      setNotificacoes(obterNotificacoesPaciente());
    }
    window.addEventListener("exameja:estado-atualizado", sincronizar);
    return () =>
      window.removeEventListener("exameja:estado-atualizado", sincronizar);
  }, []);

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  function lidarMarcarLida(id) {
    marcarNotificacaoComoLida(id);
    setNotificacoes(obterNotificacoesPaciente());
  }

  function lidarMarcarTodas() {
    marcarTodasNotificacoesComoLidas();
    setNotificacoes(obterNotificacoesPaciente());
  }

  return (
    <Container
      maxW="880px"
      px={{ base: 4, md: 6 }}
      py={{ base: 6, md: 8 }}
      pb={{ base: "110px", md: 12 }}
      className="animar-entrada"
    >
      <PageHeader
        title="Notificações"
        description="Acompanhe confirmações de agendamento e lembretes de preparo."
        badge={
          naoLidas > 0 && (
            <StatusBadge solid>
              {naoLidas} {naoLidas === 1 ? "nova" : "novas"}
            </StatusBadge>
          )
        }
        actions={
          naoLidas > 0 && (
            <Button variant="outline" onClick={lidarMarcarTodas}>
              Marcar todas como lidas
            </Button>
          )
        }
      />

      {notificacoes.length === 0 ? (
        <EmptyState
          title="Nenhuma notificação no momento"
          description="Quando você agendar ou alterar um exame, os avisos aparecerão aqui."
        />
      ) : (
        <Stack gap="var(--space-4)">
          {notificacoes.map((item) => (
            <Card
              key={item.id}
              borderWidth="var(--border-width-strong)"
              borderColor={item.lida ? "var(--color-border-soft)" : "var(--color-primary)"}
            >
              <Flex
                justify="space-between"
                align={{ base: "flex-start", sm: "center" }}
                direction={{ base: "column", sm: "row" }}
                gap="var(--space-3)"
              >
                <Stack gap="var(--space-1)">
                  <Flex align="center" gap="var(--space-2)" wrap="wrap">
                    {!item.lida && <StatusBadge>Nova</StatusBadge>}
                    <SectionTitle fontSize="var(--text-base)">{item.titulo}</SectionTitle>
                    <Text fontSize="var(--text-xs)" color="var(--color-text-muted)">
                      • {item.data}
                    </Text>
                  </Flex>
                  <Text fontSize="var(--text-sm)" color="var(--color-text-muted)">
                    {item.mensagem}
                  </Text>
                </Stack>

                <Flex gap="var(--space-2)" flexShrink={0} wrap="wrap">
                  {!item.lida && (
                    <Button
                      variant="outline"
                      aria-label={`Marcar como lida: ${item.titulo}`}
                      onClick={() => lidarMarcarLida(item.id)}
                    >
                      Marcar como lida
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => navegar("/paciente/agendamentos")}>
                    Ver agendamentos
                  </Button>
                </Flex>
              </Flex>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}
