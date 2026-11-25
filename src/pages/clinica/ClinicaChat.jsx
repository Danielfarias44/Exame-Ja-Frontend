import { useState } from "react";
import { Container } from "@chakra-ui/react";
import PageHeader from "@/components/ui/PageHeader";
import ChatPanel from "@/components/chat/ChatPanel";
import { obterParticipanteAtual } from "@/services/chatService";

export default function ClinicaChat() {
  const [participante] = useState(() => obterParticipanteAtual());

  return (
    <Container maxW="1120px" px={{ base: 4, md: 6 }} py={{ base: 6, md: 8 }}>
      <PageHeader title="Conversas com pacientes" description="Responda às dúvidas sobre exames, convênios e horários." />
      {participante && <ChatPanel participante={participante} vazio={{
        title: "Nenhuma conversa recebida",
        description: "As conversas iniciadas por pacientes aparecerão aqui.",
      }} />}
    </Container>
  );
}
