import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BannersPage } from './BannersPage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

// Tipos
interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  role: string;
  categoryId?: string;
  createdAt: string;
  subscriptions?: Subscription[];
}

interface Subscription {
  id: string;
  status: string;
  plan: Plan;
  startedAt: string;
  currentPeriodEnd: string;
}

interface Plan {
  id: string;
  tier: string;
  displayName: string;
  priceCents: number;
  interval?: string;
  intervalCount?: number;
}

interface Payment {
  id: string;
  method: string;
  status: string;
  amountCents: number;
  createdAt: string;
  user: { name: string; email: string };
}

interface GasStation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  hasElectricCharger: boolean;
}

interface Document {
  id: string;
  userId: string;
  code: string;
  url: string;
  verified: boolean | null;
  uploadedAt: string;
  user: {
    name: string;
    email: string;
    phone: string;
    category?: { title: string };
    subscriptions?: Array<{ plan: { displayName: string; tier: string } }>;
  };
}

interface SupportCase {
  id: string;
  userId: string;
  subject: string;
  description: string;
  status: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

// API Helper
const api = {
  async get(endpoint: string) {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}${endpoint}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (res.status === 401) {
        localStorage.removeItem('token');
        window.location.reload();
        throw new Error('Não autorizado');
      }
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || 'Erro na requisição');
      }
      
      const json = await res.json();
      
      // Se retornar {success: true, data: ...}, extrai o data
      if (json && typeof json === 'object' && 'data' in json) {
        return json.data;
      }
      
      return json;
    } catch (error: any) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  async post(endpoint: string, data: any) {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(data)
      });
      
      if (res.status === 401) {
        localStorage.removeItem('token');
        window.location.reload();
        throw new Error('Não autorizado');
      }
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || 'Erro na requisição');
      }
      
      return res.json();
    } catch (error: any) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  async delete(endpoint: string) {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (res.status === 401) {
        localStorage.removeItem('token');
        window.location.reload();
        throw new Error('Não autorizado');
      }
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || 'Erro na requisição');
      }
      
      return res.json();
    } catch (error: any) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async patch(endpoint: string, data: any) {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(data)
      });
      
      if (res.status === 401) {
        localStorage.removeItem('token');
        window.location.reload();
        throw new Error('Não autorizado');
      }
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || 'Erro na requisição');
      }
      
      return res.json();
    } catch (error: any) {
      console.error('API Error:', error);
      throw error;
    }
  }
};

