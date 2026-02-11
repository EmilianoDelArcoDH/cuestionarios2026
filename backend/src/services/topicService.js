import prisma from '../db/prisma.js';
import { slugify } from '../utils/helpers.js';

/**
 * Crea un tema o devuelve el existente si ya existe
 */
export async function createOrGetTopic(name) {
  const slug = slugify(name);

  // Buscar si ya existe
  let topic = await prisma.topic.findFirst({
    where: {
      OR: [
        { slug },
        { name }
      ]
    }
  });

  // Si no existe, crearlo
  if (!topic) {
    topic = await prisma.topic.create({
      data: {
        name,
        slug
      }
    });
  }

  return topic;
}

/**
 * Obtiene todos los temas
 */
export async function getAllTopics() {
  return await prisma.topic.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      _count: {
        select: {
          questions: true
        }
      }
    }
  });
}

/**
 * Obtiene un tema por ID
 */
export async function getTopicById(topicId) {
  return await prisma.topic.findUnique({
    where: { id: topicId }
  });
}
