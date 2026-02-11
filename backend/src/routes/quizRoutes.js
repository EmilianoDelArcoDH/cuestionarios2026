import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import * as quizController from '../controllers/quizController.js';

const router = express.Router();

// Enviar intento de quiz
router.post('/topics/:topicId/attempts', asyncHandler(quizController.submitAttempt));

// Obtener intentos de un tema
router.get('/topics/:topicId/attempts', asyncHandler(quizController.getAttempts));

export default router;
