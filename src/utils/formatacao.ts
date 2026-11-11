export function formatarDinheiro(valor: number, codigoMoeda: string) {
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: codigoMoeda,
    }).format(valor);
  } catch {
    return `${valor.toFixed(2)} ${codigoMoeda}`;
  }
}

export function formatarTaxa(taxa: number) {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 6 }).format(taxa);
}

export function formatarData(dataIso: string) {
  const [ano, mes, dia] = dataIso.split('-');
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : dataIso;
}
