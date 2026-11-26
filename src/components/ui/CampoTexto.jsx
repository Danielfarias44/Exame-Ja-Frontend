import { forwardRef } from "react";
import { Field, Input, Textarea } from "@chakra-ui/react";

const estiloCampo = {
  minH: "var(--touch-target-min)",
  bg: "var(--color-surface)",
  color: "var(--color-text)",
  fontFamily: "var(--font-body)",
  fontSize: "var(--text-sm)",
  borderWidth: "var(--border-width-strong)",
  borderRadius: "var(--radius-md)",
  _focusVisible: {
    outline: "var(--border-width-strong) solid var(--color-focus)",
    outlineOffset: "2px",
    borderColor: "var(--color-focus)",
  },
};

const CampoTexto = forwardRef(function CampoTexto(
  { label, helperText, error, required, multiline = false, ...props },
  ref,
) {
  const Controle = multiline ? Textarea : Input;

  return (
    <Field.Root invalid={Boolean(error)} required={required}>
      <Field.Label fontSize="var(--text-sm)" fontWeight="var(--weight-bold)" color="var(--color-text)">
        {label}
        {required && <Field.RequiredIndicator />}
      </Field.Label>
      <Controle
        ref={ref}
        {...estiloCampo}
        borderColor={error ? "var(--color-error)" : "var(--color-border)"}
        {...(multiline ? { rows: 3, resize: "vertical" } : {})}
        {...props}
      />
      {helperText && !error && (
        <Field.HelperText color="var(--color-text-muted)" fontSize="var(--text-xs)">
          {helperText}
        </Field.HelperText>
      )}
      {error && (
        <Field.ErrorText color="var(--color-error)" fontSize="var(--text-xs)">
          {error}
        </Field.ErrorText>
      )}
    </Field.Root>
  );
});

export default CampoTexto;
