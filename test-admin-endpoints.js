// Teste dos endpoints do admin
const API_URL = 'http://localhost:3333';

async function testEndpoints() {
  console.log('🔍 Testando endpoints do admin...\n');
  
  // 1. Fazer login
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
      console.log('   Resposta:', JSON.stringify(loginData));
      return;
    }
    
    console.log('✅ Login OK, token recebido\n');
    
    // 2. Testar /admin/users
    console.log('2️⃣ Testando /admin/users...');
    const usersRes = await fetch(`${API_URL}/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('   Status:', usersRes.status);
    
    if (usersRes.ok) {
      const users = await usersRes.json();
      console.log('   ✅ Retornou:', Array.isArray(users) ? `Array com ${users.length} usuários` : typeof users);
      console.log('   Estrutura:', JSON.stringify(users).substring(0, 300));
      if (Array.isArray(users) && users.length > 0) {
        console.log('   Exemplo:', JSON.stringify(users[0], null, 2).substring(0, 200) + '...');
      }
    } else {
      const error = await usersRes.text();
      console.log('   ❌ Erro:', error);
    }
    
    console.log('');
    
    // 3. Testar /admin/payments
    console.log('3️⃣ Testando /admin/payments...');
    const paymentsRes = await fetch(`${API_URL}/admin/payments`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('   Status:', paymentsRes.status);
    
    if (paymentsRes.ok) {
      const payments = await paymentsRes.json();
      console.log('   ✅ Retornou:', Array.isArray(payments) ? `Array com ${payments.length} pagamentos` : typeof payments);
    } else {
      const error = await paymentsRes.text();
      console.log('   ❌ Erro:', error);
    }
    
    console.log('');
    
    // 4. Testar /gas-stations
    console.log('4️⃣ Testando /gas-stations...');
    const stationsRes = await fetch(`${API_URL}/gas-stations`);
    
    console.log('   Status:', stationsRes.status);
    
    if (stationsRes.ok) {
      const stations = await stationsRes.json();
      console.log('   ✅ Retornou:', Array.isArray(stations) ? `Array com ${stations.length} postos` : typeof stations);
    } else {
      const error = await stationsRes.text();
      console.log('   ❌ Erro:', error);
    }
    
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Testes concluídos!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testEndpoints();
