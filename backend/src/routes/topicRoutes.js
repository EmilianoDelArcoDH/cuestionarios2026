import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import * as topicController from '../controllers/topicController.js';

const router = express.Router();

router.post('/', asyncHandler(topicController.createTopic));
router.get('/', asyncHandler(topicController.getTopics));
router.get('/:topicId', asyncHandler(topicController.getTopic));
router.put('/:topicId', asyncHandler(topicController.updateTopic));
router.delete('/:topicId', asyncHandler(topicController.deleteTopic));

export default router;
