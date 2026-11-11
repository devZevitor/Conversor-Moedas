import { useCallback, useEffect, useRef, useState } from 'react';

import {
  ErroApi,
  Moeda,
  TIPOS_ERRO,
  buscarMoedas,
  buscarTaxa,
} from '@/models/modelo-moedas';
import { validarConversao } from '@/viewmodels/validacao';

type ResultadoConversao = {
  valor: number;
  origem: string;
  destino: string;
  taxa: number;
  data: string;
  valorConvertido: number;
};

function obterMensagemAmigavel(erro: unknown) {
  if (erro instanceof ErroApi) {
    switch (erro.tipo) {
      case TIPOS_ERRO.NETWORK:
        return 'Não foi possível buscar a cotação. Verifique a conexão e tente de novo.';
      case TIPOS_ERRO.HTTP:
        if ([400, 404, 422].includes(erro.status ?? 0)) {
          return 'Não há cotação disponível para esse par de moedas.';
        }
        return 'O serviço de câmbio está indisponível. Tente novamente em instantes.';
      case TIPOS_ERRO.INVALID_RESPONSE:
        return 'A cotação recebida está incompleta. Tente novamente em instantes.';
    }
  }
  return 'Ocorreu um erro inesperado. Tente novamente.';
}

export function useConversorMoedas() {
  const [textoValor, definirTextoValor] = useState('');
  const [moedaOrigem, definirMoedaOrigem] = useState('');
  const [moedaDestino, definirMoedaDestino] = useState('');
  const [moedas, definirMoedas] = useState<Moeda[]>([]);
  const [carregandoMoedas, definirCarregandoMoedas] = useState(true);
  const [erroMoedas, definirErroMoedas] = useState<string | null>(null);
  const [convertendo, definirConvertendo] = useState(false);
  const [erroValidacao, definirErroValidacao] = useState<string | null>(null);
  const [erroApi, definirErroApi] = useState<string | null>(null);
  const [resultado, definirResultado] = useState<ResultadoConversao | null>(null);
  const idRequisicaoRef = useRef(0);
  const montadoRef = useRef(true);

  const carregarMoedas = useCallback(async () => {
    definirCarregandoMoedas(true);
    definirErroMoedas(null);
    try {
      const lista = await buscarMoedas();
      if (!montadoRef.current) return;
      definirMoedas(lista);
      const codigos = lista.map((moeda) => moeda.codigo);
      definirMoedaOrigem((anterior) => anterior || (codigos.includes('USD') ? 'USD' : codigos[0]));
      definirMoedaDestino(
        (anterior) => anterior || (codigos.includes('BRL') ? 'BRL' : codigos[1] ?? codigos[0]),
      );
    } catch (erro) {
      if (montadoRef.current) definirErroMoedas(obterMensagemAmigavel(erro));
    } finally {
      if (montadoRef.current) definirCarregandoMoedas(false);
    }
  }, []);

  useEffect(() => {
    montadoRef.current = true;
    void carregarMoedas();
    return () => {
      montadoRef.current = false;
    };
  }, [carregarMoedas]);

  const limparResultado = useCallback(() => {
    idRequisicaoRef.current += 1;
    definirConvertendo(false);
    definirResultado(null);
    definirErroApi(null);
    definirErroValidacao(null);
  }, []);

  const alterarTextoValor = useCallback((texto: string) => {
    definirTextoValor(texto);
    limparResultado();
  }, [limparResultado]);

  const alterarMoedaOrigem = useCallback((codigo: string) => {
    definirMoedaOrigem(codigo);
    limparResultado();
  }, [limparResultado]);

  const alterarMoedaDestino = useCallback((codigo: string) => {
    definirMoedaDestino(codigo);
    limparResultado();
  }, [limparResultado]);

  const inverterMoedas = useCallback(() => {
    definirMoedaOrigem(moedaDestino);
    definirMoedaDestino(moedaOrigem);
    limparResultado();
  }, [limparResultado, moedaDestino, moedaOrigem]);

  const converter = useCallback(async () => {
    if (convertendo) return;
    definirErroApi(null);
    definirResultado(null);
    const validacao = validarConversao({
      textoValor,
      moedaOrigem,
      moedaDestino,
    });
    if ('erro' in validacao) {
      definirErroValidacao(validacao.erro);
      return;
    }

    definirErroValidacao(null);
    const idRequisicao = ++idRequisicaoRef.current;
    definirConvertendo(true);
    try {
      const dados = await buscarTaxa(moedaOrigem, moedaDestino);
      if (idRequisicao !== idRequisicaoRef.current) return;
      definirResultado({
        valor: validacao.valor,
        origem: moedaOrigem,
        destino: moedaDestino,
        taxa: dados.taxa,
        data: dados.data,
        valorConvertido: validacao.valor * dados.taxa,
      });
    } catch (erro) {
      if (idRequisicao === idRequisicaoRef.current) definirErroApi(obterMensagemAmigavel(erro));
    } finally {
      if (idRequisicao === idRequisicaoRef.current) definirConvertendo(false);
    }
  }, [convertendo, moedaDestino, moedaOrigem, textoValor]);

  return {
    textoValor,
    moedaOrigem,
    moedaDestino,
    moedas,
    resultado,
    carregandoMoedas,
    convertendo,
    erroMoedas,
    erroValidacao,
    erroApi,
    alterarTextoValor,
    alterarMoedaOrigem,
    alterarMoedaDestino,
    inverterMoedas,
    converter,
    recarregarMoedas: carregarMoedas,
  };
}
