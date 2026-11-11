import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useConversorMoedas } from '@/viewmodels/use-conversor-moedas';
import { cores } from '@/views/tema';
import SeletorMoeda from '@/views/components/SeletorMoeda';
import FaixaErro from '@/views/components/FaixaErro';
import CartaoResultado from '@/views/components/CartaoResultado';

export default function TelaConversor() {
  const estado = useConversorMoedas();
  const possuiMoedas = estado.moedas.length > 0;
  const seletoresDesativados =
    estado.carregandoMoedas || estado.convertendo || !possuiMoedas;
  const podeConverter = possuiMoedas && !estado.carregandoMoedas && !estado.convertendo;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag">
          <View style={styles.header}>
            <Text style={styles.title}>Conversor de moedas</Text>
            <Text style={styles.subtitle}>Consulte uma cotação de referência.</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Valor</Text>
              <Text style={styles.sectionHint}>Digite um valor para começar</Text>
            </View>
            <TextInput
              style={[styles.input, estado.erroValidacao && styles.inputError]}
              value={estado.textoValor}
              onChangeText={estado.alterarTextoValor}
              placeholder="0,00"
              placeholderTextColor={cores.textoSuave}
              keyboardType="decimal-pad"
              returnKeyType="done"
              onSubmitEditing={() => void estado.converter()}
              editable={!estado.convertendo}
              accessibilityLabel="Valor a converter"
            />
            {estado.erroValidacao ? <Text style={styles.validation}>{estado.erroValidacao}</Text> : null}

            {estado.carregandoMoedas ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={cores.destaque} />
                <Text style={styles.loadingText}>Carregando moedas...</Text>
              </View>
            ) : null}
            {estado.erroMoedas ? (
              <FaixaErro mensagem={estado.erroMoedas} aoTentarNovamente={() => void estado.recarregarMoedas()} />
            ) : null}

            <View style={styles.currencyHeader}>
              <Text style={styles.sectionTitle}>Moedas</Text>
              <Text style={styles.sectionHint}>Defina a origem e o destino</Text>
            </View>
            <View style={styles.moedasLinha}>
              <SeletorMoeda
                label="Origem"
                value={estado.moedaOrigem}
                moedas={estado.moedas}
                aoAlterar={estado.alterarMoedaOrigem}
                desativado={seletoresDesativados}
              />
              <SeletorMoeda
                label="Destino"
                value={estado.moedaDestino}
                moedas={estado.moedas}
                aoAlterar={estado.alterarMoedaDestino}
                desativado={seletoresDesativados}
              />
            </View>
            <Pressable
              onPress={estado.inverterMoedas}
              disabled={seletoresDesativados}
              style={[styles.swap, seletoresDesativados && styles.swapDisabled]}
              accessibilityRole="button"
              accessibilityLabel="Trocar moedas">
              <Text style={styles.swapText}>Trocar moedas</Text>
            </Pressable>
            <Pressable
              onPress={() => void estado.converter()}
              disabled={!podeConverter}
              style={[styles.button, !podeConverter && styles.buttonDisabled]}
              accessibilityRole="button">
              {estado.convertendo ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Converter</Text>
              )}
            </Pressable>
          </View>

          {estado.erroApi ? <FaixaErro mensagem={estado.erroApi} aoTentarNovamente={() => void estado.converter()} /> : null}
          {estado.resultado ? (
            <View accessibilityLiveRegion="polite">
              <CartaoResultado resultado={estado.resultado} />
            </View>
          ) : null}
          <Text style={styles.disclaimer}>
            A taxa exibida é de referência e pode não representar uma cotação comercial em tempo real.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: cores.fundo },
  flex: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 48 },
  header: { marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: cores.texto },
  subtitle: { fontSize: 14, color: cores.textoSuave, lineHeight: 20, marginTop: 6, marginBottom: 22 },
  card: {
    backgroundColor: cores.superficie,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: cores.linha,
  },
  sectionHeader: { marginBottom: 12 },
  currencyHeader: { marginTop: 24, marginBottom: 4 },
  moedasLinha: { flexDirection: 'row', gap: 10 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: cores.texto },
  sectionHint: { fontSize: 13, color: cores.textoSuave, marginTop: 4 },
  input: {
    borderWidth: 1.5,
    borderColor: cores.linha,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 38,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    color: cores.texto,
    backgroundColor: cores.superficieElevada,
  },
  inputError: { borderColor: cores.erro },
  validation: { color: cores.erro, fontSize: 13, marginTop: 6 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  loadingText: { marginLeft: 10, color: cores.textoSuave },
  swap: {
    alignSelf: 'center',
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 2,
    borderRadius: 20,
    backgroundColor: cores.destaqueSuave,
  },
  swapDisabled: { opacity: 0.4 },
  swapText: { color: cores.destaque, fontWeight: '800', fontSize: 13 },
  button: {
    backgroundColor: cores.destaque,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 18,
  },
  buttonDisabled: { backgroundColor: cores.destaqueDesativado },
  buttonText: { color: '#0D160D', fontSize: 17, fontWeight: '800' },
  disclaimer: {
    color: cores.textoSuave,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 22,
    paddingHorizontal: 12,
  },
});
