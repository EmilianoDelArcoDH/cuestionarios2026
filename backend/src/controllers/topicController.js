import * as topicService from '../services/topicService.js';
import { createTopicSchema } from '../validators/schemas.js';

/**
 * POST /api/topics
 * Crea un tema o devuelve el existente
 */
export async function createTopic(req, res) {
  const { name, tags } = req.body;
  
  const topic = await topicService.createOrGetTopic(name, tags);
  
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

/**
 * GET /api/topics/:topicId
 * Obtiene un tema específico
 */
export async function getTopic(req, res) {
  const { topicId } = req.params;
  
  const topic = await topicService.getTopicById(topicId);
  
  res.json(topic);
}

/**
 * PUT /api/topics/:topicId
 * Actualiza un tema
 */
export async function updateTopic(req, res) {
  const { topicId } = req.params;
  const updateData = req.body;
  
  const topic = await topicService.updateTopic(topicId, updateData);
  
  res.json(topic);
}

/**
 * DELETE /api/topics/:topicId
 * Elimina un tema
 */
export async function deleteTopic(req, res) {
  const { topicId } = req.params;
  
  const result = await topicService.deleteTopic(topicId);
  
  res.json(result);
}
