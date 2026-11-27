// Campo de seleção de filtros para a pesquisa

import { Field, NativeSelect } from "@chakra-ui/react";

function renderOption(option) {
  return (
    <option key={option.value} value={option.value}>
      {option.label}
    </option>
  );
}

export default function Select({
  label,
  options = [],
  groups,
  placeholder,
  helperText,
  error,
  required,
  rootProps,
  ...props
}) {
  return (
    <Field.Root invalid={Boolean(error)} required={required} {...rootProps}>
      <Field.Label fontSize="var(--text-sm)" fontWeight="var(--weight-bold)">
        {label}
        {required && <Field.RequiredIndicator />}
      </Field.Label>

      <NativeSelect.Root>
        <NativeSelect.Field
          placeholder={placeholder}
          minH="var(--touch-target-min)"
          bg="var(--color-surface)"
          color="var(--color-text)"
          fontFamily="var(--font-body)"
          fontSize="var(--text-sm)"
          borderWidth="var(--border-width-strong)"
          borderColor={error ? "var(--color-error)" : "var(--color-border)"}
          borderRadius="var(--radius-md)"
          _focusVisible={{
            outline: "var(--border-width-strong) solid var(--color-focus)",
            outlineOffset: "var(--focus-offset)",
            borderColor: "var(--color-focus)",
          }}
          {...props}
        >
          {groups
            ? groups.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map(renderOption)}
                </optgroup>
              ))
            : options.map(renderOption)}
        </NativeSelect.Field>
        <NativeSelect.Indicator color="var(--color-text)" />
      </NativeSelect.Root>

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
}
