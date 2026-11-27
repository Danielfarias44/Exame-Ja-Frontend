import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import { LuCircle, LuCircleCheck } from "react-icons/lu";
import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";

export default function ChecklistVisibilidade({ itens }) {
  const faltando = itens.filter((item) => !item.feito).length;

  return (
    <Card as="section" aria-labelledby="titulo-checklist">
      <Stack gap="var(--space-3)">
        <SectionTitle id="titulo-checklist">Para aparecer na busca</SectionTitle>
        <Text fontSize="var(--text-sm)" color="var(--color-text-muted)">
          {faltando === 0
            ? "Tudo pronto: pacientes já encontram sua clínica e podem agendar."
            : `Falta${faltando > 1 ? "m" : ""} ${faltando} ${faltando > 1 ? "itens" : "item"} para os pacientes encontrarem e agendarem na sua clínica.`}
        </Text>
        <Stack as="ul" listStyle="none" p={0} m={0} gap="var(--space-2)">
          {itens.map((item) => (
            <Flex as="li" key={item.texto} gap="var(--space-2)" align="flex-start">
              <Box aria-hidden="true" color={item.feito ? "var(--color-success)" : "var(--color-text-muted)"} mt="var(--space-1)" flexShrink={0}>
                {item.feito ? <LuCircleCheck /> : <LuCircle />}
              </Box>
              <Box>
                <Text fontSize="var(--text-sm)" color="var(--color-text)">
                  <span className="sr-only">{item.feito ? "Concluído: " : "Pendente: "}</span>
                  {item.texto}
                </Text>
                {item.ajuda && <Text fontSize="var(--text-xs)" color="var(--color-text-muted)">{item.ajuda}</Text>}
              </Box>
            </Flex>
          ))}
        </Stack>
      </Stack>
    </Card>
  );
}
