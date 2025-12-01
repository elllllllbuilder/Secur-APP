// app/(private)/member/support/new.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { api, API_BASE_URL } from '@/lib/api';

type SupportType = 'health' | 'breakdown' | 'accident' | 'theft';

const SUPPORT_TYPES = [
  {
    type: 'health' as SupportType,
    icon: '🏥',
    title: 'Emergência Médica',
    description: 'Atendimento médico urgente',
    color: '#ef4444',
  },
  {
    type: 'breakdown' as SupportType,
    icon: '🔧',
    title: 'Pane Mecânica',
    description: 'Guincho e assistência técnica',
    color: '#f59e0b',
  },
  {
    type: 'accident' as SupportType,
    icon: '🚗',
    title: 'Acidente',
    description: 'Colisão ou sinistro',
    color: '#8b5cf6',
  },
  {
    type: 'theft' as SupportType,
    icon: '🚨',
    title: 'Roubo/Furto',
    description: 'Veículo roubado ou furtado',
    color: '#10b981',
  },
];

export default function NewSupportScreen() {
  useAuthGuard();
  const router = useRouter();
  const qc = useQueryClient();

  const [selectedType, setSelectedType] = useState<SupportType | null>(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [attachments, setAttachments] = useState<any[]>([]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos de permissão para acessar suas fotos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      setAttachments([...attachments, ...result.assets]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos de permissão para usar a câmera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      setAttachments([...attachments, ...result.assets[0]]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const createTicket = useMutation({
    mutationFn: async (data: { type: SupportType; description: string; location: string; attachments: any[] }) => {
      const formData = new FormData();
      formData.append('type', data.type);
      formData.append('description', data.description);
      formData.append('location', data.location);
      formData.append('title', `Solicitação de ${data.type}`);

      // Adiciona anexos
      data.attachments.forEach((attachment, index) => {
        const uri = attachment.uri;
        const name = attachment.fileName || `photo_${index}.jpg`;
        const type = attachment.mimeType || 'image/jpeg';
        
        formData.append('attachments', {
          uri,
          name,
          type,
        } as any);
      });

      const res = await fetch(`${API_BASE_URL}/support/tickets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await import('@react-native-async-storage/async-storage').then(m => m.default.getItem('auth:access'))}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Erro ao criar ticket');
      }

      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['support-tickets'] });
      Alert.alert('Sucesso!', 'Sua solicitação foi enviada. Nossa equipe entrará em contato em breve.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Erro', error?.response?.data?.message || 'Não foi possível enviar a solicitação');
    },
  });

  const handleSubmit = () => {
    if (!selectedType) {
      Alert.alert('Atenção', 'Selecione o tipo de apoio');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Atenção', 'Descreva a situação');
      return;
    }
    if (!location.trim()) {
      Alert.alert('Atenção', 'Informe sua localização');
      return;
    }

    createTicket.mutate({ type: selectedType, description, location, attachments });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🚨 Solicitar Apoio</Text>
        <Text style={styles.subtitle}>Selecione o tipo de emergência</Text>
      </View>

      {/* Tipos de Apoio */}
      <View style={styles.typesContainer}>
        {SUPPORT_TYPES.map((item) => (
          <TouchableOpacity
            key={item.type}
            style={[
              styles.typeCard,
              selectedType === item.type && { ...styles.typeCardSelected, borderColor: item.color },
            ]}
            onPress={() => setSelectedType(item.type)}
          >
            <Text style={styles.typeIcon}>{item.icon}</Text>
            <Text style={styles.typeTitle}>{item.title}</Text>
            <Text style={styles.typeDescription}>{item.description}</Text>
            {selectedType === item.type && (
              <View style={[styles.selectedBadge, { backgroundColor: item.color }]}>
                <Text style={styles.selectedText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Formulário */}
      {selectedType && (
        <View style={styles.form}>
          <Text style={styles.label}>📍 Sua Localização</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Av. Paulista, 1000 - São Paulo"
            value={location}
            onChangeText={setLocation}
            multiline
          />

          <Text style={styles.label}>📝 Descreva a Situação</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descreva o que aconteceu e o que você precisa..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>📷 Fotos (Opcional)</Text>
          <View style={styles.attachmentButtons}>
            <TouchableOpacity style={styles.attachBtn} onPress={takePhoto}>
              <Text style={styles.attachBtnText}>📸 Câmera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.attachBtn} onPress={pickImage}>
              <Text style={styles.attachBtnText}>🖼️ Galeria</Text>
            </TouchableOpacity>
          </View>

          {attachments.length > 0 && (
            <View style={styles.attachmentsList}>
              {attachments.map((attachment, index) => (
                <View key={index} style={styles.attachmentItem}>
                  <Image source={{ uri: attachment.uri }} style={styles.attachmentImage} />
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeAttachment(index)}
                  >
                    <Text style={styles.removeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: SUPPORT_TYPES.find(t => t.type === selectedType)?.color },
            ]}
            onPress={handleSubmit}
            disabled={createTicket.isPending}
          >
            <Text style={styles.submitText}>
              {createTicket.isPending ? 'Enviando...' : '🚨 Enviar Solicitação'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.helpText}>
            ⚠️ Em caso de emergência grave, ligue imediatamente para 192 (SAMU) ou 193 (Bombeiros)
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  typesContainer: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    position: 'relative',
  },
  typeCardSelected: {
    borderWidth: 3,
    backgroundColor: '#f0f9ff',
  },
  typeIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 24,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  helpText: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    fontSize: 14,
    color: '#92400e',
    textAlign: 'center',
  },
  attachmentButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  attachBtn: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  attachBtnText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  attachmentsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  attachmentItem: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  attachmentImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
});
