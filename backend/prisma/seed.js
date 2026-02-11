import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes
  await prisma.quizAttemptAnswer.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.question.deleteMany();
  await prisma.topic.deleteMany();

  console.log('✅ Datos anteriores eliminados');

  // Crear temas
  const jsTopic = await prisma.topic.create({
    data: {
      name: 'JavaScript Básico',
      slug: 'javascript-basico'
    }
  });

  const reactTopic = await prisma.topic.create({
    data: {
      name: 'React Fundamentals',
      slug: 'react-fundamentals'
    }
  });

  console.log('✅ Temas creados');

  // Preguntas para JavaScript Básico
  await prisma.question.create({
    data: {
      topicId: jsTopic.id,
      text: '¿Qué es una closure en JavaScript?',
      type: 'single',
      answers: {
        create: [
          {
            text: 'Una función que tiene acceso a variables de su ámbito externo',
            isCorrect: true
          },
          {
            text: 'Una función que se ejecuta automáticamente',
            isCorrect: false
          },
          {
            text: 'Un método para cerrar el navegador',
            isCorrect: false
          },
          {
            text: 'Una variable que no puede ser modificada',
            isCorrect: false
          }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: jsTopic.id,
      text: '¿Cuáles de los siguientes son tipos primitivos en JavaScript?',
      type: 'multiple',
      answers: {
        create: [
          {
            text: 'string',
            isCorrect: true
          },
          {
            text: 'number',
            isCorrect: true
          },
          {
            text: 'array',
            isCorrect: false
          },
          {
            text: 'boolean',
            isCorrect: true
          },
          {
            text: 'object',
            isCorrect: false
          }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: jsTopic.id,
      text: '¿Qué hace el operador "===" en JavaScript?',
      type: 'single',
      answers: {
        create: [
          {
            text: 'Compara valor y tipo de dato',
            isCorrect: true
          },
          {
            text: 'Solo compara el valor',
            isCorrect: false
          },
          {
            text: 'Asigna un valor a una variable',
            isCorrect: false
          },
          {
            text: 'Compara referencias de objetos',
            isCorrect: false
          }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: jsTopic.id,
      text: '¿Cuáles de las siguientes son formas válidas de declarar variables?',
      type: 'multiple',
      answers: {
        create: [
          {
            text: 'var',
            isCorrect: true
          },
          {
            text: 'let',
            isCorrect: true
          },
          {
            text: 'const',
            isCorrect: true
          },
          {
            text: 'variable',
            isCorrect: false
          }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: jsTopic.id,
      text: '¿Qué método se usa para agregar un elemento al final de un array?',
      type: 'single',
      answers: {
        create: [
          {
            text: 'push()',
            isCorrect: true
          },
          {
            text: 'pop()',
            isCorrect: false
          },
          {
            text: 'shift()',
            isCorrect: false
          },
          {
            text: 'unshift()',
            isCorrect: false
          }
        ]
      }
    }
  });

  console.log('✅ Preguntas de JavaScript creadas');

  // Preguntas para React Fundamentals
  await prisma.question.create({
    data: {
      topicId: reactTopic.id,
      text: '¿Qué es JSX?',
      type: 'single',
      answers: {
        create: [
          {
            text: 'Una extensión de sintaxis de JavaScript que permite escribir HTML en JS',
            isCorrect: true
          },
          {
            text: 'Un framework de CSS',
            isCorrect: false
          },
          {
            text: 'Una librería de testing',
            isCorrect: false
          },
          {
            text: 'Un gestor de paquetes',
            isCorrect: false
          }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: reactTopic.id,
      text: '¿Cuáles son hooks válidos en React?',
      type: 'multiple',
      answers: {
        create: [
          {
            text: 'useState',
            isCorrect: true
          },
          {
            text: 'useEffect',
            isCorrect: true
          },
          {
            text: 'useComponent',
            isCorrect: false
          },
          {
            text: 'useContext',
            isCorrect: true
          },
          {
            text: 'useRender',
            isCorrect: false
          }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: reactTopic.id,
      text: '¿Qué hook se utiliza para efectos secundarios?',
      type: 'single',
      answers: {
        create: [
          {
            text: 'useEffect',
            isCorrect: true
          },
          {
            text: 'useState',
            isCorrect: false
          },
          {
            text: 'useCallback',
            isCorrect: false
          },
          {
            text: 'useMemo',
            isCorrect: false
          }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: reactTopic.id,
      text: '¿Cuáles de las siguientes afirmaciones sobre props son correctas?',
      type: 'multiple',
      answers: {
        create: [
          {
            text: 'Props son inmutables',
            isCorrect: true
          },
          {
            text: 'Props se pasan de padre a hijo',
            isCorrect: true
          },
          {
            text: 'Props pueden ser modificadas dentro del componente hijo',
            isCorrect: false
          },
          {
            text: 'Props son opcionales',
            isCorrect: true
          }
        ]
      }
    }
  });

  console.log('✅ Preguntas de React creadas');

  // Crear más temas para las preguntas adicionales
  const htmlTopic = await prisma.topic.create({
    data: {
      name: 'HTML y CSS',
      slug: 'html-css'
    }
  });

  const nodeTopic = await prisma.topic.create({
    data: {
      name: 'Node.js',
      slug: 'nodejs'
    }
  });

  const dbTopic = await prisma.topic.create({
    data: {
      name: 'Bases de Datos',
      slug: 'bases-datos'
    }
  });

  // Más preguntas de JavaScript (10 adicionales)
  await prisma.question.create({
    data: {
      topicId: jsTopic.id,
      text: '¿Qué es el hoisting en JavaScript?',
      type: 'single',
      answers: {
        create: [
          { text: 'El comportamiento de mover declaraciones al inicio del scope', isCorrect: true },
          { text: 'Una forma de comprimir código', isCorrect: false },
          { text: 'Un método para importar módulos', isCorrect: false },
          { text: 'Una función de orden superior', isCorrect: false }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: jsTopic.id,
      text: '¿Cuáles son métodos de array en JavaScript?',
      type: 'multiple',
      answers: {
        create: [
          { text: 'map()', isCorrect: true },
          { text: 'filter()', isCorrect: true },
          { text: 'reduce()', isCorrect: true },
          { text: 'select()', isCorrect: false },
          { text: 'find()', isCorrect: true }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: jsTopic.id,
      text: '¿Qué es "this" en JavaScript?',
      type: 'single',
      answers: {
        create: [
          { text: 'Una referencia al contexto de ejecución actual', isCorrect: true },
          { text: 'Una palabra reservada para bucles', isCorrect: false },
          { text: 'Un operador de comparación', isCorrect: false },
          { text: 'Una función built-in', isCorrect: false }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: jsTopic.id,
      text: '¿Qué hace el método bind()?',
      type: 'single',
      answers: {
        create: [
          { text: 'Crea una nueva función con un contexto "this" específico', isCorrect: true },
          { text: 'Une dos arrays', isCorrect: false },
          { text: 'Vincula un evento a un elemento', isCorrect: false },
          { text: 'Conecta con una base de datos', isCorrect: false }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: jsTopic.id,
      text: '¿Cuáles son formas de crear objetos en JavaScript?',
      type: 'multiple',
      answers: {
        create: [
          { text: 'Object literal {}', isCorrect: true },
          { text: 'Constructor new Object()', isCorrect: true },
          { text: 'Object.create()', isCorrect: true },
          { text: 'object.new()', isCorrect: false }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: jsTopic.id,
      text: '¿Qué es una Promise?',
      type: 'single',
      answers: {
        create: [
          { text: 'Un objeto que representa una operación asíncrona', isCorrect: true },
          { text: 'Una función que retorna valores', isCorrect: false },
          { text: 'Un tipo de bucle', isCorrect: false },
          { text: 'Una estructura de datos', isCorrect: false }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: jsTopic.id,
      text: '¿Qué método detiene la propagación de un evento?',
      type: 'single',
      answers: {
        create: [
          { text: 'stopPropagation()', isCorrect: true },
          { text: 'preventDefault()', isCorrect: false },
          { text: 'stopEvent()', isCorrect: false },
          { text: 'haltPropagation()', isCorrect: false }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: jsTopic.id,
      text: '¿Cuáles son estados de una Promise?',
      type: 'multiple',
      answers: {
        create: [
          { text: 'pending', isCorrect: true },
          { text: 'fulfilled', isCorrect: true },
          { text: 'rejected', isCorrect: true },
          { text: 'completed', isCorrect: false },
          { text: 'waiting', isCorrect: false }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: jsTopic.id,
      text: '¿Qué significa NaN en JavaScript?',
      type: 'single',
      answers: {
        create: [
          { text: 'Not a Number', isCorrect: true },
          { text: 'Null and Null', isCorrect: false },
          { text: 'New Array Number', isCorrect: false },
          { text: 'Not a Node', isCorrect: false }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: jsTopic.id,
      text: '¿Qué es el Event Loop?',
      type: 'single',
      answers: {
        create: [
          { text: 'Mecanismo que maneja la ejecución de código asíncrono', isCorrect: true },
          { text: 'Un bucle infinito', isCorrect: false },
          { text: 'Una función recursiva', isCorrect: false },
          { text: 'Un tipo de evento DOM', isCorrect: false }
        ]
      }
    }
  });

  // Preguntas de HTML y CSS (15 preguntas)
  await prisma.question.create({
    data: {
      topicId: htmlTopic.id,
      text: '¿Qué etiqueta HTML5 define un encabezado?',
      type: 'single',
      answers: {
        create: [
          { text: '<header>', isCorrect: true },
          { text: '<head>', isCorrect: false },
          { text: '<h1>', isCorrect: false },
          { text: '<top>', isCorrect: false }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: htmlTopic.id,
      text: '¿Cuáles son etiquetas semánticas de HTML5?',
      type: 'multiple',
      answers: {
        create: [
          { text: '<article>', isCorrect: true },
          { text: '<section>', isCorrect: true },
          { text: '<nav>', isCorrect: true },
          { text: '<div>', isCorrect: false },
          { text: '<aside>', isCorrect: true }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: htmlTopic.id,
      text: '¿Qué propiedad CSS centra horizontalmente un elemento de bloque?',
      type: 'single',
      answers: {
        create: [
          { text: 'margin: 0 auto', isCorrect: true },
          { text: 'text-align: center', isCorrect: false },
          { text: 'align: center', isCorrect: false },
          { text: 'center: true', isCorrect: false }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: htmlTopic.id,
      text: '¿Qué es Flexbox?',
      type: 'single',
      answers: {
        create: [
          { text: 'Un modelo de layout unidimensional para CSS', isCorrect: true },
          { text: 'Una librería de JavaScript', isCorrect: false },
          { text: 'Un framework de componentes', isCorrect: false },
          { text: 'Un preprocesador CSS', isCorrect: false }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: htmlTopic.id,
      text: '¿Cuáles son unidades de medida en CSS?',
      type: 'multiple',
      answers: {
        create: [
          { text: 'px', isCorrect: true },
          { text: 'em', isCorrect: true },
          { text: 'rem', isCorrect: true },
          { text: '%', isCorrect: true },
          { text: 'pt', isCorrect: false }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: htmlTopic.id,
      text: '¿Qué hace z-index en CSS?',
      type: 'single',
      answers: {
        create: [
          { text: 'Controla el orden de apilamiento de elementos', isCorrect: true },
          { text: 'Define la posición horizontal', isCorrect: false },
          { text: 'Establece el zoom', isCorrect: false },
          { text: 'Controla la transparencia', isCorrect: false }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: htmlTopic.id,
      text: '¿Qué es el box model en CSS?',
      type: 'single',
      answers: {
        create: [
          { text: 'Un modelo que define cómo se calculan las dimensiones de los elementos', isCorrect: true },
          { text: 'Un contenedor flexible', isCorrect: false },
          { text: 'Una clase CSS predefinida', isCorrect: false },
          { text: 'Un tipo de layout grid', isCorrect: false }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: htmlTopic.id,
      text: '¿Cuáles son tipos de posicionamiento CSS?',
      type: 'multiple',
      answers: {
        create: [
          { text: 'static', isCorrect: true },
          { text: 'relative', isCorrect: true },
          { text: 'absolute', isCorrect: true },
          { text: 'fixed', isCorrect: true },
          { text: 'centered', isCorrect: false }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: htmlTopic.id,
      text: '¿Qué propiedad CSS crea sombras en texto?',
      type: 'single',
      answers: {
        create: [
          { text: 'text-shadow', isCorrect: true },
          { text: 'box-shadow', isCorrect: false },
          { text: 'shadow', isCorrect: false },
          { text: 'font-shadow', isCorrect: false }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: htmlTopic.id,
      text: '¿Qué es un media query?',
      type: 'single',
      answers: {
        create: [
          { text: 'Una técnica para aplicar estilos según características del dispositivo', isCorrect: true },
          { text: 'Una consulta a una base de datos', isCorrect: false },
          { text: 'Un selector CSS avanzado', isCorrect: false },
          { text: 'Una función de JavaScript', isCorrect: false }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: htmlTopic.id,
      text: '¿Qué propiedad CSS Grid define columnas?',
      type: 'single',
      answers: {
        create: [
          { text: 'grid-template-columns', isCorrect: true },
          { text: 'grid-columns', isCorrect: false },
          { text: 'columns', isCorrect: false },
          { text: 'column-template', isCorrect: false }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: htmlTopic.id,
      text: '¿Cuáles son pseudo-clases válidas en CSS?',
      type: 'multiple',
      answers: {
        create: [
          { text: ':hover', isCorrect: true },
          { text: ':active', isCorrect: true },
          { text: ':focus', isCorrect: true },
          { text: ':selected', isCorrect: false },
          { text: ':first-child', isCorrect: true }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: htmlTopic.id,
      text: '¿Qué hace display: none?',
      type: 'single',
      answers: {
        create: [
          { text: 'Oculta el elemento y no ocupa espacio', isCorrect: true },
          { text: 'Hace el elemento transparente', isCorrect: false },
          { text: 'Reduce el tamaño a cero', isCorrect: false },
          { text: 'Mueve el elemento fuera de la pantalla', isCorrect: false }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: htmlTopic.id,
      text: '¿Qué es specificity en CSS?',
      type: 'single',
      answers: {
        create: [
          { text: 'El peso que determina qué estilos se aplican cuando hay conflictos', isCorrect: true },
          { text: 'Una propiedad para selector específico', isCorrect: false },
          { text: 'Un tipo de animación', isCorrect: false },
          { text: 'Una medida de rendimiento', isCorrect: false }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: htmlTopic.id,
      text: '¿Qué atributo HTML hace que un input sea obligatorio?',
      type: 'single',
      answers: {
        create: [
          { text: 'required', isCorrect: true },
          { text: 'mandatory', isCorrect: false },
          { text: 'validate', isCorrect: false },
          { text: 'needed', isCorrect: false }
        ]
      }
    }
  });

  // Preguntas de Node.js (10 preguntas)
  await prisma.question.create({
    data: {
      topicId: nodeTopic.id,
      text: '¿Qué es Node.js?',
      type: 'single',
      answers: {
        create: [
          { text: 'Un entorno de ejecución de JavaScript del lado del servidor', isCorrect: true },
          { text: 'Un framework frontend', isCorrect: false },
          { text: 'Una base de datos', isCorrect: false },
          { text: 'Un lenguaje de programación', isCorrect: false }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: nodeTopic.id,
      text: '¿Cuáles son módulos core de Node.js?',
      type: 'multiple',
      answers: {
        create: [
          { text: 'fs', isCorrect: true },
          { text: 'http', isCorrect: true },
          { text: 'path', isCorrect: true },
          { text: 'express', isCorrect: false },
          { text: 'events', isCorrect: true }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: nodeTopic.id,
      text: '¿Qué comando instala dependencias en Node.js?',
      type: 'single',
      answers: {
        create: [
          { text: 'npm install', isCorrect: true },
          { text: 'node install', isCorrect: false },
          { text: 'npm get', isCorrect: false },
          { text: 'node modules', isCorrect: false }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: nodeTopic.id,
      text: '¿Qué es Express.js?',
      type: 'single',
      answers: {
        create: [
          { text: 'Un framework web minimalista para Node.js', isCorrect: true },
          { text: 'Un gestor de paquetes', isCorrect: false },
          { text: 'Una base de datos', isCorrect: false },
          { text: 'Un motor de plantillas', isCorrect: false }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: nodeTopic.id,
      text: '¿Qué hace process.env en Node.js?',
      type: 'single',
      answers: {
        create: [
          { text: 'Accede a las variables de entorno', isCorrect: true },
          { text: 'Procesa archivos', isCorrect: false },
          { text: 'Envía datos al cliente', isCorrect: false },
          { text: 'Maneja errores', isCorrect: false }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: nodeTopic.id,
      text: '¿Cuáles son métodos HTTP comunes?',
      type: 'multiple',
      answers: {
        create: [
          { text: 'GET', isCorrect: true },
          { text: 'POST', isCorrect: true },
          { text: 'PUT', isCorrect: true },
          { text: 'DELETE', isCorrect: true },
          { text: 'SEND', isCorrect: false }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: nodeTopic.id,
      text: '¿Qué es middleware en Express?',
      type: 'single',
      answers: {
        create: [
          { text: 'Funciones que tienen acceso al request, response y next', isCorrect: true },
          { text: 'Una capa de seguridad', isCorrect: false },
          { text: 'Un tipo de base de datos', isCorrect: false },
          { text: 'Un gestor de rutas', isCorrect: false }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: nodeTopic.id,
      text: '¿Qué hace require() en Node.js?',
      type: 'single',
      answers: {
        create: [
          { text: 'Importa módulos', isCorrect: true },
          { text: 'Define variables requeridas', isCorrect: false },
          { text: 'Valida datos obligatorios', isCorrect: false },
          { text: 'Solicita permisos', isCorrect: false }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: nodeTopic.id,
      text: '¿Qué es package.json?',
      type: 'single',
      answers: {
        create: [
          { text: 'Archivo de configuración que contiene metadatos del proyecto', isCorrect: true },
          { text: 'Una base de datos JSON', isCorrect: false },
          { text: 'Un archivo de rutas', isCorrect: false },
          { text: 'Un módulo de Node.js', isCorrect: false }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: nodeTopic.id,
      text: '¿Cuáles son gestores de paquetes para Node.js?',
      type: 'multiple',
      answers: {
        create: [
          { text: 'npm', isCorrect: true },
          { text: 'yarn', isCorrect: true },
          { text: 'pnpm', isCorrect: true },
          { text: 'pip', isCorrect: false },
          { text: 'composer', isCorrect: false }
        ]
      }
    }
  });

  // Preguntas de Bases de Datos (10 preguntas)
  await prisma.question.create({
    data: {
      topicId: dbTopic.id,
      text: '¿Qué significa SQL?',
      type: 'single',
      answers: {
        create: [
          { text: 'Structured Query Language', isCorrect: true },
          { text: 'Simple Query Language', isCorrect: false },
          { text: 'Standard Question Language', isCorrect: false },
          { text: 'System Query List', isCorrect: false }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: dbTopic.id,
      text: '¿Cuáles son tipos de bases de datos?',
      type: 'multiple',
      answers: {
        create: [
          { text: 'Relacionales (SQL)', isCorrect: true },
          { text: 'NoSQL', isCorrect: true },
          { text: 'Documentales', isCorrect: true },
          { text: 'Gráficas', isCorrect: true },
          { text: 'Lineales', isCorrect: false }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: dbTopic.id,
      text: '¿Qué comando SQL se usa para obtener datos?',
      type: 'single',
      answers: {
        create: [
          { text: 'SELECT', isCorrect: true },
          { text: 'GET', isCorrect: false },
          { text: 'FETCH', isCorrect: false },
          { text: 'RETRIEVE', isCorrect: false }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: dbTopic.id,
      text: '¿Qué es una PRIMARY KEY?',
      type: 'single',
      answers: {
        create: [
          { text: 'Un identificador único para cada registro en una tabla', isCorrect: true },
          { text: 'La primera columna de una tabla', isCorrect: false },
          { text: 'Una contraseña de acceso', isCorrect: false },
          { text: 'Un índice secundario', isCorrect: false }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: dbTopic.id,
      text: '¿Cuáles son comandos DML en SQL?',
      type: 'multiple',
      answers: {
        create: [
          { text: 'SELECT', isCorrect: true },
          { text: 'INSERT', isCorrect: true },
          { text: 'UPDATE', isCorrect: true },
          { text: 'DELETE', isCorrect: true },
          { text: 'CREATE', isCorrect: false }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: dbTopic.id,
      text: '¿Qué es un JOIN en SQL?',
      type: 'single',
      answers: {
        create: [
          { text: 'Una operación para combinar filas de dos o más tablas', isCorrect: true },
          { text: 'Una función para concatenar strings', isCorrect: false },
          { text: 'Un tipo de índice', isCorrect: false },
          { text: 'Una restricción de integridad', isCorrect: false }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: dbTopic.id,
      text: '¿Qué es MongoDB?',
      type: 'single',
      answers: {
        create: [
          { text: 'Una base de datos NoSQL orientada a documentos', isCorrect: true },
          { text: 'Una base de datos relacional', isCorrect: false },
          { text: 'Un ORM para Node.js', isCorrect: false },
          { text: 'Un lenguaje de consulta', isCorrect: false }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: dbTopic.id,
      text: '¿Cuáles son propiedades ACID en bases de datos?',
      type: 'multiple',
      answers: {
        create: [
          { text: 'Atomicity', isCorrect: true },
          { text: 'Consistency', isCorrect: true },
          { text: 'Isolation', isCorrect: true },
          { text: 'Durability', isCorrect: true },
          { text: 'Availability', isCorrect: false }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: dbTopic.id,
      text: '¿Qué es un índice en una base de datos?',
      type: 'single',
      answers: {
        create: [
          { text: 'Una estructura que mejora la velocidad de búsqueda', isCorrect: true },
          { text: 'La posición de un registro', isCorrect: false },
          { text: 'Un tipo de clave foránea', isCorrect: false },
          { text: 'Una tabla temporal', isCorrect: false }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      topicId: dbTopic.id,
      text: '¿Qué hace la cláusula WHERE en SQL?',
      type: 'single',
      answers: {
        create: [
          { text: 'Filtra los registros según una condición', isCorrect: true },
          { text: 'Define el origen de los datos', isCorrect: false },
          { text: 'Ordena los resultados', isCorrect: false },
          { text: 'Agrupa los datos', isCorrect: false }
        ]
      }
    }
  });

  console.log('✅ Preguntas adicionales creadas');

  console.log('');
  console.log('🎉 Seed completado exitosamente!');
  console.log('');
  console.log('📚 Temas creados:');
  console.log(`   - ${jsTopic.name} (${jsTopic.slug}) - 15 preguntas`);
  console.log(`   - ${reactTopic.name} (${reactTopic.slug}) - 4 preguntas`);
  console.log(`   - ${htmlTopic.name} (${htmlTopic.slug}) - 15 preguntas`);
  console.log(`   - ${nodeTopic.name} (${nodeTopic.slug}) - 10 preguntas`);
  console.log(`   - ${dbTopic.name} (${dbTopic.slug}) - 10 preguntas`);
  console.log(`   📊 Total: 54 preguntas`);
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
