import React, { useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import Button from '@/components/Button';
import { checkoutCard, checkoutBoleto, checkoutPix } from '@/services/billing';

// -------- helper p/ mensagens --------
function getErrorMessage(err: any): string {
  const data = err?.response?.data ?? err?.data ?? err;

  if (typeof data?.message === 'string') return data.message;
  if (Array.isArray(data?.message)) return data.message.join('\n');

  if (Array.isArray(data?.errors)) {
    const msgs = data.errors.map(
      (e: any) => e?.message || e?.parameter_name || JSON.stringify(e)
    );
    if (msgs.length) return msgs.join('\n');
  }

  if (typeof err?.message === 'string') return err.message;
  try {
    return JSON.stringify(data);
  } catch {}
  return 'Não foi possível concluir a operação.';
}

type Method = 'card' | 'boleto' | 'pix';

export default function Checkout() {
  const router = useRouter();

  const { planId, planName, priceCents, categoryId, categoryTitle } =
    useLocalSearchParams<{
      planId: string;
      planName: string;
      priceCents: string;
      categoryId?: string;
      categoryTitle?: string;
    }>();

  const priceNumber = Number(priceCents || 0);
  const price = (priceNumber / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const [method, setMethod] = useState<Method>('card');
  const [loading, setLoading] = useState(false);

  // Card
  const [cardNumber, setCardNumber] = useState('');
  const [holder, setHolder] = useState('');
  const [exp, setExp] = useState(''); // MM/YY
  const [cvv, setCvv] = useState('');

  async function onPay() {
    try {
      if (!planId) {
        Alert.alert('Erro', 'Plano inválido.');
        return;
      }
      setLoading(true);

      if (method === 'card') {
        const [mm, yy] = (exp || '').split('/');
        if (!cardNumber || !holder || !mm || !yy || !cvv) {
          Alert.alert('Atenção', 'Preencha todos os dados do cartão.');
          return;
        }

        await checkoutCard(String(planId), {
          categoryId: categoryId || undefined,
          card_number: cardNumber.replace(/\s+/g, ''),
          card_holder_name: holder.trim(),
          card_expiration_date: `${mm}${yy}`,
          card_cvv: cvv,
        });

        Alert.alert('Sucesso', 'Assinatura no cartão criada!', [
          { text: 'OK', onPress: () => router.replace('/(private)/member') },
        ]);
      }

      if (method === 'boleto') {
        const data = await checkoutBoleto(String(planId), {
          categoryId: categoryId || undefined,
        });

        const barcode: string | undefined = data?.boleto?.barcode;
        const url: string | undefined = data?.boleto?.url;

        Alert.alert(
          'Boleto gerado',
          barcode ? `Linha digitável:\n${barcode}` : 'Boleto criado.',
          [
            {
              text: 'Abrir PDF',
              onPress: () => {
                if (url) Linking.openURL(url).catch(() => {});
              },
            },
            { text: 'OK', onPress: () => router.replace('/(private)/member') },
          ]
        );
      }

      if (method === 'pix') {
        const data = await checkoutPix(String(planId), {
          categoryId: categoryId || undefined,
        });

        const qrText: string =
          data?.pix?.qrCodeText || data?.pix?.qrCode || '';

        router.push({
          pathname: '/(private)/associate/pix',
          params: {
            qr: qrText || '',
            price: price,
          },
        });
      }
    } catch (e: any) {
      console.log('Checkout error:', e?.response?.data ?? e);
      Alert.alert('Pagamento falhou', getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: '700' }}>Checkout</Text>
      {!!categoryTitle && <Text>{String(categoryTitle)}</Text>}
      <Text style={{ fontWeight: '600' }}>
        {String(planName)} — {price}
      </Text>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        {(['card', 'boleto', 'pix'] as Method[]).map((m) => (
          <TouchableOpacity
            key={m}
            onPress={() => setMethod(m)}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: method === m ? '#111827' : '#e5e7eb',
            }}
          >
            <Text style={{ fontWeight: method === m ? '700' : '500' }}>
              {m === 'card' ? 'Cartão' : m === 'boleto' ? 'Boleto' : 'PIX'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {method === 'card' && (
        <View style={{ gap: 10, marginTop: 8 }}>
          <View>
            <Text>Nome no cartão</Text>
            <TextInput
              value={holder}
              onChangeText={setHolder}
              placeholder="JOSE SILVA"
              autoCapitalize="characters"
              style={{
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 10,
                padding: 12,
              }}
            />
          </View>

          <View>
            <Text>Número do cartão</Text>
            <TextInput
              value={cardNumber}
              onChangeText={setCardNumber}
              placeholder="4111 1111 1111 1111"
              keyboardType="numeric"
              style={{
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 10,
                padding: 12,
              }}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text>Validade (MM/YY)</Text>
              <TextInput
                value={exp}
                onChangeText={setExp}
                placeholder="12/28"
                keyboardType="numeric"
                style={{
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                  borderRadius: 10,
                  padding: 12,
                }}
              />
            </View>
            <View style={{ width: 100 }}>
              <Text>CVV</Text>
              <TextInput
                value={cvv}
                onChangeText={setCvv}
                placeholder="123"
                keyboardType="numeric"
                secureTextEntry
                style={{
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                  borderRadius: 10,
                  padding: 12,
                }}
              />
            </View>
          </View>
        </View>
      )}

      {method === 'boleto' && (
        <Text style={{ color: '#6b7280', marginTop: 8 }}>
          Geraremos um boleto da 1ª mensalidade. Você poderá ver e baixar o PDF.
        </Text>
      )}

      {method === 'pix' && (
        <Text style={{ color: '#6b7280', marginTop: 8 }}>
          Geraremos um QR Code PIX desta fatura. Ao pagar, seu status atualiza
          pelo webhook.
        </Text>
      )}

      <Button title={`Pagar ${price}`} onPress={onPay} loading={loading} />
    </ScrollView>
  );
}

// Added submit navigation
export function SubmitButton() {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={{
        backgroundColor: '#00a9ff',
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
      }}
      onPress={() => router.replace('/(private)/associate/confirmation')}
    >
      <Text style={{ color: 'white', textAlign: 'center' }}>
        ASSOCIAR-SE AGORA
      </Text>
    </TouchableOpacity>
  );
}
