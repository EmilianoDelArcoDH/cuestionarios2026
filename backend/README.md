# Backend - Plataforma de Cuestionarios

API REST con Express + Prisma + PostgreSQL

## Instalación

```bash
npm install
```

## Scripts

- `npm run dev` - Servidor en modo desarrollo (con hot reload)
- `npm run start` - Servidor en modo producción
- `npm run migrate` - Ejecutar migraciones de Prisma
- `npm run seed` - Poblar base de datos con datos de ejemplo
- `npm run studio` - Abrir Prisma Studio (GUI)
- `npm run generate` - Generar cliente de Prisma

## Variables de Entorno

Crear archivo `.env` con:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/quiz_platform?schema=public"
PORT=3000
NODE_ENV=development
```

## Estructura

```
src/
├── app.js                  # Configuración de Express
├── server.js               # Punto de entrada
├── controllers/            # Controladores de rutas
│   ├── topicController.js
│   ├── questionController.js
│   └── quizController.js
├── routes/                 # Definición de rutas
│   ├── index.js
│   ├── topicRoutes.js
│   ├── questionRoutes.js
│   └── quizRoutes.js
├── services/               # Lógica de negocio
│   ├── topicService.js
│   ├── questionService.js
│   ├── answerService.js
│   └── quizService.js
├── validators/             # Validación con Zod
│   └── schemas.js
├── middleware/             # Middleware personalizado
│   └── errorHandler.js
├── utils/                  # Utilidades
│   └── helpers.js
└── db/                     # Cliente de Prisma
    └── prisma.js
```

## Endpoints

### Temas
- `POST /api/topics` - Crear tema
- `GET /api/topics` - Listar temas

### Preguntas
- `POST /api/topics/:topicId/questions` - Crear pregunta
- `PUT /api/questions/:questionId` - Actualizar pregunta
- `PUT /api/answers/:answerId` - Actualizar respuesta

### Quiz
- `GET /api/topics/:topicId/quiz` - Obtener quiz (aleatorio)
- `POST /api/topics/:topicId/attempts` - Enviar respuestas
- `GET /api/topics/:topicId/attempts` - Ver intentos anteriores
