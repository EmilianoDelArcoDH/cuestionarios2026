import * as questionService from '../services/questionService.js';
import * as answerService from '../services/answerService.js';
import {
  createQuestionSchema,
  updateQuestionSchema,
  updateAnswerSchema
} from '../validators/schemas.js';

/**
 * POST /api/topics/:topicId/questions
 * Crea una pregunta con sus respuestas
 */
export async function createQuestion(req, res) {
  const { topicId } = req.params;
  const questionData = createQuestionSchema.parse(req.body);
  
  const question = await questionService.createQuestion(topicId, questionData);
  
  res.status(201).json(question);
}

/**
 * GET /api/topics/:topicId/questions
 * Obtiene todas las preguntas de un tema
 */
export async function getQuestions(req, res) {
  const { topicId } = req.params;
  
  const questions = await questionService.getQuestions(topicId);
  
  res.json(questions);
}

/**
 * PUT /api/topics/:topicId/questions/:questionId
 * Actualiza una pregunta
 */
export async function updateQuestion(req, res) {
  const { questionId } = req.params;
  const updateData = req.body;
  
  const question = await questionService.updateQuestion(questionId, updateData);
  
  res.json(question);
}

/**
 * DELETE /api/topics/:topicId/questions/:questionId
 * Elimina una pregunta
 */
export async function deleteQuestion(req, res) {
  const { questionId } = req.params;
  
  const result = await questionService.deleteQuestion(questionId);
  
  res.json(result);
}

/**
 * PUT /api/answers/:answerId
 * Actualiza una respuesta
 */
export async function updateAnswer(req, res) {
  const { answerId } = req.params;
  const updateData = updateAnswerSchema.parse(req.body);
  
  const answer = await answerService.updateAnswer(answerId, updateData);
  
  res.json(answer);
}

/**
 * GET /api/topics/:topicId/quiz
 * Obtiene un cuestionario con preguntas y respuestas en orden aleatorio
 */
export async function getQuiz(req, res) {
  const { topicId } = req.params;
  console.log('📥 GET /api/topics/:topicId/quiz - topicId recibido:', topicId);
  
  const quiz = await questionService.getQuiz(topicId);
  
  res.json(quiz);
}
