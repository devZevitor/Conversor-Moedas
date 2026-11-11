const URL_BASE = 'https://api.frankfurter.dev/v2';

export const TIPOS_ERRO = {
  NETWORK: 'NETWORK',
  HTTP: 'HTTP',
  INVALID_RESPONSE: 'INVALID_RESPONSE',
} as const;

export type TipoErroApi = (typeof TIPOS_ERRO)[keyof typeof TIPOS_ERRO];

export class ErroApi extends Error {
  tipo: TipoErroApi;
  status?: number;

  constructor(tipo: TipoErroApi, message: string, status?: number) {
    super(message);
    this.name = 'ErroApi';
    this.tipo = tipo;
    this.status = status;
  }
}

export type Moeda = {
  codigo: string;
  nome: string;
  simbolo: string;
};

export type TaxaCambio = {
  origem: string;
  destino: string;
  taxa: number;
  data: string;
};

const NOMES_MOEDAS: Record<string, string> = {
  AED: 'Dirham dos Emirados Árabes Unidos',
  ARS: 'Peso argentino',
  AUD: 'Dólar australiano',
  BGN: 'Lev búlgaro',
  BOB: 'Boliviano',
  BRL: 'Real brasileiro',
  CAD: 'Dólar canadense',
  CHF: 'Franco suíço',
  CLP: 'Peso chileno',
  CNY: 'Yuan chinês',
  COP: 'Peso colombiano',
  CZK: 'Coroa tcheca',
  DKK: 'Coroa dinamarquesa',
  DOP: 'Peso dominicano',
  EGP: 'Libra egípcia',
  EUR: 'Euro',
  GBP: 'Libra esterlina',
  HKD: 'Dólar de Hong Kong',
  HUF: 'Forint húngaro',
  IDR: 'Rupia indonésia',
  ILS: 'Novo shekel israelense',
  INR: 'Rupia indiana',
  ISK: 'Coroa islandesa',
  JPY: 'Iene japonês',
  KRW: 'Won sul-coreano',
  MAD: 'Dirham marroquino',
  MXN: 'Peso mexicano',
  MYR: 'Ringgit malaio',
  NOK: 'Coroa norueguesa',
  NZD: 'Dólar neozelandês',
  PEN: 'Sol peruano',
  PHP: 'Peso filipino',
  PLN: 'Zloty polonês',
  RON: 'Leu romeno',
  RUB: 'Rublo russo',
  SAR: 'Rial saudita',
  SEK: 'Coroa sueca',
  SGD: 'Dólar de Singapura',
  THB: 'Baht tailandês',
  TRY: 'Lira turca',
  TWD: 'Novo dólar taiwanês',
  USD: 'Dólar americano',
  UYU: 'Peso uruguaio',
  ZAR: 'Rand sul-africano',
};

async function obterJson(caminho: string): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`${URL_BASE}${caminho}`, {
      headers: { Accept: 'application/json' },
    });
  } catch {
    throw new ErroApi(TIPOS_ERRO.NETWORK, 'Falha de comunicação com a API.');
  }

  if (!response.ok) {
    throw new ErroApi(
      TIPOS_ERRO.HTTP,
      `A API respondeu com status ${response.status}.`,
      response.status,
    );
  }

  try {
    return await response.json();
  } catch {
    throw new ErroApi(
      TIPOS_ERRO.INVALID_RESPONSE,
      'A resposta da API não é um JSON válido.',
    );
  }
}

export async function buscarMoedas(): Promise<Moeda[]> {
  const dados = await obterJson('/currencies');

  if (!Array.isArray(dados)) {
    throw new ErroApi(
      TIPOS_ERRO.INVALID_RESPONSE,
      'Lista de moedas em formato inesperado.',
    );
  }

  const moedas = dados
    .filter(
      (item): item is { iso_code: string; name: string; symbol?: string; type: string } =>
        Boolean(item) &&
        typeof item === 'object' &&
        'type' in item &&
        item.type === 'currency' &&
        'iso_code' in item &&
        typeof item.iso_code === 'string' &&
        'name' in item &&
        typeof item.name === 'string',
    )
    .map((item) => ({
      codigo: item.iso_code,
      nome: NOMES_MOEDAS[item.iso_code] ?? item.name,
      simbolo: item.symbol ?? item.iso_code,
    }))
    .sort((a, b) => a.codigo.localeCompare(b.codigo));

  if (moedas.length === 0) {
    throw new ErroApi(
      TIPOS_ERRO.INVALID_RESPONSE,
      'A API não retornou nenhuma moeda.',
    );
  }

  return moedas;
}

export async function buscarTaxa(origem: string, destino: string): Promise<TaxaCambio> {
  const dados = await obterJson(
    `/rate/${encodeURIComponent(origem)}/${encodeURIComponent(destino)}`,
  );

  if (
    !dados ||
    typeof dados !== 'object' ||
    !('rate' in dados) ||
    typeof dados.rate !== 'number' ||
    !Number.isFinite(dados.rate) ||
    dados.rate <= 0 ||
    !('date' in dados) ||
    typeof dados.date !== 'string'
  ) {
    throw new ErroApi(
      TIPOS_ERRO.INVALID_RESPONSE,
      'A resposta não trouxe a taxa ou a data esperadas.',
    );
  }

  return {
    origem: 'base' in dados && typeof dados.base === 'string' ? dados.base : origem,
    destino: 'quote' in dados && typeof dados.quote === 'string' ? dados.quote : destino,
    taxa: dados.rate,
    data: dados.date,
  };
}
