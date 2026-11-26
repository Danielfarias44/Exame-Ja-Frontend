import { Box, Stack } from "@chakra-ui/react";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import FeedbackErro from "@/components/ui/FeedbackErro";
import ListSkeleton from "@/components/ui/Skeleton";

export default function ConteudoLista({ lista, tituloErro, vazio, rotuloMais = "Carregar mais", children }) {
  if (lista.status === "loading") return <ListSkeleton count={3} />;
  if (lista.status === "error") {
    return <ErrorState title={tituloErro} description={lista.erro} onRetry={lista.recarregar} />;
  }
  if (lista.itens.length === 0) return <EmptyState title={vazio.title} description={vazio.description} />;

  return (
    <Stack gap="var(--space-4)">
      {lista.itens.map(children)}
      {lista.erroMais && <FeedbackErro mensagem={lista.erroMais} titulo="Não foi possível carregar mais" />}
      {lista.proximoCursor && (
        <Box>
          <Button variant="outline" onClick={lista.carregarMais} disabled={lista.carregandoMais}>
            {lista.carregandoMais ? "Carregando…" : rotuloMais}
          </Button>
        </Box>
      )}
    </Stack>
  );
}
