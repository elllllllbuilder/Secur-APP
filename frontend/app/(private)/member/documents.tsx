// app/(private)/member/documents.tsx
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Alert, FlatList } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  listMyDocuments,
  uploadMyDocument,
  deleteMyDocument,
  type MyDoc, // ← use o tipo do serviço
} from '@/services/documents';
import { getMe } from '@/services/profile';
import { getPublicCategories } from '@/services/public';
import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function DocumentsScreen() {
  useAuthGuard();
  const qc = useQueryClient();

  // Perfil e categorias
  const { data: me } = useQuery({ queryKey: ['me'], queryFn: getMe });

  const { data: myDocs, isLoading: isLoadingDocs } = useQuery<MyDoc[]>({
    queryKey: ['me/documents'],
    queryFn: listMyDocuments,
  });

  const { data: categories, isLoading: isLoadingCats } = useQuery({
    queryKey: ['public/categories'],
    queryFn: getPublicCategories,
  });

  // Indexa meus docs por "code"
  const myByCode = useMemo(() => {
    const map = new Map<string, MyDoc[]>();
    ((myDocs ?? []) as MyDoc[]).forEach((d: MyDoc) => {
      const arr = map.get(d.code) ?? [];
      arr.push(d);
      map.set(d.code, arr);
    });
    return map;
  }, [myDocs]);

  const currentCategory = useMemo(() => {
    if (!me?.categoryId || !categories) return undefined;
    return (categories as any[]).find((c) => c.id === me.categoryId);
  }, [me?.categoryId, categories]);

  const requiredList = currentCategory?.requiredDocs ?? [];

  // ===== Helpers câmera/galeria/arquivos =====
  function toUploadFileFromAsset(asset: ImagePicker.ImagePickerAsset) {
    const uri = asset.uri;
    const guessedExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const name = asset.fileName || `photo_${Date.now()}.${guessedExt}`;
    const type =
      asset.mimeType ||
      (guessedExt === 'png'
        ? 'image/png'
        : guessedExt === 'heic'
        ? 'image/heic'
        : guessedExt === 'webp'
        ? 'image/webp'
        : 'image/jpeg');
    return { uri, name, type } as any;
  }

  async function pickFromCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') throw new Error('Permissão da câmera negada.');
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (res.canceled || !res.assets?.length) return null;
    return toUploadFileFromAsset(res.assets[0]);
  }

  async function pickFromGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') throw new Error('Permissão à galeria negada.');
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (res.canceled || !res.assets?.length) return null;
    return toUploadFileFromAsset(res.assets[0]);
  }

  async function pickFromFiles() {
    const res = await DocumentPicker.getDocumentAsync({ multiple: false });
    if (res.canceled || !res.assets?.length) return null;
    const f = res.assets[0];
    return {
      uri: f.uri,
      name: f.name || 'document',
      type: f.mimeType || 'application/octet-stream',
    } as any;
  }

  // Abre opções (câmera/galeria/arquivo)
  async function chooseSource(): Promise<any | null> {
    return new Promise((resolve) => {
      Alert.alert(
        'Enviar documento',
        'Escolha a fonte',
        [
          {
            text: 'Câmera',
            onPress: async () => {
              try {
                resolve(await pickFromCamera());
              } catch (e: any) {
                Alert.alert('Erro', e?.message || 'Falha ao abrir câmera');
                resolve(null);
              }
            },
          },
          {
            text: 'Galeria',
            onPress: async () => {
              try {
                resolve(await pickFromGallery());
              } catch (e: any) {
                Alert.alert('Erro', e?.message || 'Falha ao abrir galeria');
                resolve(null);
              }
            },
          },
          {
            text: 'Arquivo (PDF/DOC/IMG)',
            onPress: async () => {
              try {
                resolve(await pickFromFiles());
              } catch (e: any) {
                Alert.alert('Erro', e?.message || 'Falha ao abrir arquivos');
                resolve(null);
              }
            },
          },
          { text: 'Cancelar', style: 'cancel', onPress: () => resolve(null) },
        ],
        { cancelable: true }
      );
    });
  }

  // ===== Mutations =====
  const pickAndUpload = useMutation({
    mutationFn: async (code: string) => {
      const file = await chooseSource();
      if (!file) return;
      await uploadMyDocument({ code, file });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me/documents'] }),
    onError: (e: any) => {
      console.log('[UPLOAD] error:', e?.message, e?.response?.status, e?.response?.data);
      Alert.alert('Erro', e?.message || e?.response?.data?.message || 'Falha no upload');
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteMyDocument(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me/documents'] }),
    onError: (e: any) => {
      console.log('[DOC DELETE] error:', e?.message, e?.response?.status, e?.response?.data);
      Alert.alert('Erro', e?.response?.data?.message || 'Falha ao excluir');
    },
  });

  // Função para atualizar categoria
  const updateCategory = useMutation({
    mutationFn: async (categoryId: string) => {
      const { api } = await import('@/lib/api');
      return api.patch('/me/profile', { categoryId });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] });
      Alert.alert('Sucesso', 'Categoria atualizada!');
    },
    onError: () => {
      Alert.alert('Erro', 'Não foi possível atualizar a categoria');
    },
  });

  // ===== UI =====
  
  // Se não tem categoria, mostra seletor
  if (!isLoadingCats && !currentCategory && categories && (categories as any[]).length > 0) {
    return (
      <View style={{ flex: 1, padding: 20, backgroundColor: '#f9fafb' }}>
        <View style={{ 
          backgroundColor: 'white', 
          padding: 20, 
          borderRadius: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3
        }}>
          <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8, color: '#00a9ff' }}>
            📄 Selecione sua Categoria
          </Text>
          <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>
            Para enviar documentos, primeiro escolha a categoria que melhor se aplica a você.
          </Text>

          {(categories as any[]).map((cat: any) => (
            <TouchableOpacity
              key={cat.id}
              style={{
                padding: 16,
                backgroundColor: '#f3f4f6',
                borderRadius: 8,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: '#e5e7eb'
              }}
              onPress={() => {
                Alert.alert(
                  'Confirmar Categoria',
                  `Deseja selecionar "${cat.title}"?`,
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    { 
                      text: 'Confirmar', 
                      onPress: () => updateCategory.mutate(cat.id)
                    }
                  ]
                );
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                {cat.title}
              </Text>
              <Text style={{ fontSize: 14, color: '#6b7280' }}>
                {cat.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#f9fafb' }}>
      <View style={{ 
        backgroundColor: 'white', 
        padding: 16, 
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
      }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#00a9ff', marginBottom: 8 }}>
          📄 Meus Documentos
        </Text>

        {/* Cabeçalho com categoria */}
        {isLoadingCats ? (
          <Text style={{ color: '#6b7280' }}>Carregando categoria...</Text>
        ) : currentCategory ? (
          <View style={{ 
            backgroundColor: '#eff6ff', 
            padding: 12, 
            borderRadius: 8,
            borderLeftWidth: 4,
            borderLeftColor: '#00a9ff'
          }}>
            <Text style={{ fontWeight: '600', fontSize: 16, color: '#1e40af' }}>
              {currentCategory.title}
            </Text>
            <Text style={{ color: '#6b7280', marginTop: 4 }}>
              {currentCategory.description}
            </Text>
          </View>
        ) : (
          <View style={{ 
            backgroundColor: '#fee2e2', 
            padding: 12, 
            borderRadius: 8,
            borderLeftWidth: 4,
            borderLeftColor: '#ef4444'
          }}>
            <Text style={{ color: '#991b1b', fontWeight: '600' }}>
              Categoria não selecionada
            </Text>
          </View>
        )}
      </View>

      {/* Lista de exigências */}
      <View style={{ 
        backgroundColor: 'white', 
        padding: 16, 
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
      }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#1f2937', marginBottom: 8 }}>
          📋 Documentos Exigidos ({requiredList.length})
        </Text>
        {requiredList.length === 0 && (
          <Text style={{ color: '#6b7280', fontSize: 14 }}>
            Nenhum documento obrigatório para esta categoria.
          </Text>
        )}
      </View>

      <FlatList
        style={{ flex: 1 }}
        data={requiredList}
        keyExtractor={(i: any) => String(i.id)}
        renderItem={({ item }: { item: any }) => {
          const sent: MyDoc[] = myByCode.get(item.code) ?? [];
          const isDone = sent.length > 0;
          return (
            <View
              style={{
                padding: 12,
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 10,
                marginBottom: 10,
                backgroundColor: isDone ? '#f0fdf4' : 'white',
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700' }}>{item.label}</Text>
                  <Text style={{ color: '#6b7280' }}>Código: {item.code}</Text>
                  {item.isOptional && <Text style={{ color: '#6b7280' }}>(Opcional)</Text>}
                </View>

                <TouchableOpacity
                  onPress={() => pickAndUpload.mutate(item.code)}
                  style={{
                    backgroundColor: '#111827',
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    alignSelf: 'flex-start',
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '700' }}>
                    {isDone ? 'Reenviar' : 'Enviar'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Já enviados */}
              {sent.map((doc: MyDoc) => {
                const isRejected = doc.verified === false;
                const isApproved = doc.verified === true;
                const isPending = doc.verified === null;
                
                return (
                  <View
                    key={doc.id}
                    style={{
                      marginTop: 8,
                      padding: 12,
                      borderWidth: 2,
                      borderColor: isRejected ? '#ef4444' : isApproved ? '#10b981' : '#e5e7eb',
                      borderRadius: 8,
                      backgroundColor: isRejected ? '#fee2e2' : isApproved ? '#d1fae5' : 'white',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Text style={{ fontSize: 20, marginRight: 8 }}>
                        {isRejected ? '❌' : isApproved ? '✅' : '⏳'}
                      </Text>
                      <Text style={{ fontWeight: '700', flex: 1 }}>
                        {doc.originalName ?? doc.mime}
                      </Text>
                    </View>
                    
                    <Text style={{ 
                      color: isRejected ? '#991b1b' : isApproved ? '#065f46' : '#6b7280',
                      fontWeight: '600',
                      marginBottom: 4
                    }}>
                      {isRejected ? '❌ RECUSADO - Reenvie o documento' : isApproved ? '✅ Aprovado' : '⏳ Em análise'}
                    </Text>
                    
                    {isRejected && (
                      <Text style={{ 
                        color: '#991b1b', 
                        fontSize: 12, 
                        marginBottom: 8,
                        fontStyle: 'italic'
                      }}>
                        Verifique suas notificações para ver o motivo da recusa.
                      </Text>
                    )}
                    
                    <TouchableOpacity onPress={() => remove.mutate(doc.id)} style={{ marginTop: 6 }}>
                      <Text style={{ color: '#ef4444', fontWeight: '700' }}>
                        {isRejected ? '🗑️ Excluir e Reenviar' : '🗑️ Excluir'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          );
        }}
        ListFooterComponent={
          <>
            {/* Também mostra documentos “soltos” (sem exigência mapeada) */}
            <Text style={{ marginTop: 16, fontWeight: '700' }}>Outros documentos enviados</Text>
            {isLoadingDocs ? (
              <Text style={{ marginTop: 6 }}>Carregando...</Text>
            ) : (
              ((myDocs ?? []) as MyDoc[])
                .filter((d: MyDoc) => !requiredList.some((r: any) => r.code === d.code))
                .map((d: MyDoc) => {
                  const isRejected = d.verified === false;
                  const isApproved = d.verified === true;
                  
                  return (
                    <View
                      key={d.id}
                      style={{
                        marginTop: 8,
                        padding: 12,
                        borderWidth: 2,
                        borderColor: isRejected ? '#ef4444' : isApproved ? '#10b981' : '#e5e7eb',
                        borderRadius: 8,
                        backgroundColor: isRejected ? '#fee2e2' : isApproved ? '#d1fae5' : 'white',
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Text style={{ fontSize: 20, marginRight: 8 }}>
                          {isRejected ? '❌' : isApproved ? '✅' : '⏳'}
                        </Text>
                        <Text style={{ fontWeight: '700', flex: 1 }}>
                          {d.code} — {d.originalName ?? d.mime}
                        </Text>
                      </View>
                      
                      <Text style={{ 
                        color: isRejected ? '#991b1b' : isApproved ? '#065f46' : '#6b7280',
                        fontWeight: '600'
                      }}>
                        {isRejected ? '❌ RECUSADO - Reenvie o documento' : isApproved ? '✅ Aprovado' : '⏳ Em análise'}
                      </Text>
                      
                      {isRejected && (
                        <Text style={{ 
                          color: '#991b1b', 
                          fontSize: 12, 
                          marginTop: 4,
                          fontStyle: 'italic'
                        }}>
                          Verifique suas notificações para ver o motivo.
                        </Text>
                      )}
                      
                      <TouchableOpacity onPress={() => remove.mutate(d.id)} style={{ marginTop: 6 }}>
                        <Text style={{ color: '#ef4444', fontWeight: '700' }}>
                          {isRejected ? '🗑️ Excluir e Reenviar' : '🗑️ Excluir'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })
            )}
          </>
        }
      />
    </View>
  );
}
