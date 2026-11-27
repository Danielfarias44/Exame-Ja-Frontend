import { useState } from "react";
import { Container } from "@chakra-ui/react";
import PageHeader from "@/components/ui/PageHeader";
import ChatPanel from "@/components/chat/ChatPanel";
import { obterParticipanteAtual } from "@/services/chatService";

export default function ClinicaChat() {
  const [participante] = useState(() => obterParticipanteAtual());

  return (
    <Container maxW="var(--container-max)" px={{ base: "var(--space-4)", md: "var(--space-6)" }} py={{ base: "var(--space-6)", md: "var(--space-8)" }}>
      <PageHeader title="Conversas com pacientes" description="Responda às dúvidas sobre exames, convênios e horários." />
      {participante && <ChatPanel participante={participante} vazio={{
        title: "Nenhuma conversa recebida",
        description: "As conversas iniciadas por pacientes aparecerão aqui.",
      }} />}
    </Container>
  );
}
