export function getLocalDateString(): string {
  return getDateStringFromDate(new Date());
}

export function getDateStringFromDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatarDataHoraLocal(dataIso: string): string {
  if (!dataIso) return '';
  const data = new Date(dataIso);
  return data.toLocaleString('pt-BR');
}
