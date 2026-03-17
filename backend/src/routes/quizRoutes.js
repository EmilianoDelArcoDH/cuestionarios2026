// Obtener quiz de un tema
router.get('/topics/:topicId/quiz', asyncHandler(quizController.getQuiz));
import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import * as quizController from '../controllers/quizController.js';

const router = express.Router();

// Enviar intento de quiz

// Obtener intentos de un tema

export default router;
