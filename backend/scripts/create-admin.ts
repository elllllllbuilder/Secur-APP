import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔧 Criando usuário administrador...\n');

    // Dados do admin
    const adminEmail = 'admin@securapp.com';
    const adminPassword = 'Admin@123';
    const adminCpf = '00000000000';

    // Verifica se já existe
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log('⚠️  Usuário admin já existe!');
      console.log('📧 Email:', adminEmail);
      console.log('🔑 Senha: Admin@123');
      console.log('\n💡 Se esqueceu a senha, delete o usuário no Prisma Studio e rode este script novamente.');
      return;
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Cria o admin
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: hashedPassword,
        name: 'Administrador',
        cpf: adminCpf,
        phone: '11999999999',
        role: 'admin',
      },
    });

    console.log('✅ Usuário administrador criado com sucesso!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email: admin@securapp.com');
    console.log('🔑 Senha: Admin@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🎯 Use estas credenciais para fazer login no painel admin!');
    console.log('🌐 Acesse: http://localhost:5173\n');

  } catch (error) {
    console.error('❌ Erro ao criar admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
