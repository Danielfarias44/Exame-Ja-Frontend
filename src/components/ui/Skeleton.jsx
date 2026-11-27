import { Skeleton, SkeletonText, Stack } from "@chakra-ui/react";
import Card from "./Card";
// Mostra um esqueleto daquele card, mostrando que está carregando algo
export default function ListSkeleton({ count = 3 }) {
  return (
    <Stack gap="var(--space-4)" role="status" aria-busy="true">
      <span className="sr-only">Carregando resultados…</span>
      {Array.from({ length: count }, (_, index) => (
        <Card key={index} aria-hidden="true">
          <Skeleton height="var(--icon-sm)" width="55%" mb="var(--space-3)" />
          <SkeletonText noOfLines={2} mb="var(--space-3)" />
          <Skeleton height="var(--text-lg)" width="35%" />
        </Card>
      ))}
    </Stack>
  );
}
