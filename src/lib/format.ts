export const fmtQtd = (n: number) =>
  n.toLocaleString("pt-BR", { maximumFractionDigits: 3 });

export const fmtData = (d: Date | string) =>
  new Date(d).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  });
