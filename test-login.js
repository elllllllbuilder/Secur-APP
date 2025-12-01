// Teste de login no backend
const fetch = require('node-fetch');

async function testLogin() {
  console.log('🔍 Testando login no backend...\n');
  
  const urls = [
    'http://localhost:3333',
    'http://192.168.1.24:3333'
  ];
  
  for (const url of urls) {
    console.log(`📍 Testando: ${url}`);
    
    try {
      const response = await fetch(`${url}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@securapp.com',
          password: 'Admin@123'
        })
      });
      
      console.log(`   Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('   ✅ Login funcionou!');
        console.log('   Token:', data.accessToken ? 'Recebido' : 'Não recebido');
        console.log('');
        console.log('🎯 Use esta URL no .env:');
        console.log(`   VITE_API_URL=${url}`);
        return;
      } else {
        const error = await response.text();
        console.log('   ❌ Erro:', error);
      }
    } catch (error) {
      console.log('   ❌ Não conectou:', error.message);
    }
    
    console.log('');
  }
}

testLogin();
