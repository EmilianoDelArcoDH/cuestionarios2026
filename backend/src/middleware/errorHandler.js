import { ZodError } from 'zod';

/**
 * Middleware global para manejo de errores
 */
export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Error de validación de Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }))
    });
  }

  // Error personalizado con status
  if (err.status) {
    return res.status(err.status).json({
      error: err.message
    });
  }

  // Error genérico del servidor
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
}

/**
 * Middleware para rutas no encontradas
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
}

/**
 * Wrapper para funciones async en rutas Express
 * Captura errores y los pasa al siguiente middleware
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
