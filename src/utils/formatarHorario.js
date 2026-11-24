const horaMinuto = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });
const diaMes = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });
const dataCompleta = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" });

function mesmoDia(a, b) {
  return a.toDateString() === b.toDateString();
}

export function formatarHorarioCurto(iso) {
  if (!iso) return "";
  const data = new Date(iso);
  const hoje = new Date();
  const ontem = new Date(hoje);
  ontem.setDate(hoje.getDate() - 1);

  if (mesmoDia(data, hoje)) return horaMinuto.format(data);
  if (mesmoDia(data, ontem)) return `ontem, ${horaMinuto.format(data)}`;
  return `${diaMes.format(data)}, ${horaMinuto.format(data)}`;
}

export function formatarHorarioCompleto(iso) {
  return iso ? dataCompleta.format(new Date(iso)) : "";
}
