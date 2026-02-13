import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Sets para rastrear los slugs y nombres ya usados
const usedSlugs = new Set();
const usedNames = new Set();

// Función para generar slug a partir del nombre
function generateSlug(name) {
  let baseSlug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  if (!baseSlug) {
    baseSlug = 'topic';
  }
  
  let slug = baseSlug;
  let counter = 1;
  while (usedSlugs.has(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  usedSlugs.add(slug);
  return slug;
}

// Función para generar nombre único
function generateUniqueName(name) {
  let uniqueName = name;
  let counter = 1;
  
  while (usedNames.has(uniqueName)) {
    uniqueName = `${name} (${counter})`;
    counter++;
  }
  
  usedNames.add(uniqueName);
  return uniqueName;
}

// Función para leer el CSV
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

// Función para limpiar HTML de las preguntas (mantener imágenes y estructura básica)
function cleanHTML(text) {
  if (!text) return '';
  // Decodificar entidades HTML pero mantener las etiquetas importantes como img, p, h4, etc.
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes
  await prisma.quizAttemptAnswer.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.question.deleteMany();
  await prisma.topic.deleteMany();

  console.log('✅ Datos anteriores eliminados');

  // Leer el archivo CSV
  const csvPath = path.join(__dirname, 'cuestionarios.csv');
  console.log('📖 Leyendo archivo CSV...');
  const rows = await readCSV(csvPath);
  
  console.log(`📚 Procesando ${rows.length} filas del CSV...`);

  // Agrupar filas por quiz y luego por pregunta
  const quizzes = new Map();
  
  for (const row of rows) {
    const quizId = row.quiz_id;
    const questionId = row.question_id;
    
    if (!quizzes.has(quizId)) {
      quizzes.set(quizId, {
        id: quizId,
        name: row.quiz_name,
        questions: new Map()
      });
    }
    
    const quiz = quizzes.get(quizId);
    
    if (!quiz.questions.has(questionId)) {
      quiz.questions.set(questionId, {
        id: questionId,
        statement: row.question_statement,
        type: row.question_type,
        order: parseInt(row.question_order || 0),
        choices: []
      });
    }
    
    const question = quiz.questions.get(questionId);
    
    // Solo agregar choices si es tipo choice y tiene un choice_option_id
    if (row.question_type === 'choice' && row.choice_option_id) {
      question.choices.push({
        id: row.choice_option_id,
        statement: row.choice_option_statement,
        order: parseInt(row.choice_option_order || 0),
        is_correct: row.is_correct === '1'
      });
    }
  }

  let topicsCreated = 0;
  let questionsCreated = 0;
  let skippedQuizzes = 0;

  // Procesar cada quiz
  for (const [quizId, quiz] of quizzes) {
    const uniqueName = generateUniqueName(quiz.name);
    
    // Contar preguntas válidas (tipo choice con respuestas)
    const validQuestions = Array.from(quiz.questions.values()).filter(q => 
      q.type === 'choice' && q.choices.length > 0
    );

    if (validQuestions.length === 0) {
      skippedQuizzes++;
      continue;
    }

    // Crear el tema
    const topic = await prisma.topic.create({
      data: {
        name: uniqueName,
        slug: generateSlug(quiz.name)
      }
    });

    topicsCreated++;

    // Procesar las preguntas
    for (const question of validQuestions) {
      // Determinar el tipo de pregunta
      const correctAnswersCount = question.choices.filter(c => c.is_correct).length;
      
      if (correctAnswersCount === 0) {
        continue; // Saltar preguntas sin respuesta correcta
      }
      
      const questionType = correctAnswersCount > 1 ? 'multiple' : 'single';

      // Crear la pregunta con sus respuestas
      await prisma.question.create({
        data: {
          topicId: topic.id,
          text: cleanHTML(question.statement),
          type: questionType,
          answers: {
            create: question.choices
              .sort((a, b) => a.order - b.order)
              .map(choice => ({
                text: cleanHTML(choice.statement) || 'Sin texto',
                isCorrect: choice.is_correct
              }))
          }
        }
      });

      questionsCreated++;
    }

    console.log(`✅ "${uniqueName}" - ${validQuestions.length} preguntas`);
  }

  console.log(`\n🎉 Seed completado!`);
  console.log(`📊 Cuestionarios creados: ${topicsCreated}`);
  console.log(`❓ Preguntas creadas: ${questionsCreated}`);
  console.log(`⏭️  Cuestionarios sin preguntas válidas: ${skippedQuizzes}`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
