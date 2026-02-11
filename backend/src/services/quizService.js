import prisma from '../db/prisma.js';
import { arraysEqual } from '../utils/helpers.js';

/**
 * Procesa un intento de quiz
 */
export async function processQuizAttempt(topicId, answersData) {
    // Verificar que el tema existe
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

    // Verificar cuántos intentos ya existen para este tema
    const existingAttempts = await prisma.quizAttempt.findMany({
        where: { topicId },
        orderBy: { attemptNumber: 'desc' }
    });

    if (existingAttempts.length >= 3) {
        const error = new Error('No hay más intentos disponibles para este tema');
        error.status = 403;
        throw error;
    }

    const attemptNumber = existingAttempts.length + 1;

    // Validar que se respondieron todas las preguntas del tema
    const questionIds = topic.questions.map(q => q.id);
    const answeredQuestionIds = answersData.map(a => a.question_id);

    const missingQuestions = questionIds.filter(qId => !answeredQuestionIds.includes(qId));
    if (missingQuestions.length > 0) {
        const error = new Error('Debe responder todas las preguntas del cuestionario');
        error.status = 400;
        throw error;
    }

    // Evaluar cada respuesta
    const evaluations = [];
    let correctCount = 0;

    for (const answer of answersData) {
        const question = topic.questions.find(q => q.id === answer.question_id);

        if (!question) {
            const error = new Error(`Pregunta con ID ${answer.question_id} no pertenece a este tema`);
            error.status = 400;
            throw error;
        }

        // Obtener IDs de respuestas correctas
        const correctAnswerIds = question.answers
            .filter(a => a.isCorrect)
            .map(a => a.id);

        // Validar que las respuestas seleccionadas existen para esta pregunta
        const validAnswerIds = question.answers.map(a => a.id);
        const invalidAnswers = answer.selected_answer_ids.filter(
            id => !validAnswerIds.includes(id)
        );

        if (invalidAnswers.length > 0) {
            const error = new Error(`Respuestas inválidas para la pregunta ${question.text}`);
            error.status = 400;
            throw error;
        }

        let isCorrect = false;

        if (question.type === 'single') {
            // Para single: debe haber exactamente 1 seleccionada y debe ser la correcta
            isCorrect = answer.selected_answer_ids.length === 1 &&
                answer.selected_answer_ids[0] === correctAnswerIds[0];
        } else {
            // Para multiple: debe coincidir exactamente el conjunto de correctas
            isCorrect = arraysEqual(answer.selected_answer_ids, correctAnswerIds);
        }

        if (isCorrect) {
            correctCount++;
        }

        evaluations.push({
            questionId: question.id,
            selectedAnswerIds: answer.selected_answer_ids,
            isCorrect
        });
    }

    // Calcular puntaje
    const totalQuestions = topic.questions.length;
    const scorePercent = Number(((correctCount / totalQuestions) * 100).toFixed(2));
    const passed = scorePercent >= 70;

    // Guardar intento y respuestas en transacción
    const attempt = await prisma.$transaction(async (tx) => {
        const newAttempt = await tx.quizAttempt.create({
            data: {
                topicId,
                attemptNumber,
                scorePercent,
                passed
            }
        });

        // Guardar cada respuesta del intento
        await tx.quizAttemptAnswer.createMany({
            data: evaluations.map(evaluation => ({
                attemptId: newAttempt.id,
                questionId: evaluation.questionId,
                selectedAnswerIds: evaluation.selectedAnswerIds,
                isCorrect: evaluation.isCorrect
            }))
        });

        return newAttempt;
    });

    return {
        attempt: {
            id: attempt.id,
            attempt_number: attempt.attemptNumber,
            score_percent: Number(attempt.scorePercent),
            passed: attempt.passed,
            remaining_attempts: 3 - attemptNumber
        }
    };
}

/**
 * Obtiene los intentos de un tema
 */
export async function getTopicAttempts(topicId) {
    return await prisma.quizAttempt.findMany({
        where: { topicId },
        orderBy: { createdAt: 'desc' },
        include: {
            answers: {
                include: {
                    question: {
                        select: {
                            text: true,
                            type: true
                        }
                    }
                }
            }
        }
    });
}
