const API_BASE_URL = '/api';

/**
 * Manejo de errores de API
 */
async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `HTTP error ${response.status}`);
  }
  return response.json();
}

/**
 * Obtener todos los temas
 */
export async function getTopics() {
  const response = await fetch(`${API_BASE_URL}/topics`);
  return handleResponse(response);
}

/**
 * Crear un tema
 */
export async function createTopic(name) {
  const response = await fetch(`${API_BASE_URL}/topics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  return handleResponse(response);
}

/**
 * Crear una pregunta con respuestas
 */
export async function createQuestion(topicId, questionData) {
  const response = await fetch(`${API_BASE_URL}/topics/${topicId}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(questionData)
  });
  return handleResponse(response);
}

/**
 * Obtener quiz de un tema
 */
export async function getQuiz(topicId) {
  const response = await fetch(`${API_BASE_URL}/topics/${topicId}/quiz`);
  return handleResponse(response);
}

/**
 * Enviar respuestas de un intento
 */
export async function submitAttempt(topicId, answers) {
  const response = await fetch(`${API_BASE_URL}/topics/${topicId}/attempts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers })
  });
  return handleResponse(response);
}

/**
 * Obtener intentos de un tema
 */
export async function getAttempts(topicId) {
  const response = await fetch(`${API_BASE_URL}/topics/${topicId}/attempts`);
  return handleResponse(response);
}
