import { PrismaClient, PlanTier } from '@prisma/client';
const prisma = new PrismaClient();

const BRL = (v: number) => Math.round(v * 100);

async function main() {
  // ----- Categorias + requiredDocs -----
  const categories = [
    {
      slug: 'taxista',
      title: 'Taxista',
      description:
        'Profissionais de táxi com atuação municipal/estadual. Benefícios e exigências específicas para a categoria.',
      requiredDocs: [
        { code: 'CNH', label: 'CNH - Carteira Nacional de Habilitação' },
        { code: 'CRLV', label: 'CRLV do veículo' },
        { code: 'CONDUTAXI', label: 'Condutaxi / Alvará de Táxi' },
        { code: 'COMPROV_END', label: 'Comprovante de endereço (últimos 90 dias)' },
      ],
    },
    {
      slug: 'motorista-app',
      title: 'Motorista de App',
      description:
        'Profissionais cadastrados em aplicativos de mobilidade urbana (ex.: Uber, 99).',
      requiredDocs: [
        { code: 'CNH', label: 'CNH - Carteira Nacional de Habilitação' },
        { code: 'CRLV', label: 'CRLV do veículo' },
        { code: 'COMPROV_APP', label: 'Comprovante de vínculo com app (print do perfil)' },
        { code: 'COMPROV_END', label: 'Comprovante de endereço (últimos 90 dias)' },
      ],
    },
    {
      slug: 'mototaxista',
      title: 'Mototaxista / Motofretista',
      description:
        'Profissionais que utilizam motocicleta para transporte de passageiros ou entregas.',
      requiredDocs: [
        { code: 'CNH', label: 'CNH com observação A - exercício remunerado' },
        { code: 'CRLV', label: 'CRLV da motocicleta' },
        { code: 'CONDUMOTO', label: 'Condumoto / Alvará municipal (se aplicável)' },
        { code: 'COMPROV_END', label: 'Comprovante de endereço (últimos 90 dias)' },
      ],
    },
    {
      slug: 'caminhoneiro',
      title: 'Caminhoneiro',
      description:
        'Motoristas de caminhão autônomos, com exigências de documentação específicas.',
      requiredDocs: [
        { code: 'CNH', label: 'CNH - Categoria C/D/E' },
        { code: 'CRLV', label: 'CRLV do caminhão' },
        { code: 'COMPROV_END', label: 'Comprovante de endereço (últimos 90 dias)' },
      ],
    },
    {
      slug: 'autonomo-geral',
      title: 'Autônomo Geral',
      description:
        'Profissionais autônomos em geral que desejam proteção e benefícios.',
      requiredDocs: [
        { code: 'CNH', label: 'CNH ou RG', isOptional: true },
        { code: 'COMPROV_END', label: 'Comprovante de endereço (últimos 90 dias)' },
      ],
    },
  ];

  for (const c of categories) {
    const category = await prisma.category.upsert({
      where: { slug: c.slug },
      create: { slug: c.slug, title: c.title, description: c.description },
      update: { title: c.title, description: c.description },
    });

    for (const rd of c.requiredDocs) {
      const existing = await prisma.requiredDoc.findFirst({
        where: { categoryId: category.id, code: rd.code },
      });
      if (existing) {
        await prisma.requiredDoc.update({
          where: { id: existing.id },
          data: { label: rd.label, isOptional: !!rd.isOptional },
        });
      } else {
        await prisma.requiredDoc.create({
          data: {
            categoryId: category.id,
            code: rd.code,
            label: rd.label,
            isOptional: !!rd.isOptional,
          },
        });
      }
    }
  }

  // ----- Planos -----
  const plans = [
    { tier: PlanTier.BRONZE, priceCents: BRL(57), displayName: 'Plano Bronze', paymentProviderPlanId: null as string | null },
    { tier: PlanTier.PRATA,  priceCents: BRL(107), displayName: 'Plano Prata',  paymentProviderPlanId: null },
    { tier: PlanTier.OURO,   priceCents: BRL(157), displayName: 'Plano Ouro',   paymentProviderPlanId: null },
  ];

  for (const p of plans) {
    const existing = await prisma.plan.findFirst({ where: { tier: p.tier } });
    if (existing) {
      await prisma.plan.update({
        where: { id: existing.id },
        data: {
          priceCents: p.priceCents,
          currency: 'BRL',
          active: true,
          displayName: p.displayName,
          paymentProviderPlanId: p.paymentProviderPlanId,
        },
      });
    } else {
      await prisma.plan.create({
        data: {
          tier: p.tier,
          priceCents: p.priceCents,
          currency: 'BRL',
          active: true,
          displayName: p.displayName,
          paymentProviderPlanId: p.paymentProviderPlanId,
        },
      });
    }
  }

  // ----- Termos -----
  const terms = [
    {
      slug: 'termos-adesao',
      title: 'Termos de Adesão',
      contentMd:
        '# Termos de Adesão\n\nEste documento descreve as condições gerais de adesão, obrigações e direitos do associado.\n\n*Última atualização: __*',
    },
    {
      slug: 'estatuto',
      title: 'Estatuto',
      contentMd:
        '# Estatuto da Associação\n\nRegras internas, elegibilidade, benefícios e disposições gerais.\n\n*Última atualização: __*',
    },
  ];

  for (const t of terms) {
    await prisma.term.upsert({
      where: { slug: t.slug },
      create: { slug: t.slug, title: t.title, contentMd: t.contentMd, active: true },
      update: { title: t.title, contentMd: t.contentMd, active: true },
    });
  }

  console.log('Seed concluído.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
