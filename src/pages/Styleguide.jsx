import { Flex, Heading, Stack, Text } from "@chakra-ui/react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import ListSkeleton from "@/components/ui/Skeleton";
import EstablishmentCard from "@/components/EstablishmentCard";
import InsuranceBadges from "@/components/InsuranceBadges";
import LoginPrompt from "@/components/LoginPrompt";
import PriceTag from "@/components/PriceTag";
import RatingSummary from "@/components/RatingSummary";
import { mockEdgeCaseEstablishments, mockEstablishments } from "@/services/mocks";
// Tutorial visual de como aplicar os componentes
function Section({ title, children }) {
  return (
    <Stack as="section" gap="var(--space-3)">
      <Heading as="h2" fontFamily="var(--font-heading)" fontSize="var(--text-xl)">
        {title}
      </Heading>
      {children}
    </Stack>
  );
}

export default function Styleguide() {
  return (
    <Stack gap="var(--space-8)">
      <Heading as="h1">Styleguide</Heading>

      <Section title="Botões">
        <Flex wrap="wrap" gap="var(--space-3)">
          <Button>Primário</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button disabled>Desabilitado</Button>
          <Button loading loadingText="Enviando">
            Carregando
          </Button>
        </Flex>
      </Section>

      <Section title="Alertas">
        <Alert status="info" title="Informação">Mensagem informativa.</Alert>
        <Alert status="success" title="Sucesso">Sua avaliação foi enviada.</Alert>
        <Alert status="warning" title="Atenção">Sua avaliação fica em análise antes de aparecer.</Alert>
        <Alert status="error" title="Erro">Não foi possível enviar.</Alert>
      </Section>

      <Section title="Aviso de login">
        <LoginPrompt action="conversar com a clínica" />
        <LoginPrompt action="escrever uma avaliação" />
      </Section>

      <Section title="Nota, preço e convênios">
        <Card>
          <Stack gap="var(--space-4)">
            <RatingSummary rating={4.6} reviewsCount={128} />
            <RatingSummary rating={3.9} reviewsCount={1} />
            <RatingSummary rating={null} reviewsCount={0} />
            <PriceTag price={45} />
            <PriceTag price={1250.5} />
            <PriceTag price={null} />
            <InsuranceBadges insurances={["Unimed", "Hapvida"]} />
            <InsuranceBadges insurances={["Unimed", "Hapvida", "Amil", "SUS", "Cassi"]} />
            <InsuranceBadges insurances={["Unimed", "Hapvida", "Amil", "SUS", "Cassi"]} maxVisible={Infinity} />
            <InsuranceBadges insurances={[]} />
          </Stack>
        </Card>
      </Section>

      <Section title="Cards de clínica (dados normais)">
        {mockEstablishments.map((e) => (
          <EstablishmentCard key={e.id} establishment={e} />
        ))}
      </Section>

      <Section title="Cards de clínica (casos difíceis)">
        <Text color="var(--color-text-muted)" fontSize="var(--text-xs)">
          Sem preço, sem avaliações, sem localização, nome e endereço muito longos.
        </Text>
        {mockEdgeCaseEstablishments.map((e) => (
          <EstablishmentCard key={e.id} establishment={e} />
        ))}
      </Section>

      <Section title="Carregando, vazio e erro">
        <ListSkeleton count={2} />
        <EmptyState
          description="Tente outro exame, aumente o raio de busca ou escolha outro convênio."
        />
        <ErrorState onRetry={() => {}} />
      </Section>
    </Stack>
  );
}
