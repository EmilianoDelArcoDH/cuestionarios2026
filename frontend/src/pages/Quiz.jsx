import { useState, useEffect, useRef } from 'react';
import { usePgEvent } from '../hook/usePgEvent';
import { useParams } from 'react-router-dom';
import { getQuiz } from '../services/api';
import styles from './Quiz.module.css';

function formatQuizTitle(name) {
  if (!name) return '';

  const hasBracketPrefix = /^\s*\[[^\]]+\]/.test(name);
  if (!hasBracketPrefix) return name.trim();

  const withoutBracket = name.replace(/^\s*\[[^\]]+\]\s*/, '');
  const dashIndex = withoutBracket.indexOf(' - ');

  if (dashIndex === -1) {
    return withoutBracket.trim();
  }

  return withoutBracket.slice(dashIndex + 3).trim();
}

export default function Quiz() {
  const { postEvent, waitForMessage } = usePgEvent();
  const [restored, setRestored] = useState(false);
  const restoredState = useRef(null);
  const { topicId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState(null);

  const displayTitle = formatQuizTitle(quiz?.topic?.name);


  // Restaurar estado desde PGEvent si existe
  useEffect(() => {
    let isMounted = true;
    (async () => {
      // Espera mensaje inicial (si lo hay)
      const pgState = await waitForMessage(1000);
      console.log('[PGEvent] Estado recibido al iniciar actividad:', pgState);
      if (pgState && isMounted) {
        try {
          const parsed = JSON.parse(pgState);
          if (parsed?.data) {
            restoredState.current = parsed.data;
          }
        } catch {}
      }
      setRestored(true);
    })();
    return () => { isMounted = false; };
  }, [topicId]);

  useEffect(() => {
    if (restored) {
      loadQuiz();
    }
    // eslint-disable-next-line
  }, [restored, topicId]);

  // Agregar event listener para clicks en imágenes
  useEffect(() => {
    const handleImageClick = (e) => {
      if (e.target.tagName === 'IMG' && e.target.closest(`.${styles.questionText}, .${styles.answerOption}`)) {
        e.preventDefault();
        setLightboxImage(e.target.src);
      }
    };

    document.addEventListener('click', handleImageClick);
    return () => document.removeEventListener('click', handleImageClick);
  }, []);

  function closeLightbox() {
    setLightboxImage(null);
  }

  async function loadQuiz() {
    try {
      setLoading(true);
      setError('');
      const data = await getQuiz(topicId);
      setQuiz(data);

      // Restaurar respuestas y resultado si hay state previo
      if (restoredState.current && restoredState.current.topicId === topicId) {
        // Restaurar respuestas
        if (restoredState.current.answers) {
          setAnswers(restoredState.current.answers);
        } else {
          // Inicializar si no hay respuestas
          const initialAnswers = {};
          data.questions.forEach(q => {
            initialAnswers[q.id] = [];
          });
          setAnswers(initialAnswers);
        }
        // Restaurar resultado si ya completó
        if (typeof restoredState.current.passed === 'boolean') {
          setResult({
            score_percent: restoredState.current.score_percent,
            attempt_number: restoredState.current.attempt_number,
            remaining_attempts: restoredState.current.remaining_attempts,
            passed: restoredState.current.passed,
            // ...puedes agregar más campos si necesitas
          });
        }
      } else {
        // Inicializar estado de respuestas
        const initialAnswers = {};
        data.questions.forEach(q => {
          initialAnswers[q.id] = [];
        });
        setAnswers(initialAnswers);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleAnswerChange(questionId, answerId, questionType) {
    setAnswers(prev => {
      if (questionType === 'single') {
        // Para single choice, reemplazar con la nueva selección
        return {
          ...prev,
          [questionId]: [answerId]
        };
      } else {
        // Para multiple choice, toggle
        const current = prev[questionId] || [];
        if (current.includes(answerId)) {
          return {
            ...prev,
            [questionId]: current.filter(id => id !== answerId)
          };
        } else {
          return {
            ...prev,
            [questionId]: [...current, answerId]
          };
        }
      }
    });
  }

  // Nueva lógica: intentos solo con PGEvent
  async function handleSubmit(e) {
    e.preventDefault();

    // Validar que todas las preguntas tengan respuesta
    const unanswered = quiz.questions.filter(q => !answers[q.id] || answers[q.id].length === 0);
    if (unanswered.length > 0) {
      setError(`Debes responder todas las preguntas (${unanswered.length} sin responder)`);
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      // Calcular intento actual
      let attempt_number = 1;
      if (restoredState.current && restoredState.current.attempt_number) {
        attempt_number = restoredState.current.attempt_number + 1;
      }

      // Evaluar respuestas
      let correctCount = 0;
      quiz.questions.forEach(q => {
        const correctIds = q.answers.filter(a => a.isCorrect).map(a => a.id);
        const userIds = answers[q.id] || [];
        // Para preguntas simples (single): debe haber solo una respuesta y debe ser correcta
        if (q.type === 'single') {
          if (
            userIds.length === 1 &&
            correctIds.includes(userIds[0])
          ) {
            correctCount++;
          }
        } else if (q.type === 'multiple') {
          // Para preguntas múltiples: todas las respuestas correctas deben estar seleccionadas y no debe haber extras
          const isAllCorrect =
            userIds.length === correctIds.length &&
            userIds.every(id => correctIds.includes(id)) &&
            correctIds.every(id => userIds.includes(id));
          if (isAllCorrect) {
            correctCount++;
          }
        }
      });
      const score_percent = Number(((correctCount / quiz.questions.length) * 100).toFixed(2));
      const passed = score_percent >= 70;
      const maxAttempts = 3;
      const remaining_attempts = passed ? 0 : Math.max(0, maxAttempts - attempt_number);

      const resultData = {
        score_percent,
        attempt_number,
        remaining_attempts,
        passed,
      };
      setResult(resultData);
      setCurrentQuestionIndex(0);

      // Evento PG
      const stateToPost = {
        ...resultData,
        topicId,
        answers,
        quizId: quiz?.id,
        questions: quiz?.questions?.map(q => ({ id: q.id, type: q.type })),
      };
      if (passed) {
        postEvent(
          "SUCCESS",
          "Has completado el ejercicio",
          [],
          stateToPost
        );
      } else {
        let reasons = [];
        let message = "";
        if (remaining_attempts === 0) {
          reasons = ["Lo sentimos no hay más intentos"];
          message = "El ejercicio está incompleto y no quedan más intentos";
        } else {
          reasons = [
            `Revisa tus respuestas - te quedan ${remaining_attempts} intento${remaining_attempts > 1 ? 's' : ''}`
          ];
          message = "El ejercicio está incompleto";
        }
        postEvent(
          "FAILURE",
          message,
          reasons,
          stateToPost
        );
      }
    } catch (err) {
      setError('Error al procesar el intento');
    } finally {
      setSubmitting(false);
    }
  }

  function handleRetry() {
    // Descuenta el intento manualmente
    let attempt_number = 1;
    if (restoredState.current && restoredState.current.attempt_number) {
      attempt_number = restoredState.current.attempt_number + 1;
    }
    setResult(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
    // Actualiza el estado de pgEvent para reflejar el nuevo intento
    postEvent(
      "FAILURE",
      "Intento manual descontado",
      [],
      {
        attempt_number,
        answers: {},
        topicId,
        quizId: quiz?.id,
        questions: quiz?.questions?.map(q => ({ id: q.id, type: q.type }))
      }
    );
    loadQuiz();
  }

  function handleNext() {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setError('');
    }
  }

  function handlePrevious() {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setError('');
    }
  }

  if (loading) {
    return <div className="loading">Cargando cuestionario...</div>;
  }

  if (error && !quiz) {
    return (
      <div className={styles.quiz}>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  // Mostrar resultados
  if (result) {
    return (
      <div className={styles.quiz}>
        <div className={styles.results}>
          <h3>{displayTitle}</h3>
          
          <div className={`${styles.scoreDisplay} ${result.passed ? styles.passed : styles.failed}`}>
            {result.score_percent}%
          </div>

          <div className={`${styles.resultBadge} ${result.passed ? styles.passed : styles.failed}`}>
            {result.passed ? '✓ APROBADO' : '✗ NO APROBADO'}
          </div>

          {/* Solo mostrar info de intentos si NO está aprobado */}
          {!result.passed && (
            <div className={styles.attemptsInfo}>
              Intento {result.attempt_number} de 3<br />
              {result.remaining_attempts > 0 
                ? `Te quedan ${result.remaining_attempts} intento${result.remaining_attempts > 1 ? 's' : ''}`
                : 'No te quedan más intentos'
              }
            </div>
          )}

          {result.passed && (
            <div className="success-message">
              ¡Felicitaciones! Has aprobado el cuestionario con {result.score_percent}%
            </div>
          )}

          {!result.passed && result.remaining_attempts > 0 && (
            <div className="error-message">
              Necesitas al menos 70% para aprobar. ¡Inténtalo nuevamente!
            </div>
          )}

          {!result.passed && result.remaining_attempts === 0 && (
            <div className="error-message">
              No has aprobado y ya no tienes más intentos disponibles.
            </div>
          )}

          <div className={styles.resultsActions}>
            {/* Solo mostrar botón de reintentar si NO está aprobado */}
            {!result.passed && result.remaining_attempts > 0 && (
              <button onClick={handleRetry} className={styles.retryButton}>
                🔄 Intentar de Nuevo
              </button>
            )}
            {/* Botón de reset solo si no hay más intentos */}
            {!result.passed && result.remaining_attempts === 0 && (
              <button
                onClick={() => {
                  setResult(null);
                  setAnswers({});
                  setCurrentQuestionIndex(0);
                  // Enviar evento PGEvent de reset (state vacío)
                  postEvent(
                    "FAILURE",
                    "Reinicio manual de la actividad",
                    [],
                    {} // state vacío
                  );
                  loadQuiz();
                }}
                className={styles.retryButton}
              >
                🧹 Reiniciar Actividad
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Mostrar cuestionario
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const totalQuestions = quiz.questions.length;
  const currentNumber = currentQuestionIndex + 1;

  return (
    <div className={styles.quiz}>
      <div className={styles.quizHeader}>
        <h2>{displayTitle}</h2>
        <p className={styles.questionCounter}>
          Pregunta {currentNumber} de {totalQuestions}
        </p>
      </div>

      {/* Indicador de Progreso */}
      <div className={styles.progressText}>
        <span>{Object.values(answers).filter(a => a.length > 0).length}</span> de {totalQuestions} preguntas respondidas
      </div>
      <div className={styles.progressContainer}>
        <div 
          className={styles.progressBar}
          style={{ 
            width: `${(Object.values(answers).filter(a => a.length > 0).length / totalQuestions) * 100}%` 
          }}
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className={styles.questionCard}>
          <div className={styles.questionHeader}>
            <span className={styles.questionNumber}>
              Pregunta {currentNumber}
            </span>
            <span className={styles.questionType}>
              {currentQuestion.type === 'single' ? '⚪ Única' : '☑️ Múltiple'}
            </span>
          </div>

          <div 
            className={styles.questionText}
            dangerouslySetInnerHTML={{ __html: currentQuestion.text }}
          />

          <ul className={styles.answersList}>
            {currentQuestion.answers.map((answer) => (
              <li key={answer.id} className={styles.answerOption}>
                <input
                  type={currentQuestion.type === 'single' ? 'radio' : 'checkbox'}
                  id={`answer-${answer.id}`}
                  name={`question-${currentQuestion.id}`}
                  checked={answers[currentQuestion.id]?.includes(answer.id) || false}
                  onChange={() => handleAnswerChange(currentQuestion.id, answer.id, currentQuestion.type)}
                  disabled={submitting}
                />
                <label 
                  htmlFor={`answer-${answer.id}`}
                  dangerouslySetInnerHTML={{ __html: answer.text }}
                />
              </li>
            ))}
          </ul>
        </div>

        {/* Navegación */}
        <div className={styles.navigationButtons}>
          <button
            type="button"
            onClick={handlePrevious}
            disabled={isFirstQuestion}
            className={`${styles.navButton} ${styles.previousButton}`}
          >
            ← Anterior
          </button>

          {!isLastQuestion ? (
            <button
              type="button"
              onClick={handleNext}
              className={`${styles.navButton} ${styles.nextButton}`}
            >
              Siguiente →
            </button>
          ) : (
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={submitting}
            >
              {submitting ? 'Enviando...' : 'Enviar Respuestas'}
            </button>
          )}
        </div>
      </form>

      {/* Lightbox para ampliar imágenes */}
      {lightboxImage && (
        <div className={styles.lightbox} onClick={closeLightbox}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.lightboxClose} onClick={closeLightbox}>
              ✕
            </button>
            <img src={lightboxImage} alt="Imagen ampliada" />
          </div>
        </div>
      )}
    </div>
  );
}