// Componente Principal
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [gasStations, setGasStations] = useState<GasStation[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [supportCases, setSupportCases] = useState<SupportCase[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [currentPage, isLoggedIn]);

  async function handleLogin(email: string, password: string) {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data?.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
        setIsLoggedIn(true);
      } else if (response.accessToken) {
        localStorage.setItem('token', response.accessToken);
        setIsLoggedIn(true);
      } else {
        throw new Error('Token não recebido');
      }
    } catch (error: any) {
      setError(error.message || 'Erro ao fazer login');
      alert('Erro ao fazer login: ' + (error.message || 'Verifique suas credenciais'));
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setCurrentPage('dashboard');
  }

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      if (currentPage === 'dashboard') {
        // Carregar estatísticas
        const usersData = await api.get('/admin/users');
        const paymentsData = await api.get('/admin/payments');
        
        // Garantir que são arrays
        const users = Array.isArray(usersData) ? usersData : [];
        const payments = Array.isArray(paymentsData) ? paymentsData : [];
        
        setStats({
          totalUsers: users.length,
          activeSubscriptions: users.filter((u: User) => 
            u.subscriptions?.some(s => s.status === 'ACTIVE')
          ).length,
          totalRevenue: payments
            .filter((p: Payment) => p.status === 'approved')
            .reduce((sum: number, p: Payment) => sum + p.amountCents, 0) / 100,
          pendingPayments: payments.filter((p: Payment) => p.status === 'pending').length
        });
      } else if (currentPage === 'users') {
        const data = await api.get('/admin/users');
        setUsers(Array.isArray(data) ? data : []);
      } else if (currentPage === 'payments') {
        const data = await api.get('/admin/payments');
        setPayments(Array.isArray(data) ? data : []);
      } else if (currentPage === 'gas-stations') {
        const data = await api.get('/gas-stations');
        setGasStations(Array.isArray(data) ? data : []);
      } else if (currentPage === 'documents') {
        const data = await api.get('/admin/documents');
        setDocuments(Array.isArray(data) ? data : []);
      } else if (currentPage === 'support') {
        const data = await api.get('/admin/support/tickets');
        console.log('[ADMIN] Support tickets:', data);
        const tickets = data?.data || data || [];
        setSupportTickets(Array.isArray(tickets) ? tickets : []);
      } else if (currentPage === 'plans') {
        const data = await api.get('/admin/plans');
        setPlans(Array.isArray(data?.data || data) ? (data?.data || data) : []);
      } else if (currentPage === 'categories') {
        const data = await api.get('/admin/categories');
        setCategories(Array.isArray(data?.data || data) ? (data?.data || data) : []);
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      setError(error.message || 'Erro ao carregar dados');
      
      // Se for erro de autenticação, faz logout
      if (error.message?.includes('autorizado') || error.message?.includes('401')) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSendPush() {
    const title = prompt('Título da notificação:');
    const body = prompt('Mensagem:');
    
    if (title && body) {
      try {
        await api.post('/notifications/send-to-all', { title, body });
        alert('Notificação enviada!');
      } catch (error) {
        alert('Erro ao enviar notificação');
      }
    }
  }

  async function handleDeleteUser(userId: string) {
    if (confirm('Tem certeza que deseja deletar este usuário?')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        alert('Usuário deletado!');
        loadData();
      } catch (error) {
        alert('Erro ao deletar usuário');
      }
    }
  }

  async function handleCancelSubscription(userId: string, subId: string) {
    if (confirm('Cancelar assinatura deste usuário?')) {
      try {
        await api.post(`/admin/subscriptions/${subId}/cancel`, {});
        alert('Assinatura cancelada!');
        loadData();
      } catch (error) {
        alert('Erro ao cancelar assinatura');
      }
    }
  }

  async function handleApproveDocument(docId: string) {
    if (confirm('Aprovar este documento?')) {
      try {
        await api.patch(`/admin/documents/${docId}/approve`);
        alert('✅ Documento aprovado! O usuário foi notificado.');
        loadData();
      } catch (error) {
        alert('Erro ao aprovar documento');
      }
    }
  }

  async function handleRejectDocument(docId: string) {
    const reason = prompt('Motivo da recusa (será enviado ao usuário):', 'Documento ilegível ou incompleto');
    
    if (reason !== null) {
      try {
        await api.patch(`/admin/documents/${docId}/reject`, { reason });
        alert('❌ Documento rejeitado! O usuário foi notificado e deve reenviar.');
        loadData();
      } catch (error) {
        alert('Erro ao rejeitar documento');
      }
    }
  }

  async function handleResetDocument(docId: string) {
    if (confirm('Colocar documento em análise novamente?')) {
      try {
        await api.patch(`/admin/documents/${docId}`, { verified: null });
        alert('📋 Documento marcado como "Em Análise"');
        loadData();
      } catch (error) {
        alert('Erro ao atualizar documento');
      }
    }
  }

  async function loadCategoriesIfNeeded() {
    if (categories.length === 0) {
      try {
        const data = await api.get('/public/categories');
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    }
  }

  async function handleChangePlan(userId: string) {
    // Carrega planos se ainda não carregou
    if (plans.length === 0) {
      try {
        const data = await api.get('/public/plans');
        setPlans(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Erro ao carregar planos:', error);
      }
    }
    
    setShowPlanModal(true);
  }

  async function confirmChangePlan() {
    if (!selectedUser || !selectedPlanId) return;
    
    try {
      await api.post(`/admin/users/${selectedUser.id}/change-plan`, { planId: selectedPlanId });
      alert('Plano alterado!');
      setShowPlanModal(false);
      setShowModal(false);
      setSelectedPlanId('');
      loadData();
    } catch (error) {
      alert('Erro ao alterar plano');
    }
  }

  function openWhatsApp(phone: string) {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleanPhone}`, '_blank');
  }

  async function handleNotifyUser(user: any) {
    const title = prompt('Título da notificação:', '📢 Aviso Importante');
    if (!title) return;

    const message = prompt('Mensagem para ' + user.name + ':', '');
    if (!message) return;

    try {
      await api.post(`/admin/users/${user.id}/notify`, { title, message });
      alert('✅ Notificação enviada com sucesso! O usuário verá no app.');
    } catch (error) {
      alert('❌ Erro ao enviar notificação');
      console.error(error);
    }
  }

  async function handleUpdateTicketStatus(ticketId: string, status: string) {
    try {
      await api.patch(`/admin/support/tickets/${ticketId}/status`, { status });
      alert('✅ Status atualizado! O usuário foi notificado.');
      loadData();
    } catch (error) {
      alert('❌ Erro ao atualizar status');
      console.error(error);
    }
  }

  async function handleSaveCategory() {
    const title = prompt('Nome da categoria:', editingCategory?.title || '');
    if (!title) return;

    const slug = prompt('Slug (URL):', editingCategory?.slug || title.toLowerCase().replace(/\s+/g, '-'));
    if (!slug) return;

    const description = prompt('Descrição:', editingCategory?.description || '');
    if (!description) return;

    try {
      if (editingCategory) {
        await api.patch(`/admin/categories/${editingCategory.id}`, { title, slug, description });
        alert('✅ Categoria atualizada!');
      } else {
        await api.post('/admin/categories', { title, slug, description });
        alert('✅ Categoria criada!');
      }
      setEditingCategory(null);
      setShowCategoryModal(false);
      loadData();
    } catch (error) {
      alert('❌ Erro ao salvar categoria');
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm('Tem certeza? Isso afetará os usuários desta categoria.')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      alert('✅ Categoria deletada!');
      loadData();
    } catch (error) {
      alert('❌ Erro ao deletar categoria');
    }
  }

  async function handleSavePlan() {
    const displayName = prompt('Nome do plano:', editingPlan?.displayName || '');
    if (!displayName) return;

    const price = prompt('Preço (R$):', editingPlan ? (editingPlan.priceCents / 100).toFixed(2) : '');
    if (!price) return;

    const priceCents = Math.round(parseFloat(price) * 100);

    try {
      if (editingPlan) {
        await api.patch(`/admin/plans/${editingPlan.id}`, { displayName, priceCents, features: editingPlan.features });
        alert('✅ Plano atualizado!');
      } else {
        const tier = prompt('Tier (BASIC, PREMIUM, ENTERPRISE):', 'BASIC');
        await api.post('/admin/plans', { tier, displayName, priceCents, features: [] });
        alert('✅ Plano criado!');
      }
      setEditingPlan(null);
      setShowPlanModal(false);
      loadData();
    } catch (error) {
      alert('❌ Erro ao salvar plano');
    }
  }

  async function handleDeletePlan(id: string) {
    if (!confirm('Tem certeza? Isso afetará as assinaturas ativas.')) return;
    try {
      await api.delete(`/admin/plans/${id}`);
      alert('✅ Plano deletado!');
      loadData();
    } catch (error) {
      alert('❌ Erro ao deletar plano');
    }
  }

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.cpf?.includes(searchTerm)
  );

  // Tela de Login
  if (!isLoggedIn) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '400px'
        }}>
          <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
            🚗 Secur APP Admin
          </h1>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const email = (e.target as any).email.value;
            const password = (e.target as any).password.value;
            handleLogin(email, password);
          }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="seu@email.com"
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Senha
              </label>
              <input
                type="password"
                name="password"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="••••••••"
              />
            </div>
            
            {error && (
              <div style={{
                padding: '12px',
                background: '#fee',
                color: '#c33',
                borderRadius: '6px',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: loading ? '#ccc' : '#00a9ff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          
          <p style={{ 
            textAlign: 'center', 
            marginTop: '20px', 
            fontSize: '12px', 
            color: '#666' 
          }}>
            Painel Administrativo - Acesso Restrito
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo" onClick={() => setCurrentPage('dashboard')} style={{ cursor: 'pointer' }}>
          🚗 Secur APP
        </div>
        
        <div 
          className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentPage('dashboard')}
        >
          📊 Dashboard
        </div>
        
        <div 
          className={`nav-item ${currentPage === 'users' ? 'active' : ''}`}
          onClick={() => setCurrentPage('users')}
        >
          👥 Usuários
        </div>
        
        <div 
          className={`nav-item ${currentPage === 'payments' ? 'active' : ''}`}
          onClick={() => setCurrentPage('payments')}
        >
          💳 Pagamentos
        </div>
        
        <div 
          className={`nav-item ${currentPage === 'plans' ? 'active' : ''}`}
          onClick={() => setCurrentPage('plans')}
        >
          💎 Planos
        </div>
        
        <div 
          className={`nav-item ${currentPage === 'categories' ? 'active' : ''}`}
          onClick={() => setCurrentPage('categories')}
        >
          📂 Categorias
        </div>
        
        <div 
          className={`nav-item ${currentPage === 'banners' ? 'active' : ''}`}
          onClick={() => setCurrentPage('banners')}
        >
          🎨 Banners
        </div>
        
        <div 
          className={`nav-item ${currentPage === 'gas-stations' ? 'active' : ''}`}
          onClick={() => setCurrentPage('gas-stations')}
        >
          ⛽ Postos
        </div>
        
        <div 
          className={`nav-item ${currentPage === 'documents' ? 'active' : ''}`}
          onClick={() => setCurrentPage('documents')}
        >
          📄 Documentos
        </div>
        
        <div 
          className={`nav-item ${currentPage === 'support' ? 'active' : ''}`}
          onClick={() => setCurrentPage('support')}
        >
          🎫 Suporte
        </div>
        
        <div 
          className={`nav-item ${currentPage === 'push' ? 'active' : ''}`}
          onClick={() => setCurrentPage('push')}
        >
          🔔 Push Notifications
        </div>
        
        <div 
          className={`nav-item ${currentPage === 'content' ? 'active' : ''}`}
          onClick={() => setCurrentPage('content')}
        >
          📝 Conteúdo
        </div>
        
        <div 
          className={`nav-item ${currentPage === 'settings' ? 'active' : ''}`}
          onClick={() => setCurrentPage('settings')}
        >
          ⚙️ Configurações
        </div>
        
        <div 
          className="nav-item"
          onClick={handleLogout}
          style={{ marginTop: 'auto', color: '#ef4444' }}
        >
          🚪 Sair
        </div>
      </div>

      {/* Main Content */}
      <div className="main">
        {/* Loading Indicator */}
        {loading && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: '#00a9ff',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000
          }}>
            ⏳ Carregando...
          </div>
        )}
        
        {/* Error Message */}
        {error && !loading && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: '#ef4444',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            cursor: 'pointer'
          }}
          onClick={() => setError(null)}>
            ❌ {error}
          </div>
        )}
        {/* Dashboard */}
        {currentPage === 'dashboard' && (
          <>
            <div className="header">
              <h1>Dashboard</h1>
              <button className="btn btn-primary" onClick={handleSendPush}>
                🔔 Enviar Push para Todos
              </button>
            </div>

            <div className="stats">
              <div className="stat-card">
                <div className="stat-label">Total de Usuários</div>
                <div className="stat-value">{stats.totalUsers || 0}</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-label">Assinaturas Ativas</div>
                <div className="stat-value">{stats.activeSubscriptions || 0}</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-label">Receita Total</div>
                <div className="stat-value">
                  R$ {(stats.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-label">Pagamentos Pendentes</div>
                <div className="stat-value">{stats.pendingPayments || 0}</div>
              </div>
            </div>
          </>
        )}

        {/* Usuários */}
        {currentPage === 'users' && (
          <>
            <div className="header">
              <h1>Usuários</h1>
              <input
                type="text"
                className="search-box"
                placeholder="Buscar por nome, email ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="card">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>CPF</th>
                    <th>Telefone</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.cpf}</td>
                      <td>{user.phone || '-'}</td>
                      <td>
                        {user.subscriptions?.some(s => s.status === 'ACTIVE') ? (
                          <span className="badge badge-success">Ativo</span>
                        ) : (
                          <span className="badge badge-danger">Inativo</span>
                        )}
                      </td>
                      <td>
                        <div className="actions">
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowViewModal(true);
                            }}
                          >
                            Ver
                          </button>
                          <button 
                            className="btn btn-warning btn-sm"
                            onClick={() => handleNotifyUser(user)}
                          >
                            🔔 Notificar
                          </button>
                          {user.phone && (
                            <button 
                              className="btn btn-success btn-sm"
                              onClick={() => openWhatsApp(user.phone)}
                            >
                              WhatsApp
                            </button>
                          )}
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowModal(true);
                            }}
                          >
                            Editar
                          </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Deletar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagamentos */}
        {currentPage === 'payments' && (
          <>
            <div className="header">
              <h1>Pagamentos</h1>
            </div>

            <div className="card">
              <table className="table">
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Método</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(payment => (
                    <tr key={payment.id}>
                      <td>
                        <div>{payment.user.name}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {payment.user.email}
                        </div>
                      </td>
                      <td>{payment.method}</td>
                      <td>R$ {(payment.amountCents / 100).toFixed(2)}</td>
                      <td>
                        {payment.status === 'approved' && (
                          <span className="badge badge-success">Aprovado</span>
                        )}
                        {payment.status === 'pending' && (
                          <span className="badge badge-warning">Pendente</span>
                        )}
                        {payment.status === 'rejected' && (
                          <span className="badge badge-danger">Rejeitado</span>
                        )}
                      </td>
                      <td>{new Date(payment.createdAt).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Planos */}
        {currentPage === 'plans' && (
          <>
            <div className="header">
              <h1>💎 Planos</h1>
              <button className="btn btn-primary" onClick={() => { setEditingPlan(null); handleSavePlan(); }}>
                + Novo Plano
              </button>
            </div>

            <div className="card">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Tier</th>
                    <th>Preço</th>
                    <th>Assinantes</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map(plan => (
                    <tr key={plan.id}>
                      <td><strong>{plan.displayName}</strong></td>
                      <td>
                        <span className={`badge ${
                          plan.tier === 'ENTERPRISE' ? 'badge-warning' :
                          plan.tier === 'PREMIUM' ? 'badge-success' :
                          'badge'
                        }`}>
                          {plan.tier}
                        </span>
                      </td>
                      <td><strong>R$ {(plan.priceCents / 100).toFixed(2)}</strong></td>
                      <td>
                        <span className="badge badge-success">
                          {plan._count?.subscriptions || 0} ativos
                        </span>
                      </td>
                      <td>
                        <div className="actions">
                          <button 
                            className="btn btn-primary btn-sm" 
                            onClick={() => { setEditingPlan(plan); handleSavePlan(); }}
                          >
                            Editar
                          </button>
                          <button 
                            className="btn btn-danger btn-sm" 
                            onClick={() => handleDeletePlan(plan.id)}
                          >
                            Deletar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Categorias */}
        {currentPage === 'categories' && (
          <>
            <div className="header">
              <h1>📂 Categorias</h1>
              <button className="btn btn-primary" onClick={() => { setEditingCategory(null); handleSaveCategory(); }}>
                + Nova Categoria
              </button>
            </div>

            <div className="card">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Slug</th>
                    <th>Descrição</th>
                    <th>Documentos</th>
                    <th>Usuários</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(cat => (
                    <tr key={cat.id}>
                      <td><strong>{cat.title}</strong></td>
                      <td><code>{cat.slug}</code></td>
                      <td>{cat.description}</td>
                      <td>
                        <span className="badge">{cat.requiredDocs?.length || 0} docs</span>
                      </td>
                      <td>
                        <span className="badge badge-success">{cat._count?.users || 0} usuários</span>
                      </td>
                      <td>
                        <div className="actions">
                          <button 
                            className="btn btn-primary btn-sm" 
                            onClick={() => { setEditingCategory(cat); handleSaveCategory(); }}
                          >
                            Editar
                          </button>
                          <button 
                            className="btn btn-danger btn-sm" 
                            onClick={() => handleDeleteCategory(cat.id)}
                          >
                            Deletar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Banners */}
        {currentPage === 'banners' && <BannersPage />}

        {/* Postos de Gasolina */}
        {currentPage === 'gas-stations' && (
          <>
            <div className="header">
              <h1>Postos de Gasolina</h1>
            </div>

            <div className="card">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Endereço</th>
                    <th>Localização</th>
                    <th>Carregador Elétrico</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {gasStations.map(station => (
                    <tr key={station.id}>
                      <td>{station.name}</td>
                      <td>{station.address}</td>
                      <td>{station.latitude.toFixed(6)}, {station.longitude.toFixed(6)}</td>
                      <td>
                        {station.hasElectricCharger ? (
                          <span className="badge badge-success">Sim</span>
                        ) : (
                          <span className="badge badge-danger">Não</span>
                        )}
                      </td>
                      <td>
                        <div className="actions">
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => alert('Funcionalidade de edição em desenvolvimento')}
                          >
                            Editar
                          </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={async () => {
                              if (confirm('Deletar este posto?')) {
                                try {
                                  await api.delete(`/gas-stations/${station.id}`);
                                  alert('Posto deletado!');
                                  loadData();
                                } catch (error) {
                                  alert('Erro ao deletar posto');
                                }
                              }
                            }}
                          >
                            Deletar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Push Notifications */}
        {currentPage === 'push' && (
          <>
            <div className="header">
              <h1>Push Notifications</h1>
            </div>

            <div className="card">
              <h3 className="card-title">Enviar Notificação</h3>
              
              <div className="form-group">
                <label className="form-label">Destinatários</label>
                <select className="form-control" id="push-target">
                  <option value="all">Todos os usuários</option>
                  <option value="with-plan">Usuários com plano ativo</option>
                  <option value="without-plan">Usuários sem plano</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Título</label>
                <input type="text" className="form-control" id="push-title" />
              </div>
              
              <div className="form-group">
                <label className="form-label">Mensagem</label>
                <textarea className="form-control" id="push-body" rows={4}></textarea>
              </div>
              
              <button 
                className="btn btn-primary"
                onClick={async () => {
                  const target = (document.getElementById('push-target') as HTMLSelectElement).value;
                  const title = (document.getElementById('push-title') as HTMLInputElement).value;
                  const body = (document.getElementById('push-body') as HTMLTextAreaElement).value;
                  
                  if (!title || !body) {
                    alert('Preencha todos os campos');
                    return;
                  }
                  
                  try {
                    const endpoint = target === 'all' ? '/notifications/send-to-all' :
                                   target === 'with-plan' ? '/notifications/send-to-users-with-plan' :
                                   '/notifications/send-to-users-without-plan';
                    
                    await api.post(endpoint, { title, body });
                    alert('Notificação enviada!');
                    
                    // Limpar campos
                    (document.getElementById('push-title') as HTMLInputElement).value = '';
                    (document.getElementById('push-body') as HTMLTextAreaElement).value = '';
                  } catch (error) {
                    alert('Erro ao enviar notificação');
                  }
                }}
              >
                Enviar Notificação
              </button>
            </div>
          </>
        )}

        {/* Conteúdo */}
        {currentPage === 'content' && (
          <>
            <div className="header">
              <h1>Gestão de Conteúdo</h1>
            </div>

            <div className="card">
              <h3 className="card-title">Banners e Imagens</h3>
              <p style={{ color: '#6b7280', marginBottom: '20px' }}>
                Gerencie os banners e imagens exibidos no aplicativo
              </p>
              <button className="btn btn-primary">
                📤 Upload de Banner
              </button>
            </div>

            <div className="card" style={{ marginTop: '20px' }}>
              <h3 className="card-title">Termos de Uso</h3>
              <textarea 
                className="form-control" 
                rows={10}
                placeholder="Digite os termos de uso aqui..."
              ></textarea>
              <button className="btn btn-primary" style={{ marginTop: '12px' }}>
                Salvar Termos
              </button>
            </div>

            <div className="card" style={{ marginTop: '20px' }}>
              <h3 className="card-title">FAQ - Perguntas Frequentes</h3>
              <button className="btn btn-primary">
                + Adicionar Pergunta
              </button>
            </div>
          </>
        )}

        {/* Documentos */}
        {currentPage === 'documents' && (
          <>
            <div className="header">
              <h1>Documentos</h1>
            </div>

            <div className="card">
              <table className="table">
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Documento</th>
                    <th>Categoria</th>
                    <th>Plano</th>
                    <th>Status</th>
                    <th>Data</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map(doc => (
                    <tr key={doc.id}>
                      <td>
                        <div>{doc.user.name}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {doc.user.email}
                        </div>
                      </td>
                      <td>{doc.code}</td>
                      <td>{doc.user.category?.title || '-'}</td>
                      <td>{doc.user.subscriptions?.[0]?.plan?.displayName || 'Sem plano'}</td>
                      <td>
                        {doc.verified === true && (
                          <span className="badge badge-success">Aprovado</span>
                        )}
                        {doc.verified === false && (
                          <span className="badge badge-danger">Rejeitado</span>
                        )}
                        {doc.verified === null && (
                          <span className="badge badge-warning">Pendente</span>
                        )}
                      </td>
                      <td>{new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}</td>
                      <td>
                        <div className="actions">
                          <a 
                            href={doc.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-primary btn-sm"
                          >
                            Ver
                          </a>
                          
                          {/* Sempre mostra botões, mas muda o texto baseado no status */}
                          {doc.verified !== true && (
                            <button 
                              className="btn btn-success btn-sm"
                              onClick={() => handleApproveDocument(doc.id)}
                            >
                              {doc.verified === false ? 'Aprovar Agora' : 'Aprovar'}
                            </button>
                          )}
                          
                          {doc.verified !== false && (
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => handleRejectDocument(doc.id)}
                            >
                              {doc.verified === true ? 'Revogar' : 'Rejeitar'}
                            </button>
                          )}
                          
                          {doc.verified !== null && (
                            <button 
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleResetDocument(doc.id)}
                            >
                              Em Análise
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Suporte */}
        {currentPage === 'support' && (
          <>
            <div className="header">
              <h1>🚨 Solicitações de Apoio</h1>
            </div>

            <div className="card">
              <table className="table">
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Tipo</th>
                    <th>Localização</th>
                    <th>Status</th>
                    <th>Prioridade</th>
                    <th>Data</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {supportTickets.map(ticket => {
                    const typeLabels: any = {
                      health: '🏥 Emergência Médica',
                      breakdown: '🔧 Pane Mecânica',
                      accident: '🚗 Acidente',
                      theft: '🚨 Roubo/Furto'
                    };
                    
                    return (
                      <tr key={ticket.id}>
                        <td>
                          <div>{ticket.user.name}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {ticket.user.email}
                          </div>
                          {ticket.user.phone && (
                            <div style={{ fontSize: '12px', color: '#10b981' }}>
                              📱 {ticket.user.phone}
                            </div>
                          )}
                        </td>
                        <td>{typeLabels[ticket.type] || ticket.type}</td>
                        <td>
                          <div style={{ fontSize: '12px' }}>
                            📍 {ticket.location}
                          </div>
                        </td>
                        <td>
                          {ticket.status === 'open' && (
                            <span className="badge badge-warning">Aberto</span>
                          )}
                          {ticket.status === 'in_progress' && (
                            <span className="badge" style={{ background: '#3b82f6', color: 'white' }}>Em Andamento</span>
                          )}
                          {ticket.status === 'resolved' && (
                            <span className="badge badge-success">Resolvido</span>
                          )}
                          {ticket.status === 'closed' && (
                            <span className="badge">Fechado</span>
                          )}
                        </td>
                        <td>
                          {ticket.priority === 'urgent' && (
                            <span className="badge badge-danger">Urgente</span>
                          )}
                          {ticket.priority === 'high' && (
                            <span className="badge badge-warning">Alta</span>
                          )}
                          {ticket.priority === 'normal' && (
                            <span className="badge">Normal</span>
                          )}
                          {ticket.priority === 'low' && (
                            <span className="badge">Baixa</span>
                          )}
                        </td>
                        <td>{new Date(ticket.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                        <td>
                          <div className="actions">
                            <button 
                              className="btn btn-warning btn-sm"
                              onClick={() => handleNotifyUser(ticket.user)}
                            >
                              🔔 Notificar
                            </button>
                            {ticket.user.phone && (
                              <button 
                                className="btn btn-success btn-sm"
                                onClick={() => openWhatsApp(ticket.user.phone)}
                              >
                                WhatsApp
                              </button>
                            )}
                            <select 
                              className="btn btn-sm"
                              value={ticket.status}
                              onChange={(e) => handleUpdateTicketStatus(ticket.id, e.target.value)}
                              style={{ padding: '6px 12px' }}
                            >
                              <option value="open">Aberto</option>
                              <option value="in_progress">Em Andamento</option>
                              <option value="resolved">Resolvido</option>
                              <option value="closed">Fechado</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Configurações */}
        {currentPage === 'settings' && (
          <>
            <div className="header">
              <h1>Configurações</h1>
            </div>

            <div className="card">
              <h3 className="card-title">Configurações do Sistema</h3>
              
              <div className="form-group">
                <label className="form-label">Nome do App</label>
                <input type="text" className="form-control" defaultValue="Secur APP" />
              </div>
              
              <div className="form-group">
                <label className="form-label">Email de Suporte</label>
                <input type="email" className="form-control" defaultValue="suporte@securapp.com" />
              </div>
              
              <div className="form-group">
                <label className="form-label">Telefone de Suporte</label>
                <input type="text" className="form-control" defaultValue="+55 11 99999-9999" />
              </div>
              
              <button className="btn btn-primary">
                Salvar Configurações
              </button>
            </div>

            <div className="card" style={{ marginTop: '20px' }}>
              <h3 className="card-title">Integração Mercado Pago</h3>
              
              <div className="form-group">
                <label className="form-label">Access Token</label>
                <input type="password" className="form-control" placeholder="••••••••" />
              </div>
              
              <div className="form-group">
                <label className="form-label">Public Key</label>
                <input type="text" className="form-control" placeholder="APP_USR_..." />
              </div>
              
              <button className="btn btn-primary">
                Atualizar Credenciais
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modal de Visualização de Usuário */}
      {showViewModal && selectedUser && (
        <div className="modal active" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Detalhes do Usuário</h2>
              <span className="close" onClick={() => setShowViewModal(false)}>&times;</span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <strong>Nome:</strong>
                <p>{selectedUser.name}</p>
              </div>
              <div>
                <strong>Email:</strong>
                <p>{selectedUser.email}</p>
              </div>
              <div>
                <strong>CPF:</strong>
                <p>{selectedUser.cpf}</p>
              </div>
              <div>
                <strong>Telefone:</strong>
                <p>{selectedUser.phone || '-'}</p>
              </div>
              <div>
                <strong>Role:</strong>
                <p>{selectedUser.role}</p>
              </div>
              <div>
                <strong>Cadastrado em:</strong>
                <p>{new Date(selectedUser.createdAt).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <h3>Assinaturas</h3>
              {selectedUser.subscriptions && selectedUser.subscriptions.length > 0 ? (
                selectedUser.subscriptions.map(sub => (
                  <div key={sub.id} style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px', marginTop: '8px' }}>
                    <strong>{sub.plan.displayName}</strong> - {sub.status}
                    <br />
                    <small>Início: {new Date(sub.startedAt).toLocaleDateString('pt-BR')}</small>
                  </div>
                ))
              ) : (
                <p style={{ color: '#6b7280' }}>Nenhuma assinatura</p>
              )}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <button className="btn btn-primary" onClick={() => {
                setShowViewModal(false);
                setShowModal(true);
              }}>
                Editar
              </button>
              <button className="btn" onClick={() => setShowViewModal(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Seleção de Plano */}
      {showPlanModal && selectedUser && (
        <div className="modal active" onClick={() => setShowPlanModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Selecionar Plano</h2>
              <span className="close" onClick={() => setShowPlanModal(false)}>&times;</span>
            </div>
            
            <p style={{ marginBottom: '16px', color: '#6b7280' }}>
              Selecione o novo plano para <strong>{selectedUser.name}</strong>
            </p>

            <div className="form-group">
              <label className="form-label">Plano</label>
              <select 
                className="form-control"
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
              >
                <option value="">Selecione um plano...</option>
                {plans.map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.displayName} - R$ {(plan.priceCents / 100).toFixed(2)}/{plan.interval === 'MONTH' ? 'mês' : plan.interval === 'YEAR' ? 'ano' : 'período'}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <button 
                className="btn btn-primary"
                onClick={confirmChangePlan}
                disabled={!selectedPlanId}
              >
                Confirmar
              </button>
              <button className="btn" onClick={() => {
                setShowPlanModal(false);
                setSelectedPlanId('');
              }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Usuário */}
      {showModal && selectedUser && (
        <div className="modal active" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Editar Usuário</h2>
              <span className="close" onClick={() => setShowModal(false)}>&times;</span>
            </div>
            
            <div className="form-group">
              <label className="form-label">Nome</label>
              <input type="text" className="form-control" defaultValue={selectedUser.name} />
            </div>
            
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" defaultValue={selectedUser.email} />
            </div>
            
            <div className="form-group">
              <label className="form-label">Telefone</label>
              <input type="text" className="form-control" defaultValue={selectedUser.phone} />
            </div>

            <div className="form-group">
              <label className="form-label">Categoria</label>
              <select 
                className="form-control"
                defaultValue={selectedUser.categoryId || ''}
                onChange={(e) => {
                  // Atualizar categoria do usuário
                  if (e.target.value) {
                    api.patch(`/admin/users/${selectedUser.id}`, { categoryId: e.target.value })
                      .then(() => {
                        alert('Categoria atualizada!');
                        loadData();
                      })
                      .catch(() => alert('Erro ao atualizar categoria'));
                  }
                }}
              >
                <option value="">Sem categoria</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.title}</option>
                ))}
              </select>
              <button 
                className="btn btn-primary btn-sm" 
                style={{ marginTop: '8px' }}
                onClick={loadCategoriesIfNeeded}
              >
                Carregar Categorias
              </button>
            </div>
            
            {selectedUser.subscriptions?.map(sub => (
              <div key={sub.id} style={{ marginTop: '20px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>Plano: {sub.plan.displayName}</strong>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      Status: {sub.status}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleChangePlan(selectedUser.id)}
                    >
                      Mudar Plano
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleCancelSubscription(selectedUser.id, sub.id)}
                    >
                      Cancelar Plano
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {(!selectedUser.subscriptions || selectedUser.subscriptions.length === 0) && (
              <div style={{ marginTop: '20px', padding: '16px', background: '#f9fafb', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ color: '#6b7280', marginBottom: '12px' }}>Usuário sem plano ativo</p>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => handleChangePlan(selectedUser.id)}
                >
                  Atribuir Plano
                </button>
              </div>
            )}
            
            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <button className="btn btn-primary">Salvar</button>
              <button className="btn" onClick={() => setShowModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Render
const root = createRoot(document.getElementById('root')!);
root.render(<App />);
