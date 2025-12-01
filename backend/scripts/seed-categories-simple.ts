import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Criando categorias...\n');

  const categories = [
    {
      title: 'Motorista de Aplicativo',
      slug: 'motorista-aplicativo',
      description: 'Para motoristas de Uber, 99, etc.',
    },
    {
      title: 'Taxista',
      slug: 'taxista',
      description: 'Para motoristas de táxi',
    },
    {
      title: 'Motorista Particular',
      slug: 'motorista-particular',
      description: 'Para motoristas particulares',
    },
    {
      title: 'Entregador',
      slug: 'entregador',
      description: 'Para entregadores de moto/bicicleta',
    },
  ];

  for (const cat of categories) {
    const existing = await prisma.category.findFirst({
      where: { slug: cat.slug },
    });

    if (!existing) {
      const created = await prisma.category.create({
        data: {
          title: cat.title,
          slug: cat.slug,
          description: cat.description,
        },
      });
      
      // Adicionar documentos obrigatórios
      const docs = cat.slug === 'entregador' 
        ? [
            { code: 'CNH', label: 'CNH ou RG', isOptional: false },
            { code: 'COMPROVANTE_RESIDENCIA', label: 'Comprovante de Residência', isOptional: false },
          ]
        : cat.slug === 'taxista'
        ? [
            { code: 'CNH', label: 'CNH (Carteira Nacional de Habilitação)', isOptional: false },
            { code: 'CRLV', label: 'CRLV (Documento do Veículo)', isOptional: false },
            { code: 'ALVARA_TAXI', label: 'Alvará de Táxi', isOptional: false },
            { code: 'COMPROVANTE_RESIDENCIA', label: 'Comprovante de Residência', isOptional: false },
          ]
        : [
            { code: 'CNH', label: 'CNH (Carteira Nacional de Habilitação)', isOptional: false },
            { code: 'CRLV', label: 'CRLV (Documento do Veículo)', isOptional: false },
            { code: 'COMPROVANTE_RESIDENCIA', label: 'Comprovante de Residência', isOptional: false },
          ];

      for (const doc of docs) {
        await prisma.requiredDoc.create({
          data: {
            categoryId: created.id,
            code: doc.code,
            label: doc.label,
            isOptional: doc.isOptional,
          },
        });
      }

      console.log(`✅ Categoria criada: ${cat.title} (${docs.length} documentos)`);
    } else {
      console.log(`⏭️  Categoria já existe: ${cat.title}`);
    }
  }

  console.log('\n✅ Seed concluído!');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
