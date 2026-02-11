import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import * as questionController from '../controllers/questionController.js';

const router = express.Router();

// Crear pregunta para un tema
router.post('/topics/:topicId/questions', asyncHandler(questionController.createQuestion));

// Actualizar pregunta
router.put('/questions/:questionId', asyncHandler(questionController.updateQuestion));

// Actualizar respuesta
router.put('/answers/:answerId', asyncHandler(questionController.updateAnswer));

// Obtener quiz de un tema (con orden aleatorio)
router.get('/topics/:topicId/quiz', asyncHandler(questionController.getQuiz));

export default router;
