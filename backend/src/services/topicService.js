import prisma from '../db/prisma.js';
import { slugify } from '../utils/helpers.js';

/**
 * Crea un tema o devuelve el existente si ya existe
 */
export async function createOrGetTopic(name, tags = []) {
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
        slug,
        tags: Array.isArray(tags) ? tags : []
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
  const topic = await prisma.topic.findUnique({
    where: { id: topicId }
  });

  if (!topic) {
    const error = new Error('Tema no encontrado');
    error.status = 404;
    throw error;
  }

  return topic;
}

/**
 * Actualiza un tema
 */
export async function updateTopic(topicId, updateData) {
  const topic = await prisma.topic.findUnique({
    where: { id: topicId }
  });

  if (!topic) {
    const error = new Error('Tema no encontrado');
    error.status = 404;
    throw error;
  }

  const { name, tags } = updateData;
  const slug = name ? slugify(name) : undefined;

  return await prisma.topic.update({
    where: { id: topicId },
    data: {
      ...(name && { name }),
      ...(slug && { slug }),
      ...(tags !== undefined && { tags: Array.isArray(tags) ? tags : [] })
    }
  });
}

/**
 * Elimina un tema
 */
export async function deleteTopic(topicId) {
  const topic = await prisma.topic.findUnique({
    where: { id: topicId }
  });

  if (!topic) {
    const error = new Error('Tema no encontrado');
    error.status = 404;
    throw error;
  }

  await prisma.topic.delete({
    where: { id: topicId }
  });

  return { message: 'Tema eliminado exitosamente' };
}
