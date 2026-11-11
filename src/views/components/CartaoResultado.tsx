import { StyleSheet, Text, View } from 'react-native';

import { formatarData, formatarDinheiro, formatarTaxa } from '@/utils/formatacao';
import { cores } from '@/views/tema';

type Propriedades = {
  resultado: {
    valor: number;
    origem: string;
    destino: string;
    valorConvertido: number;
    taxa: number;
    data: string;
  };
};

export default function CartaoResultado({ resultado }: Propriedades) {
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Resultado da conversão</Text>
      <Text style={styles.original}>{formatarDinheiro(resultado.valor, resultado.origem)} equivale a</Text>
      <Text style={styles.converted} adjustsFontSizeToFit numberOfLines={1}>
        {formatarDinheiro(resultado.valorConvertido, resultado.destino)}
      </Text>
      <View style={styles.divider} />
      <Text style={styles.detail}>
        Taxa utilizada: 1 {resultado.origem} = {formatarTaxa(resultado.taxa)} {resultado.destino}
      </Text>
      <Text style={styles.detail}>Cotação de {formatarData(resultado.data)}</Text>
      <Text style={styles.note}>
        A taxa é de referência e pode não representar uma cotação comercial em tempo real.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: cores.superficieElevada,
    borderRadius: 18,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#806B3D',
  },
  heading: { color: cores.texto, fontSize: 18, fontWeight: '800', marginBottom: 18 },
  original: { color: cores.textoSuave, fontSize: 14 },
  converted: { color: cores.destaque, fontSize: 36, fontWeight: '800', marginTop: 6, fontVariant: ['tabular-nums'] },
  divider: { height: 1, backgroundColor: cores.linha, marginVertical: 16 },
  detail: { color: cores.texto, fontSize: 14, lineHeight: 22 },
  note: { color: cores.textoSuave, fontSize: 12, lineHeight: 18, marginTop: 10 },
});
