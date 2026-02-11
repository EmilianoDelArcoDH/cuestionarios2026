import * as quizService from '../services/quizService.js';
import { submitAttemptSchema } from '../validators/schemas.js';

/**
 * POST /api/topics/:topicId/attempts
 * Procesa un intento de quiz
 */
export async function submitAttempt(req, res) {
  const { topicId } = req.params;
  const { answers } = submitAttemptSchema.parse(req.body);
  
  const result = await quizService.processQuizAttempt(topicId, answers);
  
  res.json(result);
}

/**
 * GET /api/topics/:topicId/attempts
 * Obtiene todos los intentos de un tema
 */
export async function getAttempts(req, res) {
  const { topicId } = req.params;
  
  const attempts = await quizService.getTopicAttempts(topicId);
  
  res.json(attempts);
}
