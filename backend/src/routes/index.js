import express from 'express';
import topicRoutes from './topicRoutes.js';
import questionRoutes from './questionRoutes.js';
import quizRoutes from './quizRoutes.js';

const router = express.Router();

// Montar rutas
router.use('/topics', topicRoutes);
router.use('/', questionRoutes);
router.use('/', quizRoutes);

export default router;
