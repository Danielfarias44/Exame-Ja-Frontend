function paraDate(valor) {
  if (!valor) return null;
  if (valor instanceof Date) return valor;
  if (typeof valor === "string" || typeof valor === "number") return new Date(valor);
  const segundos = valor._seconds ?? valor.seconds;
  if (Number.isFinite(segundos)) return new Date(segundos * 1000);
  return null;
}

export function formatarData(valor, { comHora = true } = {}) {
  const data = paraDate(valor);
  if (!data || Number.isNaN(data.getTime())) return "Data não informada";
  return data.toLocaleString("pt-BR", comHora
    ? { dateStyle: "medium", timeStyle: "short" }
    : { dateStyle: "medium" });
}
