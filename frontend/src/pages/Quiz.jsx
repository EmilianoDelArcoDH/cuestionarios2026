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

  if (dashIndex === -1) return withoutBracket.trim();

  return withoutBracket.slice(dashIndex + 3).trim();
}

function normalizeText(value) {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function isSelfAssessmentQuiz(name) {
  return normalizeText(name).includes('autoevaluacion');
}

function buildInitialAnswers(quizData) {
  const initialAnswers = {};
  if (!quizData?.questions) return initialAnswers;

  quizData.questions.forEach((q) => {
    initialAnswers[q.id] = [];
  });

  return initialAnswers;
}

function buildReviewData(quizData, userAnswers) {
  if (!quizData?.questions?.length) return [];

  return quizData.questions.map((question, index) => {
    const selectedIds = (userAnswers[question.id] || []).map((id) => String(id));

    const reviewedAnswers = question.answers.map((answer) => {
      const answerId = String(answer.id);
      const isSelected = selectedIds.includes(answerId);
      const isCorrect = answer.isCorrect === true;

      let status = 'neutral';

      if (isCorrect && isSelected) status = 'correctSelected';
      if (isCorrect && !isSelected) status = 'correctMissing';
      if (!isCorrect && isSelected) status = 'incorrectSelected';

      return {
        id: answer.id,
        text: answer.text,
        isSelected,
        isCorrect,
        status,
      };
    });

    const isQuestionCorrect = reviewedAnswers.every((answer) =>
      answer.isCorrect ? answer.isSelected : !answer.isSelected
    );

    const visibleAnswers = isQuestionCorrect
      ? reviewedAnswers
      : reviewedAnswers.filter((answer) => answer.isSelected);

    return {
      id: question.id,
      index: index + 1,
      text: question.text,
      isQuestionCorrect,
      answers: visibleAnswers,
    };
  });
}

export default function Quiz() {
  const { postEvent, waitForMessage } = usePgEvent();
  const { topicId } = useParams();

  const [restored, setRestored] = useState(false);
  const restoredState = useRef(null);

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [review, setReview] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState(null);

  const displayTitle = formatQuizTitle(quiz?.topic?.name);
  const selfAssessment =
    isSelfAssessmentQuiz(quiz?.topic?.name) || isSelfAssessmentQuiz(displayTitle);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const pgState = await waitForMessage(3000);

      if (pgState && isMounted) {
        try {
          const parsed = JSON.parse(pgState);
          if (parsed?.data) {
            restoredState.current = parsed.data;
          }
        } catch (err) {
          console.warn('[PGEvent] No se pudo parsear el estado inicial:', err);
        }
      }

      if (isMounted) setRestored(true);
    })();

    return () => {
      isMounted = false;
    };
  }, [topicId, waitForMessage]);

  useEffect(() => {
    if (restored) {
      loadQuiz();
    }
  }, [restored, topicId]);

  useEffect(() => {
    const handleImageClick = (e) => {
      if (
        e.target.tagName === 'IMG' &&
        e.target.closest(`.${styles.questionText}, .${styles.answerOption}`)
      ) {
        e.preventDefault();
        setLightboxImage(e.target.src);
      }
    };

    document.addEventListener('click', handleImageClick);
    return () => document.removeEventListener('click', handleImageClick);
  }, [styles.questionText, styles.answerOption]);

  function closeLightbox() {
    setLightboxImage(null);
  }

  async function loadQuiz() {
    try {
      setLoading(true);
      setError('');

      const data = await getQuiz(topicId);
      setQuiz(data);

      const initialAnswers = buildInitialAnswers(data);

      if (restoredState.current && restoredState.current.topicId === topicId) {
        setAnswers(restoredState.current.answers || initialAnswers);

        if (typeof restoredState.current.passed === 'boolean') {
          setReview(buildReviewData(data, restoredState.current.answers || initialAnswers));
          setResult({
            score_percent: restoredState.current.score_percent,
            attempt_number: restoredState.current.attempt_number,
            remaining_attempts: restoredState.current.remaining_attempts,
            passed: restoredState.current.passed,
            is_self_assessment:
              restoredState.current.is_self_assessment ?? isSelfAssessmentQuiz(data?.topic?.name),
          });
        } else {
          setResult(null);
          setReview([]);
        }
      } else {
        setAnswers(initialAnswers);
        setResult(null);
        setReview([]);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar el cuestionario');
    } finally {
      setLoading(false);
    }
  }

  function handleAnswerChange(questionId, answerId, questionType) {
    const normalizedAnswerId = String(answerId);

    setAnswers((prev) => {
      if (questionType === 'single') {
        return {
          ...prev,
          [questionId]: [normalizedAnswerId],
        };
      }

      const current = (prev[questionId] || []).map((id) => String(id));

      if (current.includes(normalizedAnswerId)) {
        return {
          ...prev,
          [questionId]: current.filter((id) => id !== normalizedAnswerId),
        };
      }

      return {
        ...prev,
        [questionId]: [...current, normalizedAnswerId],
      };
    });
  }

  function evaluateQuiz() {
    let totalScore = 0;

    quiz.questions.forEach((q) => {
      const correctIds = q.answers
        .filter((a) => a.isCorrect === true)
        .map((a) => String(a.id));

      const incorrectIds = q.answers
        .filter((a) => a.isCorrect !== true)
        .map((a) => String(a.id));

      const userIds = (answers[q.id] || []).map((id) => String(id));

      if (q.type === 'single') {
        const isCorrect =
          userIds.length === 1 &&
          correctIds.length === 1 &&
          userIds[0] === correctIds[0];

        if (isCorrect) {
          totalScore += 1;
        }
      } else if (q.type === 'multiple') {
        if (correctIds.length === 0) return;

        const selectedCorrect = userIds.filter((id) => correctIds.includes(id)).length;
        const selectedIncorrect = userIds.filter((id) => incorrectIds.includes(id)).length;

        let questionScore = (selectedCorrect - selectedIncorrect) / correctIds.length;
        questionScore = Math.max(0, Math.min(1, questionScore));

        totalScore += questionScore;
      }
    });

    return totalScore;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!quiz?.questions?.length) {
      setError('No hay preguntas disponibles para responder');
      return;
    }

    const unanswered = quiz.questions.filter(
      (q) => !answers[q.id] || answers[q.id].length === 0
    );

    if (unanswered.length > 0) {
      setError(`Debes responder todas las preguntas (${unanswered.length} sin responder)`);
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const previousAttemptNumber = restoredState.current?.attempt_number || 0;
      const attempt_number = previousAttemptNumber + 1;

      const totalScore = evaluateQuiz();
      const score_percent = Number(((totalScore / quiz.questions.length) * 100).toFixed(2));

      const passed = score_percent >= 70;
      const maxAttempts = selfAssessment ? 1 : 3;
      const remaining_attempts = Math.max(0, maxAttempts - attempt_number);

      const resultData = {
        score_percent,
        attempt_number,
        remaining_attempts,
        passed,
        is_self_assessment: selfAssessment,
      };
      const reviewData = buildReviewData(quiz, answers);

      const stateToPost = {
        ...resultData,
        topicId,
        answers,
        quizId: quiz?.id,
        questions: quiz?.questions?.map((q) => ({
          id: q.id,
          type: q.type,
        })),
        is_self_assessment: selfAssessment,
      };

      setResult(resultData);
      setReview(reviewData);
      setCurrentQuestionIndex(0);
      restoredState.current = stateToPost;

      if (selfAssessment) {
        postEvent(
          'SUCCESS',
          'Has completado la autoevaluación',
          [],
          stateToPost
        );
      } else if (passed) {
        postEvent(
          'SUCCESS',
          'Has completado el ejercicio',
          [],
          stateToPost
        );
      } else {
        const noMoreAttempts = remaining_attempts === 0;

        postEvent(
          'FAILURE',
          noMoreAttempts
            ? 'El ejercicio está incompleto y no quedan más intentos'
            : 'El ejercicio está incompleto',
          noMoreAttempts
            ? ['Lo sentimos no hay más intentos']
            : [
              `Revisa tus respuestas - te quedan ${remaining_attempts} intento${remaining_attempts > 1 ? 's' : ''}`,
            ],
          stateToPost
        );
      }
    } catch (err) {
      console.error(err);
      setError('Error al procesar el intento');
    } finally {
      setSubmitting(false);
    }
  }

  function handleRetry() {
    if (!quiz) return;

    const initialAnswers = buildInitialAnswers(quiz);
    const currentAttemptNumber = restoredState.current?.attempt_number || 0;
    const currentRemainingAttempts =
      typeof restoredState.current?.remaining_attempts === 'number'
        ? restoredState.current.remaining_attempts
        : selfAssessment ? 1 : 3;

    const nextState = {
      topicId,
      quizId: quiz?.id,
      answers: initialAnswers,
      attempt_number: currentAttemptNumber,
      remaining_attempts: currentRemainingAttempts,
      passed: false,
      questions: quiz?.questions?.map((q) => ({
        id: q.id,
        type: q.type,
      })),
      is_self_assessment: selfAssessment,
    };

    setResult(null);
    setReview([]);
    setAnswers(initialAnswers);
    setCurrentQuestionIndex(0);
    setError('');

    restoredState.current = nextState;

    postEvent(
      'FAILURE',
      selfAssessment ? 'Autoevaluación reiniciada' : 'Reintento iniciado',
      [],
      nextState
    );
  }

  function handleResetActivity() {
    if (!quiz) return;

    const initialAnswers = buildInitialAnswers(quiz);

    setResult(null);
    setReview([]);
    setAnswers(initialAnswers);
    setCurrentQuestionIndex(0);
    setError('');

    restoredState.current = {
      topicId,
      quizId: quiz?.id,
      answers: initialAnswers,
      attempt_number: 0,
      remaining_attempts: selfAssessment ? 1 : 3,
      passed: false,
      questions: quiz?.questions?.map((q) => ({
        id: q.id,
        type: q.type,
      })),
      is_self_assessment: selfAssessment,
    };

    postEvent(
      'FAILURE',
      'Reinicio manual de la actividad',
      [],
      restoredState.current
    );
  }

  function handleNext() {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setError('');
    }
  }

  function handlePrevious() {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
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

  if (result) {
    return (
      <div className={styles.quiz}>
        <div className={styles.results}>
          <h3>{displayTitle}</h3>

          <div
            className={`${styles.scoreDisplay} ${(result.is_self_assessment || result.passed)
              ? styles.passed
              : styles.failed}`}
          >
            {result.score_percent}%
          </div>

          {!result.is_self_assessment && (
            <div
              className={`${styles.resultBadge} ${result.passed ? styles.passed : styles.failed}`}
            >
              {result.passed ? '✓ APROBADO' : '✗ NO APROBADO'}
            </div>
          )}

          {result.is_self_assessment && (
            <div className={styles.attemptsInfo}>
              Intento {result.attempt_number} de 1
            </div>
          )}

          {!result.is_self_assessment && !result.passed && (
            <div className={styles.attemptsInfo}>
              Intento {result.attempt_number} de 3
              <br />
              {result.remaining_attempts > 0
                ? `Te quedan ${result.remaining_attempts} intento${result.remaining_attempts > 1 ? 's' : ''}`
                : 'No te quedan más intentos'}
            </div>
          )}

          {!result.is_self_assessment && result.passed && (
            <div className="success-message">
              ¡Felicitaciones! Has aprobado el cuestionario con {result.score_percent}%
            </div>
          )}

          {!result.is_self_assessment && !result.passed && result.remaining_attempts > 0 && (
            <div className="error-message">
              En este caso el porcentaje de aprobación del 70% no fue alcanzado, te recomendamos que si tenes dudas vuelvas a revisar el contenido e intentes nuevamente.
            </div>
          )}

          {!result.is_self_assessment && !result.passed && result.remaining_attempts === 0 && (
            <div className="error-message">
              No has aprobado y ya no tienes más intentos disponibles.
            </div>
          )}

          <div className={styles.resultsActions}>
            {!result.is_self_assessment && !result.passed && result.remaining_attempts > 0 && (
              <button onClick={handleRetry} className={styles.retryButton}>
                Intentar de Nuevo
              </button>
            )}
          </div>

          {review.length > 0 && (
            <div className={styles.reviewSection}>
              <h4>Revision de respuestas</h4>

              <div className={styles.reviewList}>
                {review.map((question) => (
                  <section key={question.id} className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <span className={styles.reviewQuestionNumber}>
                        Pregunta {question.index}
                      </span>
                      <span
                        className={`${styles.reviewQuestionStatus} ${
                          question.isQuestionCorrect ? styles.reviewOk : styles.reviewBad
                        }`}
                      >
                        {question.isQuestionCorrect ? 'Correcta' : 'Incorrecta'}
                      </span>
                    </div>

                    <div
                      className={styles.reviewQuestionText}
                      dangerouslySetInnerHTML={{ __html: question.text }}
                    />

                    <ul className={styles.reviewAnswers}>
                      {question.answers.map((answer) => (
                        <li
                          key={answer.id}
                          className={`${styles.reviewAnswer} ${
                            answer.status === 'correctSelected' ? styles.reviewAnswerCorrect : ''
                          } ${
                            answer.status === 'correctMissing' ? styles.reviewAnswerMissing : ''
                          } ${
                            answer.status === 'incorrectSelected' ? styles.reviewAnswerWrong : ''
                          }`}
                        >
                          <div
                            className={styles.reviewAnswerText}
                            dangerouslySetInnerHTML={{ __html: answer.text }}
                          />
                          <span className={styles.reviewAnswerMeta}>
                            {answer.status === 'correctSelected' && 'Tu respuesta es correcta'}
                            {answer.status === 'correctMissing' && 'Era correcta y no la marcaste'}
                            {answer.status === 'incorrectSelected' && 'Tu respuesta no es correcta'}
                            {answer.status === 'neutral' && 'Respuesta no seleccionada'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const totalQuestions = quiz.questions.length;
  const currentNumber = currentQuestionIndex + 1;
  const answeredCount = Object.values(answers).filter((a) => a.length > 0).length;

  return (
    <div className={styles.quiz}>
      <div className={styles.quizHeader}>
        <h2>{displayTitle}</h2>
        <p className={styles.questionCounter}>
          Pregunta {currentNumber} de {totalQuestions}
        </p>
      </div>

      <div className={styles.progressText}>
        <span>{answeredCount}</span> de {totalQuestions} preguntas respondidas
      </div>

      <div className={styles.progressContainer}>
        <div
          className={styles.progressBar}
          style={{
            width: `${(answeredCount / totalQuestions) * 100}%`,
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
                  checked={(answers[currentQuestion.id] || []).map(String).includes(String(answer.id))}
                  onChange={() =>
                    handleAnswerChange(
                      currentQuestion.id,
                      answer.id,
                      currentQuestion.type
                    )
                  }
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

      {lightboxImage && (
        <div className={styles.lightbox} onClick={closeLightbox}>
          <div
            className={styles.lightboxContent}
            onClick={(e) => e.stopPropagation()}
          >
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
