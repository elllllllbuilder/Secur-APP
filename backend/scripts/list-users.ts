import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, cpf: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`\n📋 Total de usuários: ${users.length}\n`);
  
  users.forEach((u, i) => {
    console.log(`${i + 1}. ${u.email}`);
    console.log(`   Nome: ${u.name}`);
    console.log(`   CPF: ${u.cpf || 'não informado'}`);
    console.log(`   Criado: ${u.createdAt.toLocaleString('pt-BR')}`);
    console.log('');
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
