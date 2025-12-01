import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

interface Banner {
  id: number;
  imageUrl: string;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadBanners();
  }, []);

  async function loadBanners() {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/admin/banners`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBanners(data);
    } catch (error) {
      console.error('Erro ao carregar banners:', error);
      alert('Erro ao carregar banners');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Imagem muito grande! Máximo 5MB');
      return;
    }

    // Validar tipo
    if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
      alert('Apenas imagens JPG, PNG ou GIF são permitidas');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/admin/banners`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Erro ao fazer upload');

      alert('Banner adicionado com sucesso!');
      loadBanners();
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload do banner');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function toggleActive(id: number, active: boolean) {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/admin/banners/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !active }),
      });
      loadBanners();
    } catch (error) {
      console.error('Erro ao atualizar banner:', error);
      alert('Erro ao atualizar banner');
    }
  }

  async function deleteBanner(id: number) {
    if (!confirm('Tem certeza que deseja deletar este banner?')) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/admin/banners/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Banner deletado com sucesso!');
      loadBanners();
    } catch (error) {
      console.error('Erro ao deletar banner:', error);
      alert('Erro ao deletar banner');
    }
  }

  async function moveUp(banner: Banner) {
    if (banner.order === 1) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/admin/banners/${banner.id}/reorder`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order: banner.order - 1 }),
      });
      loadBanners();
    } catch (error) {
      console.error('Erro ao reordenar:', error);
      alert('Erro ao reordenar banner');
    }
  }

  async function moveDown(banner: Banner) {
    if (banner.order === banners.length) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/admin/banners/${banner.id}/reorder`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order: banner.order + 1 }),
      });
      loadBanners();
    } catch (error) {
      console.error('Erro ao reordenar:', error);
      alert('Erro ao reordenar banner');
    }
  }

  if (loading) {
    return <div style={{ padding: '20px' }}>Carregando...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>🎨 Gerenciar Banners</h2>
        <label style={{
          backgroundColor: '#00a9ff',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '8px',
          cursor: uploading ? 'not-allowed' : 'pointer',
          opacity: uploading ? 0.6 : 1,
        }}>
          {uploading ? 'Enviando...' : '+ Adicionar Banner'}
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      <div style={{
        backgroundColor: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px',
      }}>
        <strong>📏 Tamanho recomendado:</strong> 1200x600px (proporção 2:1)<br />
        <strong>📦 Tamanho máximo:</strong> 5MB<br />
        <strong>🖼️ Formatos:</strong> JPG, PNG, GIF
      </div>

      {banners.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
        }}>
          <p style={{ color: '#6c757d' }}>Nenhum banner cadastrado</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {banners.map((banner) => (
            <div
              key={banner.id}
              style={{
                backgroundColor: 'white',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                padding: '15px',
                display: 'flex',
                gap: '15px',
                alignItems: 'center',
              }}
            >
              <div style={{
                width: '200px',
                height: '100px',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#f8f9fa',
              }}>
                <img
                  src={`${API_URL}${banner.imageUrl}`}
                  alt="Banner"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{
                    backgroundColor: banner.active ? '#28a745' : '#6c757d',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}>
                    {banner.active ? '✓ ATIVO' : '✗ INATIVO'}
                  </span>
                  <span style={{ marginLeft: '10px', color: '#6c757d', fontSize: '14px' }}>
                    Ordem: {banner.order}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>
                  Criado em: {new Date(banner.createdAt).toLocaleString('pt-BR')}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => moveUp(banner)}
                    disabled={banner.order === 1}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: banner.order === 1 ? '#e9ecef' : '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: banner.order === 1 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveDown(banner)}
                    disabled={banner.order === banners.length}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: banner.order === banners.length ? '#e9ecef' : '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: banner.order === banners.length ? 'not-allowed' : 'pointer',
                    }}
                  >
                    ↓
                  </button>
                </div>
                <button
                  onClick={() => toggleActive(banner.id, banner.active)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: banner.active ? '#ffc107' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  {banner.active ? 'Desativar' : 'Ativar'}
                </button>
                <button
                  onClick={() => deleteBanner(banner.id)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Deletar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
