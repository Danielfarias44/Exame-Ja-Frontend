import { Link } from "react-router-dom";
import { Stack } from "@chakra-ui/react";
import Button from "@/components/ui/Button";
import { rotaAgendamento, rotaConversa, rotaLoginComRetorno } from "@/utils/rotasOferta";

export default function OfferActions({ oferta, ehPaciente = false, estaLogado = false }) {
  const detalhe = ehPaciente
    ? `/paciente/estabelecimento/${encodeURIComponent(oferta.clinicId)}`
    : `/estabelecimento/${encodeURIComponent(oferta.clinicId)}`;
  const verOferta = (
    <Button asChild>
      <Link to={detalhe} state={{ oferta }} aria-label={`Ver oferta: ${oferta.exam} na ${oferta.name}`}>
        Ver oferta
      </Link>
    </Button>
  );

  if (ehPaciente) {
    return (
      <Stack direction={{ base: "column", sm: "row" }} gap="var(--space-2)">
        {verOferta}
        <Button asChild variant="outline">
          <Link to={rotaAgendamento(oferta)} aria-label={`Solicitar horário: ${oferta.exam} na ${oferta.name}`}>
            Solicitar horário
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to={rotaConversa(oferta)} aria-label={`Conversar com a clínica: ${oferta.name}`}>
            Conversar com a clínica
          </Link>
        </Button>
      </Stack>
    );
  }

  if (estaLogado) return verOferta;

  return (
    <Stack direction={{ base: "column", sm: "row" }} gap="var(--space-2)">
      {verOferta}
      <Button asChild variant="outline">
        <Link to={rotaLoginComRetorno(rotaAgendamento(oferta))} aria-label={`Entrar para agendar: ${oferta.exam} na ${oferta.name}`}>
          Entrar para agendar
        </Link>
      </Button>
    </Stack>
  );
}
