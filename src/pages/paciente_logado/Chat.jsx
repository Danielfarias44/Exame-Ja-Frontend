import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Container } from "@chakra-ui/react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import ChatPanel from "@/components/chat/ChatPanel";
import { iniciarConversa, obterParticipanteAtual } from "@/services/chatService";

export default function Chat() {
  const [searchParams, setSearchParams] = useSearchParams();
  const clinicaId = searchParams.get("clinicaId");
  const [participante] = useState(() => obterParticipanteAtual());
  const [conversaInicialId, setConversaInicialId] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!clinicaId) return;
    iniciarConversa(clinicaId)
      .then((conversa) => {
        setConversaInicialId(conversa.id);
        setSearchParams({}, { replace: true });
      })
      .catch((falha) => setErro(falha.message));
  }, [clinicaId, setSearchParams]);

  return (
    <Container
      maxW="1120px"
      px={{ base: 4, md: 6 }}
      py={{ base: 6, md: 8 }}
      pb={{ base: "110px", md: 12 }}
      className="animar-entrada"
    >
      <PageHeader
        title="Chat com Clínicas"
        description="Tire dúvidas sobre preparo, convênio e horários direto com a recepção das unidades."
      />

      {erro && (
        <Alert status="error" title="Não foi possível abrir a conversa" mb="var(--space-4)">
          {erro}
        </Alert>
      )}

      {participante && (
        <ChatPanel
          participante={participante}
          conversaInicialId={conversaInicialId}
          vazio={{
            title: "Você ainda não conversou com nenhuma clínica",
            description: "Na busca, escolha uma clínica e toque em “Conversar com a clínica”.",
            action: (
              <Button asChild>
                <Link to="/busca">Buscar exames</Link>
              </Button>
            ),
          }}
        />
      )}
    </Container>
  );
}
