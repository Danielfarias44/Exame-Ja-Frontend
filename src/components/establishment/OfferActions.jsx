import { Link } from "react-router-dom";
import { Stack } from "@chakra-ui/react";
import Button from "@/components/ui/Button";

function linkDeAgendamento(oferta) {
  const params = new URLSearchParams({ clinicaId: oferta.clinicId, exame: oferta.exam });
  return `/paciente/agendar?${params.toString()}`;
}

export default function OfferActions({ oferta, estaLogado }) {
  const destino = linkDeAgendamento(oferta);

  if (!estaLogado) {
    return (
      <Button asChild>
        <Link
          to={`/login?redirect=${encodeURIComponent(destino)}`}
          aria-label={`Entrar para agendar: ${oferta.exam} na ${oferta.name}`}
        >
          Entrar para agendar
        </Link>
      </Button>
    );
  }

  return (
    <Stack direction={{ base: "column", sm: "row" }} gap="var(--space-2)">
      <Button asChild>
        <Link to={destino} aria-label={`Agendar: ${oferta.exam} na ${oferta.name}`}>
          Agendar
        </Link>
      </Button>
      <Button asChild variant="outline">
        <Link to="/paciente/chat" aria-label={`Conversar com a clínica: ${oferta.name}`}>
          Conversar com a clínica
        </Link>
      </Button>
    </Stack>
  );
}
