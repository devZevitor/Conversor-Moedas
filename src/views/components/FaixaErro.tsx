import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cores } from '@/views/tema';

type Props = {
  mensagem: string;
  aoTentarNovamente?: () => void;
};

export default function FaixaErro({ mensagem, aoTentarNovamente }: Props) {
  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Text style={styles.text}>{mensagem}</Text>
      {aoTentarNovamente ? (
        <Pressable onPress={aoTentarNovamente} style={styles.retry} accessibilityRole="button">
          <Text style={styles.retryText}>Tentar novamente</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: cores.fundoErro,
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: cores.erro,
  },
  text: { color: cores.erro, fontSize: 14, lineHeight: 20 },
  retry: { alignSelf: 'flex-start', marginTop: 10, paddingVertical: 4 },
  retryText: { color: cores.erro, fontWeight: '700', textDecorationLine: 'underline' },
});
