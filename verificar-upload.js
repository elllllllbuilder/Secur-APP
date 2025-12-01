// verificar-upload.js
// Script completo de verificação do sistema de upload

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configurações - AJUSTE AQUI
const CONFIG = {
  API_URL: 'http://192.168.1.6:3333',
  TEST_USER: {
    email: 'teste@teste.com',
    password: 'Teste@123'
  }
};

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(emoji, message, color = colors.reset) {
  console.log(`${color}${emoji} ${message}${colors.reset}`);
}

function success(message) {
  log('✅', message, colors.green);
}

function error(message) {
  log('❌', message, colors.red);
}

function warning(message) {
  log('⚠️ ', message, colors.yellow);
}

function info(message) {
  log('ℹ️ ', message, colors.cyan);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log('📋', title.toUpperCase(), colors.blue);
  console.log('='.repeat(60));
}

// Testes
async function test1_BackendOnline() {
  section('Teste 1: Backend está online?');
  try {
    const response = await axios.get(`${CONFIG.API_URL}/health`, { timeout: 5000 });
    success('Backend está respondendo!');
    info(`Status: ${response.status}`);
    return true;
  } catch (e) {
    error('Backend não está respondendo');
    error(`Erro: ${e.message}`);
    warning('Solução: Execute "cd backend && npm run start:dev"');
    return false;
  }
}

async function test2_DocumentsEndpoint() {
  section('Teste 2: Endpoint de documentos está ativo?');
  try {
    const response = await axios.get(`${CONFIG.API_URL}/me/documents/health`, { timeout: 5000 });
    success('Endpoint de documentos está ativo!');
    return true;
  } catch (e) {
    error('Endpoint de documentos não está respondendo');
    error(`Status: ${e.response?.status || 'N/A'}`);
    return false;
  }
}

async function test3_Login() {
  section('Teste 3: Login funciona?');
  try {
    const response = await axios.post(`${CONFIG.API_URL}/auth/login`, CONFIG.TEST_USER);
    const token = response.data?.data?.accessToken || response.data?.accessToken;
    
    if (!token) {
      error('Login retornou sem token');
      return null;
    }
    
    success('Login bem-sucedido!');
    info(`Token: ${token.substring(0, 30)}...`);
    return token;
  } catch (e) {
    error('Falha no login');
    error(`Status: ${e.response?.status || 'N/A'}`);
    error(`Mensagem: ${e.response?.data?.message || e.message}`);
    
    if (e.response?.status === 401) {
      warning('Usuário ou senha incorretos');
      warning('Crie um usuário de teste ou ajuste as credenciais no script');
    }
    
    return null;
  }
}

