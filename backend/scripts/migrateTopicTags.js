import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function migrateTopicTags() {
  try {
    console.log('🚀 Iniciando migración de tags...\n');

    // Obtener todos los temas
    const topics = await prisma.topic.findMany();
    console.log(`📊 Encontrados ${topics.length} temas\n`);

    let updated = 0;

    for (const topic of topics) {
      const tags = [];
      const nameUpper = topic.name.toUpperCase();

      // Detectar idioma
      if (nameUpper.includes('[BR]') || nameUpper.includes('BR]')) {
        tags.push('BR');
      }
      if (nameUpper.includes('[EN]') || nameUpper.includes('EN]')) {
        tags.push('EN');
      }
      if (nameUpper.includes('[ES]') || nameUpper.includes('ES]')) {
        tags.push('ES');
      }

      // Detectar categoría
      if (nameUpper.includes('SCHOOL')) {
        tags.push('Schools');
      }
      if (nameUpper.includes('UNIVERSITY') || nameUpper.includes('UNIV')) {
        tags.push('University');
      }
      if (nameUpper.includes('WORK') || nameUpper.includes('TRABAJO')) {
        tags.push('Work');
      }
      if (nameUpper.includes('PERSONAL')) {
        tags.push('Personal');
      }
      if (nameUpper.includes('ONDEMAND') || nameUpper.includes('ON DEMAND')) {
        tags.push('Ondemand');
      }

      // Si detectamos tags, actualizar
      if (tags.length > 0) {
        await prisma.topic.update({
          where: { id: topic.id },
          data: { tags }
        });
        console.log(`✅ ${topic.name}`);
        console.log(`   Tags: ${tags.join(', ')}\n`);
        updated++;
      } else {
        console.log(`⚠️  ${topic.name} - Sin tags detectados\n`);
      }
    }

    console.log(`\n✨ Migración completada: ${updated}/${topics.length} temas actualizados`);
  } catch (error) {
    console.error('❌ Error en la migración:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateTopicTags();
