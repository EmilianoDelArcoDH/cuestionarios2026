import prisma from '../db/prisma.js';
import { shuffle } from '../utils/helpers.js';

/**
 * Crea una pregunta con sus respuestas
 */
export async function createQuestion(topicId, questionData) {
  const { text, type, answers } = questionData;

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
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { answers: true }
  });

  if (!question) {
    const error = new Error('Pregunta no encontrada');
    error.status = 404;
    throw error;
  }

  // Si se cambia el tipo a 'single', validar que solo haya una respuesta correcta
  if (updateData.type === 'single') {
    const correctAnswers = question.answers.filter(a => a.isCorrect);
    if (correctAnswers.length !== 1) {
      const error = new Error('Las preguntas de tipo "single" deben tener exactamente 1 respuesta correcta');
      error.status = 400;
      throw error;
    }
  }

  return await prisma.question.update({
    where: { id: questionId },
    data: updateData,
    include: { answers: true }
  });
}

/**
 * Obtiene un cuestionario con preguntas y respuestas en orden aleatorio
 */
export async function getQuiz(topicId) {
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
    answers: shuffle(question.answers).map(answer => ({
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
