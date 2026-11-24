import { useNavigate } from "react-router-dom";
import { Container, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { CLINICAS_PARCEIRAS } from "@/services/pacienteLogadoService";
import PageHeader from "@/components/ui/PageHeader";
import SectionTitle from "@/components/ui/SectionTitle";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EstablishmentMap from "@/components/establishment/EstablishmentMap";

const clinicasNoMapa = CLINICAS_PARCEIRAS.map((clinica) => ({
  id: clinica.id,
  name: clinica.nome,
  address: clinica.endereco,
  lat: clinica.latitude,
  lng: clinica.longitude,
}));

export default function MapaCompleto() {
  const navegar = useNavigate();

  return (
    <Container
      maxW="1120px"
      px={{ base: 4, md: 6 }}
      py={{ base: 6, md: 8 }}
      pb={{ base: "100px", md: 12 }}
      className="animar-entrada"
    >
      <PageHeader
        title="Mapa de Clínicas e Laboratórios"
        description="Veja no mapa onde ficam as unidades credenciadas perto de você."
      />

      <Stack gap="var(--space-8)">
        <EstablishmentMap
          establishments={clinicasNoMapa}
          zoom={14}
          label="Mapa das unidades credenciadas"
        />

        <Stack as="section" gap="var(--space-4)" aria-labelledby="titulo-unidades">
          <SectionTitle id="titulo-unidades">
            Unidades cadastradas ({CLINICAS_PARCEIRAS.length})
          </SectionTitle>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap="var(--space-4)">
            {CLINICAS_PARCEIRAS.map((clinica) => (
              <Card key={clinica.id}>
                <Stack gap="var(--space-4)" h="100%" justify="space-between">
                  <Stack gap="var(--space-1)">
                    <SectionTitle as="h3">{clinica.nome}</SectionTitle>
                    <Text fontSize="var(--text-xs)" color="var(--color-text-muted)">
                      {clinica.unidade} • {clinica.bairro} ({clinica.distancia})
                    </Text>
                  </Stack>
                  <Button
                    w="100%"
                    aria-label={`Agendar nesta clínica: ${clinica.nome}`}
                    onClick={() => navegar(`/paciente/agendar?clinicaId=${clinica.id}`)}
                  >
                    Agendar nesta clínica
                  </Button>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>
      </Stack>
    </Container>
  );
}
