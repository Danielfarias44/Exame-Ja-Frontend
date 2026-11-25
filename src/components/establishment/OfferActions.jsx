import { Link } from "react-router-dom";
import { Stack } from "@chakra-ui/react";
import Button from "@/components/ui/Button";

export default function OfferActions({ oferta, estaLogado }) {
  const detalhe = estaLogado
    ? `/paciente/estabelecimento/${encodeURIComponent(oferta.clinicId)}`
    : `/estabelecimento/${encodeURIComponent(oferta.clinicId)}`;
  if (!estaLogado) {
    return (
      <Button asChild>
        <Link
          to={detalhe}
          state={{ oferta }}
          aria-label={`Ver oferta: ${oferta.exam} na ${oferta.name}`}
        >
          Ver oferta
        </Link>
      </Button>
    );
  }

  return (
    <Stack direction={{ base: "column", sm: "row" }} gap="var(--space-2)">
      <Button asChild>
        <Link to={detalhe} state={{ oferta }} aria-label={`Ver oferta: ${oferta.exam} na ${oferta.name}`}>
          Ver oferta
        </Link>
      </Button>
      <Button asChild variant="outline">
        <Link to={`/paciente/agendar?clinicaId=${encodeURIComponent(oferta.clinicId)}&codigoExame=${encodeURIComponent(oferta.examCode)}&nomeExame=${encodeURIComponent(oferta.exam)}`}>
          Solicitar horário
        </Link>
      </Button>
      <Button asChild variant="outline">
        <Link to={`/paciente/chat?clinicaId=${oferta.clinicId}`} aria-label={`Conversar com a clínica: ${oferta.name}`}>
          Conversar com a clínica
        </Link>
      </Button>
    </Stack>
  );
}
