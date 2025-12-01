// test-document-upload.js
// Script para testar upload de documentos

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://192.168.1.6:3333';

// Credenciais de teste - ajuste conforme necessário
const TEST_USER = {
  email: 'teste@teste.com',
  password: 'Teste@123'
};

async function login() {
  try {
    console.log('🔐 Fazendo login...');
    const response = await axios.post(`${API_URL}/auth/login`, TEST_USER);
    const token = response.data?.data?.accessToken || response.data?.accessToken;
    console.log('✅ Login bem-sucedido!');
    console.log('Token:', token?.substring(0, 20) + '...');
    return token;
  } catch (error) {
    console.error('❌ Erro no login:', error.response?.data || error.message);
    throw error;
  }
}

async function testUpload(token) {
  try {
    console.log('\n📤 Testando upload de documento...');
    
    // Cria um arquivo de teste simples
    const testFilePath = path.join(__dirname, 'test-doc.txt');
    fs.writeFileSync(testFilePath, 'Este é um documento de teste para upload.');
    
    const form = new FormData();
    form.append('code', 'TEST_DOC');
    form.append('file', fs.createReadStream(testFilePath), {
      filename: 'test-doc.txt',
      contentType: 'text/plain'
    });

    const response = await axios.post(`${API_URL}/me/documents`, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${token}`
      },
      timeout: 30000
    });

    console.log('✅ Upload bem-sucedido!');
    console.log('Resposta:', JSON.stringify(response.data, null, 2));
    
    // Limpa arquivo de teste
    fs.unlinkSync(testFilePath);
    
    return response.data;
  } catch (error) {
    console.error('❌ Erro no upload:', error.response?.data || error.message);
    if (error.code) console.error('Código do erro:', error.code);
    throw error;
  }
}

async function listDocuments(token) {
  try {
    console.log('\n📋 Listando documentos...');
    const response = await axios.get(`${API_URL}/me/documents`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Documentos listados:');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao listar:', error.response?.data || error.message);
    throw error;
  }
}

async function checkBackendHealth() {
  try {
    console.log('🏥 Verificando saúde do backend...');
    const response = await axios.get(`${API_URL}/health`, { timeout: 5000 });
    console.log('✅ Backend está online!');
    return true;
  } catch (error) {
    console.error('❌ Backend não está respondendo:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Iniciando testes de upload de documentos\n');
  console.log('API URL:', API_URL);
  console.log('Usuário:', TEST_USER.email);
  console.log('='.repeat(50));

  try {
    // 1. Verifica se backend está online
    const isHealthy = await checkBackendHealth();
    if (!isHealthy) {
      console.log('\n⚠️  Backend não está respondendo. Verifique se está rodando.');
      return;
    }

    // 2. Faz login
    const token = await login();

    // 3. Testa upload
    await testUpload(token);

    // 4. Lista documentos
    await listDocuments(token);

    console.log('\n✅ Todos os testes passaram!');
  } catch (error) {
    console.log('\n❌ Testes falharam');
    process.exit(1);
  }
}

main();
