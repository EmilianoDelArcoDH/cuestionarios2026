import prisma from '../db/prisma.js';
import { shuffle } from '../utils/helpers.js';

function normalizeAnswerText(text) {
  return text.trim().toLowerCase();
}

function ensureUniqueAnswers(answers) {
  const seen = new Set();

  for (const answer of answers) {
    const normalizedText = normalizeAnswerText(answer.text);

    if (seen.has(normalizedText)) {
      const error = new Error('No se permiten respuestas duplicadas en una misma pregunta');
      error.status = 400;
      throw error;
    }

    seen.add(normalizedText);
  }
}

function dedupeAnswersForQuiz(answers) {
  const seen = new Set();

  return answers.filter((answer) => {
    const normalizedText = normalizeAnswerText(answer.text);

    if (seen.has(normalizedText)) {
      return false;
    }

    seen.add(normalizedText);
    return true;
  });
}

/**
 * Crea una pregunta con sus respuestas
 */
export async function createQuestion(topicId, questionData) {
  const { text, type, answers } = questionData;

  ensureUniqueAnswers(answers);

  // Verificar que el tema existe
  const topic = await prisma.topic.findUnique({
    where: { id: topicId }
  });

  if (!topic) {
    const error = new Error('Tema no encontrado');
    error.status = 404;
    throw error;
  }

  // Crear pregunta con respuestas en una transacción
  const question = await prisma.question.create({
    data: {
      topicId,
      text,
      type,
      answers: {
        create: answers.map(answer => ({
          text: answer.text,
          isCorrect: answer.is_correct
        }))
      }
    },
    include: {
      answers: true
    }
  });

  return question;
}

/**
 * Actualiza una pregunta
 */
export async function updateQuestion(questionId, updateData) {
  const { text, type, answers } = updateData;
  
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { answers: true }
  });

  if (!question) {
    const error = new Error('Pregunta no encontrada');
    error.status = 404;
    throw error;
  }

  // Si se proporcionan respuestas, actualizar en transacción
  if (answers) {
    ensureUniqueAnswers(answers);

    return await prisma.$transaction(async (tx) => {
      // Eliminar respuestas antiguas
      await tx.answer.deleteMany({
        where: { questionId }
      });

      // Actualizar pregunta y crear nuevas respuestas
      return await tx.question.update({
        where: { id: questionId },
        data: {
          text: text || question.text,
          type: type || question.type,
          answers: {
            create: answers.map(answer => ({
              text: answer.text,
              isCorrect: answer.is_correct
            }))
          }
        },
        include: { answers: true }
      });
    });
  }

  // Si solo se actualiza el texto o tipo
  return await prisma.question.update({
    where: { id: questionId },
    data: { text, type },
    include: { answers: true }
  });
}

/**
 * Obtiene todas las preguntas de un tema
 */
export async function getQuestions(topicId) {
  const questions = await prisma.question.findMany({
    where: { topicId },
    include: {
      answers: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  return questions;
}

/**
 * Elimina una pregunta
 */
export async function deleteQuestion(questionId) {
  const question = await prisma.question.findUnique({
    where: { id: questionId }
  });

  if (!question) {
    const error = new Error('Pregunta no encontrada');
    error.status = 404;
    throw error;
  }

  await prisma.question.delete({
    where: { id: questionId }
  });

  return { message: 'Pregunta eliminada exitosamente' };
}

/**
 * Obtiene un cuestionario con preguntas y respuestas en orden aleatorio
 */
export async function getQuiz(topicId) {
  console.log('🔍 Buscando quiz para topicId:', topicId);
  console.log('   Tipo:', typeof topicId);
  console.log('   Longitud:', topicId?.length);
  
  // Validar formato UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(topicId)) {
    console.log('❌ El topicId no es un UUID válido');
    const error = new Error('ID de tema inválido');
    error.status = 400;
    throw error;
  }
  
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: {
      questions: {
        include: {
          answers: true
        }
      }
    }
  });

  console.log('📊 Tema encontrado:', topic ? `${topic.name} (${topic.questions.length} preguntas)` : 'null');

  if (!topic) {
    const error = new Error('Tema no encontrado');
    error.status = 404;
    throw error;
  }

  if (topic.questions.length === 0) {
    const error = new Error('Este tema no tiene preguntas disponibles');
    error.status = 400;
    throw error;
  }

  // Mezclar preguntas aleatoriamente
  const shuffledQuestions = shuffle(topic.questions);

  // Mezclar respuestas de cada pregunta y eliminar información sensible
  const questionsForQuiz = shuffledQuestions.map(question => ({
    id: question.id,
    text: question.text,
    type: question.type,
    answers: shuffle(dedupeAnswersForQuiz(question.answers)).map(answer => ({
      id: answer.id,
      text: answer.text
      // NO enviar is_correct al frontend
    }))
  }));

  return {
    topic: {
      id: topic.id,
      name: topic.name,
      slug: topic.slug
    },
    questions: questionsForQuiz
  };
}
