// app/(private)/member/support/[id].tsx
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { api, API_BASE_URL } from '@/lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TYPE_CONFIG = {
  health: { icon: '🏥', label: 'Emergência Médica', color: '#ef4444' },
  breakdown: { icon: '🔧', label: 'Pane Mecânica', color: '#f59e0b' },
  accident: { icon: '🚗', label: 'Acidente', color: '#8b5cf6' },
  theft: { icon: '🚨', label: 'Roubo/Furto', color: '#10b981' },
};

const STATUS_CONFIG = {
  open: { label: 'Aberto', color: '#3b82f6', bg: '#dbeafe' },
  in_progress: { label: 'Em Andamento', color: '#f59e0b', bg: '#fef3c7' },
  resolved: { label: 'Resolvido', color: '#10b981', bg: '#d1fae5' },
  closed: { label: 'Fechado', color: '#6b7280', bg: '#f3f4f6' },
};

export default function SupportDetailScreen() {
  useAuthGuard();
  const router = useRouter();
  const qc = useQueryClient();
  const { id } = useLocalSearchParams();
  const scrollRef = useRef<ScrollView>(null);

  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<any[]>([]);

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['support-ticket', id],
    queryFn: async () => {
      const res = await api.get(`/support/tickets/${id}`);
      return res.data?.data?.data || res.data?.data || res.data;
    },
    enabled: !!id,
  });

  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ['support-messages', id],
    queryFn: async () => {
      const res = await api.get(`/support/tickets/${id}/messages`);
      const data = res.data?.data?.data || res.data?.data || res.data || [];
      return Array.isArray(data) ? data : [];
    },
    enabled: !!id,
    refetchInterval: 5000, // Atualiza a cada 5 segundos
  });

  useEffect(() => {
    // Scroll para o final quando novas mensagens chegarem
    if (messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      setAttachments([...attachments, result.assets[0]]);
    }
  };

  const sendMessage = useMutation({
    mutationFn: async (data: { message: string; attachments: any[] }) => {
      const formData = new FormData();
      if (data.message) formData.append('message', data.message);

      data.attachments.forEach((attachment, index) => {
        formData.append('attachments', {
          uri: attachment.uri,
          name: attachment.fileName || `photo_${index}.jpg`,
          type: attachment.mimeType || 'image/jpeg',
        } as any);
      });

      const token = await AsyncStorage.getItem('auth:access');
      const res = await fetch(`${API_BASE_URL}/support/tickets/${id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error('Erro ao enviar mensagem');
      return res.json();
    },
    onSuccess: () => {
      setMessage('');
      setAttachments([]);
      refetchMessages();
    },
  });

  const handleSend = () => {
    if (!message.trim() && attachments.length === 0) return;
    sendMessage.mutate({ message, attachments });
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#00a9ff" />
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={styles.container}>
        <View style={styles.error}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.errorText}>Solicitação não encontrada</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const typeConfig = TYPE_CONFIG[ticket.type as keyof typeof TYPE_CONFIG];
  const statusConfig = STATUS_CONFIG[ticket.status as keyof typeof STATUS_CONFIG];

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{typeConfig?.icon} {typeConfig?.label}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig?.bg }]}>
            <Text style={[styles.statusText, { color: statusConfig?.color }]}>
              {statusConfig?.label}
            </Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {/* Info inicial */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📍 {ticket.location}</Text>
          <Text style={styles.infoDescription}>{ticket.description}</Text>
          <Text style={styles.infoDate}>
            {new Date(ticket.createdAt).toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: 'short', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>

        {/* Mensagens */}
        {messages.map((msg: any) => (
          <View
            key={msg.id}
            style={[
              styles.messageBubble,
              msg.isAdmin ? styles.adminMessage : styles.userMessage,
            ]}
          >
            {msg.isAdmin && (
              <Text style={styles.senderName}>👨‍💼 Suporte</Text>
            )}
            {msg.message && (
              <Text style={styles.messageText}>{msg.message}</Text>
            )}
            {msg.attachments && Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
              <View style={styles.attachmentsGrid}>
                {msg.attachments.map((url: string, idx: number) => (
                  <Image key={idx} source={{ uri: url }} style={styles.attachmentImage} />
                ))}
              </View>
            )}
            <Text style={styles.messageTime}>
              {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        {attachments.length > 0 && (
          <View style={styles.attachmentPreview}>
            {attachments.map((att, idx) => (
              <View key={idx} style={styles.previewItem}>
                <Image source={{ uri: att.uri }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removePreview}
                  onPress={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                >
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.attachButton} onPress={pickImage}>
            <Text style={styles.attachIcon}>📎</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Digite sua mensagem..."
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, (!message.trim() && attachments.length === 0) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={sendMessage.isPending || (!message.trim() && attachments.length === 0)}
          >
            <Text style={styles.sendIcon}>
              {sendMessage.isPending ? '⏳' : '📤'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#00a9ff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    paddingTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backBtn: {
    marginRight: 12,
  },
  backIcon: {
    fontSize: 24,
    color: '#00a9ff',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#00a9ff',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: '#1e40af',
    marginBottom: 8,
  },
  infoDate: {
    fontSize: 12,
    color: '#60a5fa',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#00a9ff',
  },
  adminMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 20,
  },
  attachmentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
  },
  attachmentImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  messageTime: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 12,
  },
  attachmentPreview: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  previewItem: {
    position: 'relative',
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  removePreview: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ef4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachIcon: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00a9ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  sendIcon: {
    fontSize: 20,
  },
});
