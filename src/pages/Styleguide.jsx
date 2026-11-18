// Catálogo de tudo que já existe no design system. Serve para conferir o visual dos
// componentes em todas as variações. Rota: /styleguide
import { Flex, Heading, Stack, Text } from "@chakra-ui/react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import ListSkeleton from "@/components/ui/Skeleton";
import Select from "@/components/ui/Select";
import EstablishmentCard from "@/components/establishment/EstablishmentCard";
import InsuranceBadges from "@/components/establishment/InsuranceBadges";
import LoginPrompt from "@/components/LoginPrompt";
import PriceTag from "@/components/establishment/PriceTag";
import RatingSummary from "@/components/establishment/RatingSummary";
import SearchFilters from "@/components/establishment/SearchFilters";
import { mockConvenios, mockEdgeCaseEstablishments, mockEstablishments } from "@/services/mocks";
import { exameCategorias } from "@/services/mocksExames";

const gruposDeExames = exameCategorias.map((categoria) => ({
  label: categoria.nome,
  options: categoria.exames.map((exame) => ({ value: exame.id, label: exame.nome })),
}));

const opcoesRaio = [1, 3, 5, 10, 20].map((km) => ({ value: String(km), label: `${km} km` }));
const opcoesConvenio = mockConvenios.map((nome) => ({ value: nome, label: nome }));

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

      <Section title="Busca por filtros">
        <SearchFilters />
      </Section>

      <Section title="Seleção">
        <Stack gap="var(--space-4)" maxW="420px">
          <Select
            label="Tipo de exame"
            placeholder="Escolha um exame"
            groups={gruposDeExames}
            helperText="Lista agrupada por categoria"
            required
          />
          <Select label="Raio de distância" options={opcoesRaio} defaultValue="5" />
          <Select
            label="Convênio"
            placeholder="Qualquer convênio"
            options={opcoesConvenio}
          />
          <Select
            label="Tipo de exame (com erro)"
            placeholder="Escolha um exame"
            groups={gruposDeExames}
            error="Escolha um exame para continuar"
            required
          />
        </Stack>
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