async function test4_Upload(token) {
  section('Teste 4: Upload de documento funciona?');
  
  if (!token) {
    warning('Pulando teste de upload (sem token)');
    return false;
  }
  
  try {
    // Cria arquivo de teste
    const testContent = 'Este é um documento de teste criado em ' + new Date().toISOString();
    const testFilePath = path.join(__dirname, 'test-upload-file.txt');
    fs.writeFileSync(testFilePath, testContent);
    
    info('Arquivo de teste criado');
    
    // Prepara FormData
    const FormData = require('form-data');
    const form = new FormData();
    form.append('code', 'TEST_DOCUMENT');
    form.append('file', fs.createReadStream(testFilePath), {
      filename: 'test-upload-file.txt',
      contentType: 'text/plain'
    });
    
    info('Enviando arquivo...');
    
    const response = await axios.post(`${CONFIG.API_URL}/me/documents`, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${token}`
      },
      timeout: 30000
    });
    
    success('Upload bem-sucedido!');
    info(`Documento ID: ${response.data?.data?.id || 'N/A'}`);
    info(`URL: ${response.data?.data?.url || 'N/A'}`);
    
    // Limpa arquivo de teste
    fs.unlinkSync(testFilePath);
    
    return response.data?.data?.id;
  } catch (e) {
    error('Falha no upload');
    error(`Status: ${e.response?.status || 'N/A'}`);
    error(`Mensagem: ${e.response?.data?.message || e.message}`);
    
    if (e.code === 'ECONNABORTED') {
      warning('Timeout: O servidor demorou muito para responder');
    } else if (e.code === 'ECONNREFUSED') {
      warning('Conexão recusada: Backend não está acessível');
    }
    
    // Tenta limpar arquivo de teste
    try {
      const testFilePath = path.join(__dirname, 'test-upload-file.txt');
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
    } catch {}
    
    return false;
  }
}

async function test5_ListDocuments(token) {
  section('Teste 5: Listagem de documentos funciona?');
  
  if (!token) {
    warning('Pulando teste de listagem (sem token)');
    return false;
  }
  
  try {
    const response = await axios.get(`${CONFIG.API_URL}/me/documents`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const docs = response.data?.data || response.data || [];
    success(`Listagem bem-sucedida! ${docs.length} documento(s) encontrado(s)`);
    
    if (docs.length > 0) {
      info('Últimos documentos:');
      docs.slice(0, 3).forEach(doc => {
        console.log(`  - ${doc.code}: ${doc.originalName || 'sem nome'} (${doc.verified ? 'verificado' : 'pendente'})`);
      });
    }
    
    return true;
  } catch (e) {
    error('Falha na listagem');
    error(`Status: ${e.response?.status || 'N/A'}`);
    error(`Mensagem: ${e.response?.data?.message || e.message}`);
    return false;
  }
}

async function test6_NetworkInfo() {
  section('Teste 6: Informações de rede');
  
  const os = require('os');
  const interfaces = os.networkInterfaces();
  
  info('Interfaces de rede disponíveis:');
  
  Object.keys(interfaces).forEach(name => {
    const iface = interfaces[name];
    const ipv4 = iface.find(i => i.family === 'IPv4' && !i.internal);
    if (ipv4) {
      console.log(`  ${name}: ${ipv4.address}`);
    }
  });
  
  info(`\nAPI URL configurada: ${CONFIG.API_URL}`);
  
  const urlMatch = CONFIG.API_URL.match(/http:\/\/([^:]+):/);
  if (urlMatch) {
    const configuredIP = urlMatch[1];
    const hasMatchingInterface = Object.values(interfaces).some(iface => 
      iface.some(i => i.address === configuredIP)
    );
    
    if (hasMatchingInterface) {
      success('IP configurado corresponde a uma interface local');
    } else if (configuredIP === 'localhost' || configuredIP === '127.0.0.1') {
      warning('Usando localhost - não funcionará em dispositivos físicos');
      warning('Use o IP da máquina na rede local');
    } else {
      warning('IP configurado não corresponde a nenhuma interface local');
      warning('Verifique se o IP está correto');
    }
  }
  
  return true;
}

async function test7_CORS() {
  section('Teste 7: Verificação de CORS');
  
  try {
    const response = await axios.options(`${CONFIG.API_URL}/me/documents`, {
      headers: {
        'Origin': 'http://localhost:8081',
        'Access-Control-Request-Method': 'POST'
      }
    });
    
    const allowOrigin = response.headers['access-control-allow-origin'];
    const allowMethods = response.headers['access-control-allow-methods'];
    
    if (allowOrigin) {
      success('CORS está configurado');
      info(`Allow-Origin: ${allowOrigin}`);
      info(`Allow-Methods: ${allowMethods || 'N/A'}`);
    } else {
      warning('CORS pode não estar configurado corretamente');
    }
    
    return true;
  } catch (e) {
    warning('Não foi possível verificar CORS (pode ser normal)');
    return true;
  }
}

// Resumo final
function printSummary(results) {
  section('Resumo dos Testes');
  
  const total = Object.keys(results).length;
  const passed = Object.values(results).filter(r => r === true).length;
  const failed = total - passed;
  
  console.log(`\nTotal de testes: ${total}`);
  success(`Passou: ${passed}`);
  if (failed > 0) {
    error(`Falhou: ${failed}`);
  }
  
  console.log('\nDetalhes:');
  Object.entries(results).forEach(([test, result]) => {
    const icon = result ? '✅' : '❌';
    const color = result ? colors.green : colors.red;
    console.log(`${color}${icon} ${test}${colors.reset}`);
  });
  
  if (failed === 0) {
    console.log('\n' + '🎉'.repeat(20));
    success('TODOS OS TESTES PASSARAM!');
    success('O sistema de upload está funcionando corretamente!');
    console.log('🎉'.repeat(20));
  } else {
    console.log('\n' + '⚠️ '.repeat(20));
    warning('ALGUNS TESTES FALHARAM');
    warning('Verifique os erros acima e siga as soluções sugeridas');
    console.log('⚠️ '.repeat(20));
  }
}

// Execução principal
async function main() {
  console.clear();
  log('🚀', 'VERIFICAÇÃO COMPLETA DO SISTEMA DE UPLOAD', colors.blue);
  info(`API URL: ${CONFIG.API_URL}`);
  info(`Usuário de teste: ${CONFIG.TEST_USER.email}`);
  console.log('='.repeat(60) + '\n');
  
  const results = {};
  
  // Executa testes em sequência
  results['Backend Online'] = await test1_BackendOnline();
  results['Endpoint Documentos'] = await test2_DocumentsEndpoint();
  
  const token = await test3_Login();
  results['Login'] = token !== null;
  
  const uploadId = await test4_Upload(token);
  results['Upload'] = uploadId !== false;
  
  results['Listagem'] = await test5_ListDocuments(token);
  results['Informações de Rede'] = await test6_NetworkInfo();
  results['CORS'] = await test7_CORS();
  
  // Resumo
  printSummary(results);
  
  // Dicas finais
  if (Object.values(results).some(r => !r)) {
    section('Próximos Passos');
    console.log('\n1. Verifique se o backend está rodando:');
    console.log('   cd backend && npm run start:dev\n');
    console.log('2. Verifique o arquivo .env do backend:');
    console.log('   FRONTEND_ORIGIN deve incluir o IP do dispositivo\n');
    console.log('3. Verifique o arquivo .env do frontend:');
    console.log('   EXPO_PUBLIC_API_URL deve usar o IP da máquina\n');
    console.log('4. Certifique-se que celular e PC estão na mesma rede WiFi\n');
    console.log('5. Desative temporariamente o firewall para testar\n');
  }
}

// Executa
main().catch(err => {
  error('Erro fatal:');
  console.error(err);
  process.exit(1);
});
