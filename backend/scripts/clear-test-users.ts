import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Deletando TODOS os dados...');

  // Lista usuários
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`\n📋 Total de usuários: ${users.length}`);
  users.forEach((u, i) => {
    console.log(`${i + 1}. ${u.email} - ${u.name} (${u.createdAt.toLocaleDateString()})`);
  });

  // Deletar na ordem correta (respeitando foreign keys)
  console.log('\n🗑️  Deletando pagamentos...');
  const payments = await prisma.payment.deleteMany({});
  console.log(`✅ ${payments.count} pagamentos deletados`);

  console.log('\n🗑️  Deletando assinaturas...');
  const subscriptions = await prisma.subscription.deleteMany({});
  console.log(`✅ ${subscriptions.count} assinaturas deletadas`);

  console.log('\n🗑️  Deletando planos...');
  const plans = await prisma.plan.deleteMany({});
  console.log(`✅ ${plans.count} planos deletados`);

  console.log('\n🗑️  Deletando usuários...');
  const usersDeleted = await prisma.user.deleteMany({});
  console.log(`✅ ${usersDeleted.count} usuários deletados`);
  
  console.log('\n✨ Banco de dados completamente limpo!');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
