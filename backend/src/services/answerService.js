import prisma from '../db/prisma.js';

/**
 * Actualiza una respuesta
 */
export async function updateAnswer(answerId, updateData) {
  const answer = await prisma.answer.findUnique({
    where: { id: answerId },
    include: {
      question: {
        include: {
          answers: true
        }
      }
    }
  });

  if (!answer) {
    const error = new Error('Respuesta no encontrada');
    error.status = 404;
    throw error;
  }

  // Si se marca como correcta y la pregunta es single, asegurarse que solo haya una correcta
  if (updateData.isCorrect === true && answer.question.type === 'single') {
    const otherCorrect = answer.question.answers.filter(
      a => a.id !== answerId && a.isCorrect
    );

    if (otherCorrect.length > 0) {
      const error = new Error('Las preguntas de tipo "single" solo pueden tener una respuesta correcta. Desmarca las otras primero.');
      error.status = 400;
      throw error;
    }
  }

  // Si se desmarca la única correcta en una pregunta single
  if (updateData.isCorrect === false && answer.question.type === 'single' && answer.isCorrect) {
    const error = new Error('Las preguntas de tipo "single" deben tener al menos una respuesta correcta');
    error.status = 400;
    throw error;
  }

  // Si se desmarca y es pregunta multiple, verificar que quede al menos una correcta
  if (updateData.isCorrect === false && answer.isCorrect) {
    const correctCount = answer.question.answers.filter(a => a.isCorrect).length;
    if (correctCount === 1) {
      const error = new Error('Debe haber al menos una respuesta correcta');
      error.status = 400;
      throw error;
    }
  }

  return await prisma.answer.update({
    where: { id: answerId },
    data: updateData
  });
}
