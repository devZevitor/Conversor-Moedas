const AMOUNT_ERROR_FORMAT =
  'Use apenas números, com vírgula ou ponto para os centavos. Exemplo: 10,50';
const AMOUNT_ERROR_POSITIVE = 'O valor deve ser maior que zero.';

type ErroValidacao = { erro: string };
type ValorValidado = { valor: number };

export function interpretarValor(texto: string): ErroValidacao | ValorValidado {
  const bruto = texto.trim();

  if (bruto === '') return { erro: 'Digite o valor que deseja converter.' };
  if (bruto.startsWith('-')) return { erro: AMOUNT_ERROR_POSITIVE };
  if (!/^\d+([.,]\d+)?$/.test(bruto)) return { erro: AMOUNT_ERROR_FORMAT };

  const valor = Number(bruto.replace(',', '.'));
  if (!Number.isFinite(valor) || valor <= 0) {
    return { erro: AMOUNT_ERROR_POSITIVE };
  }
  return { valor };
}

type EntradaConversao = {
  textoValor: string;
  moedaOrigem: string;
  moedaDestino: string;
};

export function validarConversao({
  textoValor,
  moedaOrigem,
  moedaDestino,
}: EntradaConversao): ErroValidacao | ValorValidado {
  const valor = interpretarValor(textoValor);
  if ('erro' in valor) return { erro: valor.erro };
  if (!moedaOrigem) return { erro: 'Selecione a moeda de origem.' };
  if (!moedaDestino) return { erro: 'Selecione a moeda de destino.' };
  if (moedaOrigem === moedaDestino) {
    return { erro: 'Escolha moedas diferentes para fazer a conversão.' };
  }
  return { valor: valor.valor };
}
