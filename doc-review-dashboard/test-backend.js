// Script para testar conexão com o backend
// Execute: node test-backend.js

const API_URL = process.env.VITE_API_URL || 'http://localhost:3333';

console.log('🔍 Testando conexão com o backend...');
console.log('📍 URL:', API_URL);
console.log('');

// Teste 1: Health check
async function testHealth() {
  try {
    console.log('1️⃣ Testando /health...');
    const response = await fetch(`${API_URL}/health`);
    
    if (response.ok) {
      console.log('✅ Backend está rodando!');
      return true;
    } else {
      console.log('❌ Backend retornou erro:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Não foi possível conectar ao backend');
    console.log('   Erro:', error.message);
    console.log('');
    console.log('💡 Soluções:');
    console.log('   1. Verifique se o backend está rodando: cd backend && npm run start:dev');
    console.log('   2. Verifique a URL no arquivo .env');
    console.log('   3. Verifique se a porta 3333 está liberada');
    return false;
  }
}

// Teste 2: Login
async function testLogin() {
  try {
    console.log('');
    console.log('2️⃣ Testando /auth/login...');
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test123'
      })
    });
    
    if (response.status === 401) {
      console.log('✅ Endpoint de login existe (credenciais inválidas é esperado)');
      return true;
    } else if (response.ok) {
      console.log('✅ Login funcionou!');
      const data = await response.json();
      console.log('   Token recebido:', data.accessToken ? 'Sim' : 'Não');
      return true;
    } else {
      console.log('⚠️ Endpoint retornou:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro ao testar login:', error.message);
    return false;
  }
}

// Teste 3: Admin endpoints
async function testAdminEndpoints() {
  try {
    console.log('');
    console.log('3️⃣ Testando /admin/users...');
    const response = await fetch(`${API_URL}/admin/users`);
    
    if (response.status === 401) {
      console.log('✅ Endpoint existe e está protegido (401 Unauthorized)');
      return true;
    } else if (response.ok) {
      console.log('✅ Endpoint acessível!');
      return true;
    } else {
      console.log('⚠️ Endpoint retornou:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro ao testar admin:', error.message);
    return false;
  }
}

// Teste 4: Gas stations
async function testGasStations() {
  try {
    console.log('');
    console.log('4️⃣ Testando /gas-stations...');
    const response = await fetch(`${API_URL}/gas-stations`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Endpoint funciona!');
      console.log('   Postos encontrados:', Array.isArray(data) ? data.length : 'N/A');
      return true;
    } else {
      console.log('⚠️ Endpoint retornou:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro ao testar postos:', error.message);
    return false;
  }
}

// Executar todos os testes
async function runTests() {
  const results = {
    health: await testHealth(),
    login: await testLogin(),
    admin: await testAdminEndpoints(),
    gasStations: await testGasStations()
  };
  
  console.log('');
  console.log('📊 RESUMO DOS TESTES:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Health Check:', results.health ? '✅' : '❌');
  console.log('Login:', results.login ? '✅' : '❌');
  console.log('Admin Endpoints:', results.admin ? '✅' : '❌');
  console.log('Gas Stations:', results.gasStations ? '✅' : '❌');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const allPassed = Object.values(results).every(r => r);
  
  if (allPassed) {
    console.log('');
    console.log('🎉 TUDO FUNCIONANDO!');
    console.log('   O backend está pronto para uso.');
    console.log('   Inicie o painel: npm run dev');
  } else {
    console.log('');
    console.log('⚠️ ALGUNS TESTES FALHARAM');
    console.log('   Consulte o arquivo TROUBLESHOOTING.md');
  }
}

// Executar
runTests().catch(console.error);
