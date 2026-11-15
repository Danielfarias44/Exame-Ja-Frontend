import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: "var(--font-heading)" },
        body: { value: "var(--font-body)" },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
