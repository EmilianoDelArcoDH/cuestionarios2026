import * as topicService from '../services/topicService.js';
import { createTopicSchema } from '../validators/schemas.js';

/**
 * POST /api/topics
 * Crea un tema o devuelve el existente
 */
export async function createTopic(req, res) {
  const { name } = createTopicSchema.parse(req.body);
  
  const topic = await topicService.createOrGetTopic(name);
  
  res.status(200).json(topic);
}

/**
 * GET /api/topics
 * Lista todos los temas
 */
export async function getTopics(req, res) {
  const topics = await topicService.getAllTopics();
  
  res.json(topics);
}
