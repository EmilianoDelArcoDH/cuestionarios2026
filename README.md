# Plataforma de Cuestionarios Dinámicos

Sistema de cuestionarios con preguntas de selección única y múltiple, con orden aleatorio y sistema de intentos.

## Stack Tecnológico

### Backend
- Node.js + Express
- PostgreSQL
- Prisma ORM
- Zod (validación)

### Frontend
- React + Vite
- CSS modules

## Características

- ✅ Gestión de Temas, Preguntas y Respuestas
- ✅ Preguntas de tipo **single choice** (una respuesta correcta) y **multiple choice** (múltiples respuestas correctas)
- ✅ Orden aleatorio de preguntas y respuestas en cada carga
- ✅ Sistema de intentos: hasta 3 intentos por tema
- ✅ Aprobación con 70% o más de respuestas correctas
- ✅ Validación estricta de inputs

## Instalación

### Opción 1: Con Docker (Recomendado)

```bash
# 1. Clonar y entrar al directorio
cd Cuestionario

# 2. Copiar archivo de entorno
cp .env.example .env

# 3. Levantar servicios
docker-compose up -d

# 4. Ejecutar migraciones
cd backend
npm run migrate

# 5. Ejecutar seed (datos de ejemplo)
npm run seed

# 6. El backend estará en http://localhost:3000
# 7. El frontend estará en http://localhost:5173
```

### Opción 2: Local (sin Docker)

#### Backend

```bash
# 1. Instalar PostgreSQL localmente

# 2. Crear base de datos
createdb quiz_platform

# 3. Configurar .env
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL

# 4. Instalar dependencias
cd backend
npm install

# 5. Ejecutar migraciones
npm run migrate

# 6. Ejecutar seed
npm run seed

# 7. Iniciar servidor de desarrollo
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Scripts Disponibles

### Backend

- `npm run dev` - Inicia servidor en modo desarrollo
- `npm run migrate` - Ejecuta migraciones de Prisma
- `npm run seed` - Puebla la base de datos con datos de ejemplo
- `npm run studio` - Abre Prisma Studio (GUI para ver la DB)

### Frontend

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Construye para producción
- `npm run preview` - Preview de build de producción

## Endpoints de la API

### Gestión de Temas

- `POST /api/topics` - Crear tema (idempotente)
  ```json
  { "name": "JavaScript Básico" }
  ```

- `GET /api/topics` - Listar todos los temas

### Gestión de Preguntas

- `POST /api/topics/:topicId/questions` - Crear pregunta con respuestas
  ```json
  {
    "text": "¿Qué es una closure?",
    "type": "single",
    "answers": [
      { "text": "Una función que...", "is_correct": true },
      { "text": "Una variable...", "is_correct": false }
    ]
  }
  ```

- `PUT /api/questions/:questionId` - Editar pregunta
- `PUT /api/answers/:answerId` - Editar respuesta

### Quiz

- `GET /api/topics/:topicId/quiz` - Obtener cuestionario (preguntas y respuestas en orden aleatorio)

- `POST /api/topics/:topicId/attempts` - Enviar respuestas y evaluar
  ```json
  {
    "answers": [
      {
        "question_id": "uuid",
        "selected_answer_ids": ["uuid"]
      }
    ]
  }
  ```

## Modelo de Datos

### Topics
- Temas de cuestionarios (ej: "JavaScript", "Python")

### Questions
- Preguntas vinculadas a un tema
- Tipos: `single` (selección única) o `multiple` (selección múltiple)

### Answers
- Opciones de respuesta para cada pregunta
- Campo `is_correct` indica si es correcta

### Quiz Attempts
- Registro de cada intento de un usuario
- Máximo 3 intentos por tema
- Guarda puntaje y si aprobó (>= 70%)

### Quiz Attempt Answers
- Detalle de respuestas seleccionadas en cada intento

## Reglas de Evaluación

1. **Single Choice**: Correcta si se selecciona exactamente la opción correcta
2. **Multiple Choice**: Correcta si se seleccionan TODAS las opciones correctas y NINGUNA incorrecta
3. **Aprobación**: Score >= 70%
4. **Intentos**: Máximo 3 por tema

## Estructura del Proyecto

```
Cuestionario/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   ├── utils/
│   │   └── middleware/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.js
│   │   └── migrations/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
├── docker-compose.yml
└── .env.example
```

## Licencia

MIT
