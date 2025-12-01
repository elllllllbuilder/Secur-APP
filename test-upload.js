// Teste de upload de documentos
const API_URL = 'http://localhost:3333';

async function testUpload() {
  console.log('🔍 Testando upload de documentos...\n');
  
  // 1. Fazer login primeiro
  console.log('1️⃣ Fazendo login...');
  try {
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@securapp.com',
        password: 'Admin@123'
      })
    });
    
    if (!loginRes.ok) {
      console.log('❌ Login falhou:', loginRes.status);
      return;
    }
    
    const loginData = await loginRes.json();
    const token = loginData.data?.accessToken || loginData.accessToken;
    
    if (!token) {
      console.log('❌ Token não recebido');
      return;
    }
    
    console.log('✅ Login OK\n');
    
    // 2. Testar POST simples (sem arquivo)
    console.log('2️⃣ Testando POST simples (sem arquivo)...');
    try {
      const testRes = await fetch(`${API_URL}/me/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ test: true })
      });
      
      console.log('   Status:', testRes.status);
      const testText = await testRes.text();
      console.log('   Resposta:', testText.substring(0, 200));
    } catch (error) {
      console.log('   ❌ Erro:', error.message);
    }
    
    console.log('');
    
    // 3. Verificar CORS
    console.log('3️⃣ Verificando configuração CORS...');
    console.log('   Verifique se backend/.env tem:');
    console.log('   FRONTEND_ORIGIN=http://192.168.1.6:8081,http://localhost:8081');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testUpload();
