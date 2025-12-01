import { PrismaClient, PlanTier } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Criando planos padrão...');

  const plans = [
    {
      tier: PlanTier.BRONZE,
      displayName: 'Bronze',
      priceCents: 2990, // R$ 29,90
      currency: 'BRL',
      active: true,
    },
    {
      tier: PlanTier.PRATA,
      displayName: 'Prata',
      priceCents: 4990, // R$ 49,90
      currency: 'BRL',
      active: true,
    },
    {
      tier: PlanTier.OURO,
      displayName: 'Ouro',
      priceCents: 7990, // R$ 79,90
      currency: 'BRL',
      active: true,
    },
  ];

  for (const planData of plans) {
    const plan = await prisma.plan.create({
      data: planData,
    });
    console.log(`✅ Plano criado: ${plan.displayName} - R$ ${(plan.priceCents / 100).toFixed(2)}`);
  }

  console.log('\n✨ Planos criados com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
