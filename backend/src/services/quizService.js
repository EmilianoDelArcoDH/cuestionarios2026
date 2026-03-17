/**
 * Devuelve el quiz de un tema (preguntas y respuestas)
 */
import prisma from '../db/prisma.js';
import { arraysEqual } from '../utils/helpers.js';

/**
 * Procesa un intento de quiz
 */



export async function processQuizAttempt(topicId, answersData) {
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
    // Evaluar cada respuesta
    const evaluations = [];
    let correctCount = 0;
    for (const answer of answersData) {
        const question = topic.questions.find(q => q.id === answer.question_id);
        if (!question) continue;
        const correctAnswerIds = question.answers.filter(a => a.isCorrect).map(a => a.id);
        let isCorrect = false;
        if (question.type === 'single') {
            isCorrect = answer.selected_answer_ids.length === 1 && answer.selected_answer_ids[0] === correctAnswerIds[0];
        } else {
            isCorrect = arraysEqual(answer.selected_answer_ids, correctAnswerIds);
        }
        if (isCorrect) correctCount++;
        evaluations.push({
            questionId: question.id,
            selectedAnswerIds: answer.selected_answer_ids,
            isCorrect
        });
    }
    const totalQuestions = topic.questions.length;
    const scorePercent = Number(((correctCount / totalQuestions) * 100).toFixed(2));
    const passed = scorePercent >= 70;
    // Devuelve resultado sin guardar ni limitar intentos
    return {
        attempt: {
            attempt_number: 1,
            score_percent: scorePercent,
            passed,
            remaining_attempts: 2
        }
    };
}


















/**
 * Obtiene los intentos de un tema
 */
