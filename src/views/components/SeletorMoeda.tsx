import { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Moeda } from '@/models/modelo-moedas';
import { cores } from '@/views/tema';

type Props = {
  label: string;
  value: string;
  moedas: Moeda[];
  aoAlterar: (codigo: string) => void;
  desativado: boolean;
};

export default function SeletorMoeda({ label, value, moedas, aoAlterar, desativado }: Props) {
  const [aberto, definirAberto] = useState(false);
  const [busca, definirBusca] = useState('');
  const selecionada = moedas.find((moeda) => moeda.codigo === value);
  const moedasFiltradas = moedas.filter((moeda) => {
    const textoBusca = `${moeda.codigo} ${moeda.nome}`.toLowerCase();
    return textoBusca.includes(busca.trim().toLowerCase());
  });

  const selecionarMoeda = (codigo: string) => {
    aoAlterar(codigo);
    definirBusca('');
    definirAberto(false);
  };

  return (
    <View style={[styles.wrapper, desativado && styles.disabled]}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={styles.box}
        onPress={() => definirAberto(true)}
        disabled={desativado}
        accessibilityRole="button"
        accessibilityLabel={`Selecionar moeda ${label}`}
        accessibilityState={{ disabled: desativado }}>
        <View style={styles.valueContent}>
          <View style={styles.currencyMark}>
            <Text style={styles.currencyMarkText}>
              {selecionada?.codigo.slice(0, 2) ?? '--'}
            </Text>
          </View>
          <View style={styles.valueCopy}>
            <Text style={styles.valueCode}>{selecionada?.codigo ?? 'Escolha'}</Text>
            <Text style={styles.valueName} numberOfLines={1}>
              {selecionada?.nome ?? 'Selecione uma moeda'}
            </Text>
          </View>
        </View>
        <Text style={styles.chevron}>Abrir</Text>
      </Pressable>

      <Modal
        visible={aberto}
        transparent
        animationType="slide"
        onRequestClose={() => definirAberto(false)}>
        <Pressable style={styles.overlay} onPress={() => definirAberto(false)}>
          <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Escolha a moeda de {label.toLowerCase()}</Text>
              <Pressable onPress={() => definirAberto(false)} accessibilityRole="button">
                <Text style={styles.close}>Fechar</Text>
              </Pressable>
            </View>
            <TextInput
              value={busca}
              onChangeText={definirBusca}
              placeholder="Buscar por código ou nome"
              placeholderTextColor={cores.textoSuave}
              style={styles.search}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <FlatList
              data={moedasFiltradas}
              keyExtractor={(item) => item.codigo}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.option, item.codigo === value && styles.selectedOption]}
                  onPress={() => selecionarMoeda(item.codigo)}>
                  <View style={styles.optionContent}>
                    <View style={styles.codeBadge}>
                      <Text style={styles.codeText}>{item.codigo.slice(0, 2)}</Text>
                    </View>
                    <View style={styles.optionCopy}>
                      <Text style={styles.optionCode}>{item.codigo}</Text>
                      <Text style={styles.optionText}>{item.nome}</Text>
                    </View>
                    {item.codigo === value ? <Text style={styles.check}>✓</Text> : null}
                  </View>
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 12, flex: 1, minWidth: 0 },
  disabled: { opacity: 0.5 },
  label: { fontSize: 13, fontWeight: '600', color: cores.textoSuave, marginBottom: 8 },
  box: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: cores.linha,
    borderRadius: 12,
    backgroundColor: cores.superficieElevada,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  valueContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  currencyMark: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: cores.destaqueSuave,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  currencyMarkText: { color: cores.destaque, fontWeight: '800', fontSize: 12 },
  valueCopy: { flex: 1 },
  valueCode: { color: cores.texto, fontSize: 15, fontWeight: '800' },
  valueName: { color: cores.textoSuave, fontSize: 11, marginTop: 2 },
  chevron: { color: cores.destaque, fontSize: 12, fontWeight: '700', marginLeft: 8 },
  overlay: { flex: 1, backgroundColor: '#000000B8', justifyContent: 'flex-end' },
  modalCard: {
    maxHeight: '80%',
    backgroundColor: cores.superficie,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalTitle: { color: cores.texto, fontSize: 17, fontWeight: '700', flex: 1 },
  close: { color: cores.destaque, fontWeight: '700', marginLeft: 12 },
  search: {
    backgroundColor: cores.superficieElevada,
    borderRadius: 12,
    color: cores.texto,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  option: { paddingVertical: 10, paddingHorizontal: 8, borderRadius: 10 },
  selectedOption: { backgroundColor: cores.destaqueSuave },
  optionContent: { flexDirection: 'row', alignItems: 'center' },
  codeBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: cores.destaqueSuave,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  codeText: { color: cores.destaque, fontWeight: '800' },
  optionCopy: { flex: 1 },
  optionCode: { color: cores.texto, fontWeight: '700', fontSize: 15 },
  optionText: { color: cores.textoSuave, fontSize: 13, marginTop: 2 },
  check: { color: cores.destaque, fontSize: 20, fontWeight: '800' },
});

export { SeletorMoeda };
