import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

type Props = TextInputProps & { label?: string };

export default function Input({ label, ...rest }: Props) {
  return (
    <View style={{ gap: 6 }}>
      {!!label && <Text style={{ fontWeight: '600' }}>{label}</Text>}
      <TextInput
        {...rest}
        style={{
          borderWidth: 1,
          borderColor: '#e5e7eb',
          padding: 12,
          borderRadius: 10,
        }}
      />
    </View>
  );
}
