import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  marcarNotificacaoComoLida,
  marcarTodasNotificacoesComoLidas,
  obterNotificacoesPaciente,
} from "@/services/pacienteLogadoService";

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
      <Flex
        justify="space-between"
        align={{ base: "flex-start", sm: "center" }}
        direction={{ base: "column", sm: "row" }}
        gap={3}
        mb={6}
      >
        <Box>
          <Flex align="center" gap={2.5} mb={1}>
            <Heading
              as="h1"
              fontFamily="var(--font-heading)"
              fontWeight="var(--weight-bold)"
              fontSize={{ base: "1.5rem", md: "1.9rem" }}
              color="var(--color-text)"
            >
              Notificações
            </Heading>
            {naoLidas > 0 && (
              <Badge
                px={2.5}
                py={0.5}
                borderRadius="var(--radius-full)"
                bg="var(--color-primary)"
                color="var(--color-text-on-primary)"
                fontFamily="var(--font-heading)"
                fontWeight={700}
                fontSize="0.76rem"
              >
                {naoLidas} {naoLidas === 1 ? "nova" : "novas"}
              </Badge>
            )}
          </Flex>
          <Text
            fontFamily="var(--font-body)"
            fontSize="0.92rem"
            color="var(--color-text-muted)"
          >
            Acompanhe confirmações de agendamento e lembretes de preparo.
          </Text>
        </Box>

        {naoLidas > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            minH="40px"
            px={4}
            borderColor="var(--color-border-soft)"
            color="var(--color-primary)"
            _hover={{ borderColor: "var(--color-primary)" }}
            onClick={lidarMarcarTodas}
            fontFamily="var(--font-heading)"
            fontWeight={600}
            fontSize="0.82rem"
          >
            Marcar todas como lidas
          </Button>
        )}
      </Flex>

      {notificacoes.length === 0 ? (
        <Box
          p={8}
          textAlign="center"
          bg="var(--color-surface)"
          border="1px solid var(--color-border-soft)"
          borderRadius="var(--radius-lg)"
        >
          <Text
            fontFamily="var(--font-heading)"
            fontWeight={600}
            color="var(--color-text)"
            mb={1}
          >
            Nenhuma notificação no momento
          </Text>
          <Text
            fontFamily="var(--font-body)"
            fontSize="0.86rem"
            color="var(--color-text-muted)"
          >
            Quando você agendar ou alterar um exame, os avisos aparecerão aqui.
          </Text>
        </Box>
      ) : (
        <VStack align="stretch" gap={3.5}>
          {notificacoes.map((item) => (
            <Box
              key={item.id}
              p={{ base: 4, md: 5 }}
              bg="var(--color-surface)"
              border="1.5px solid"
              borderColor={
                item.lida
                  ? "var(--color-border-soft)"
                  : "var(--color-primary)"
              }
              borderRadius="var(--radius-lg)"
              boxShadow="var(--shadow-sm)"
            >
              <Flex
                justify="space-between"
                align={{ base: "flex-start", sm: "center" }}
                direction={{ base: "column", sm: "row" }}
                gap={3}
              >
                <Box>
                  <Flex align="center" gap={2} mb={1} flexWrap="wrap">
                    {!item.lida && (
                      <Badge
                        px={2}
                        py={0.5}
                        borderRadius="var(--radius-full)"
                        bg="var(--color-primary-soft)"
                        color="var(--color-primary)"
                        fontFamily="var(--font-heading)"
                        fontWeight={700}
                        fontSize="0.7rem"
                      >
                        Nova
                      </Badge>
                    )}
                    <Heading
                      as="h2"
                      fontFamily="var(--font-heading)"
                      fontWeight="var(--weight-bold)"
                      fontSize="1rem"
                      color="var(--color-text)"
                    >
                      {item.titulo}
                    </Heading>
                    <Text
                      fontFamily="var(--font-body)"
                      fontSize="0.78rem"
                      color="var(--color-text-muted)"
                    >
                      • {item.data}
                    </Text>
                  </Flex>

                  <Text
                    fontFamily="var(--font-body)"
                    fontSize="0.88rem"
                    color="var(--color-text-muted)"
                  >
                    {item.mensagem}
                  </Text>
                </Box>

                <Flex gap={2} flexShrink={0}>
                  {!item.lida && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      borderColor="var(--color-border-soft)"
                      color="var(--color-text)"
                      onClick={() => lidarMarcarLida(item.id)}
                      fontFamily="var(--font-heading)"
                      fontWeight={600}
                      fontSize="0.78rem"
                    >
                      Marcar como lida
                    </Button>
                  )}

                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    color="var(--color-primary)"
                    onClick={() => navegar("/paciente/agendamentos")}
                    fontFamily="var(--font-heading)"
                    fontWeight={600}
                    fontSize="0.78rem"
                  >
                    Ver agendamentos
                  </Button>
                </Flex>
              </Flex>
            </Box>
          ))}
        </VStack>
      )}
    </Container>
  );
}