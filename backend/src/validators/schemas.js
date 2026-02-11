import { z } from 'zod';

/**
 * Schema para crear un tema
 */
export const createTopicSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200, 'Nombre muy largo')
});

/**
 * Schema para crear una pregunta con respuestas
 */
export const createQuestionSchema = z.object({
  text: z.string().min(1, 'El texto de la pregunta es requerido'),
  type: z.enum(['single', 'multiple'], {
    errorMap: () => ({ message: 'El tipo debe ser "single" o "multiple"' })
  }),
  answers: z
    .array(
      z.object({
        text: z.string().min(1, 'El texto de la respuesta es requerido'),
        is_correct: z.boolean()
      })
    )
    .min(2, 'Debe haber al menos 2 respuestas')
    .refine(
      (answers) => {
        const correctCount = answers.filter(a => a.is_correct).length;
        return correctCount >= 1;
      },
      { message: 'Debe haber al menos una respuesta correcta' }
    )
    .refine(
      (answers, ctx) => {
        const parentType = ctx.parent?.type;
        if (parentType === 'single') {
          const correctCount = answers.filter(a => a.is_correct).length;
          return correctCount === 1;
        }
        return true;
      },
      { message: 'Las preguntas de tipo "single" deben tener exactamente 1 respuesta correcta' }
    )
}).refine(
  (data) => {
    if (data.type === 'single') {
      const correctCount = data.answers.filter(a => a.is_correct).length;
      return correctCount === 1;
    }
    return true;
  },
  { message: 'Las preguntas de tipo "single" deben tener exactamente 1 respuesta correcta', path: ['answers'] }
);

/**
 * Schema para actualizar una pregunta
 */
export const updateQuestionSchema = z.object({
  text: z.string().min(1, 'El texto de la pregunta es requerido').optional(),
  type: z.enum(['single', 'multiple']).optional()
});

/**
 * Schema para actualizar una respuesta
 */
export const updateAnswerSchema = z.object({
  text: z.string().min(1, 'El texto de la respuesta es requerido').optional(),
  is_correct: z.boolean().optional()
});

/**
 * Schema para enviar respuestas de un intento
 */
export const submitAttemptSchema = z.object({
  answers: z.array(
    z.object({
      question_id: z.string().uuid('ID de pregunta inválido'),
      selected_answer_ids: z.array(z.string().uuid('ID de respuesta inválido')).min(1, 'Debe seleccionar al menos una respuesta')
    })
  ).min(1, 'Debe responder al menos una pregunta')
});
