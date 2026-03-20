import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getTopics, createQuestion } from '../services/api';
import styles from './CreateQuestion.module.css';

export default function CreateQuestion() {
  const [searchParams] = useSearchParams();
  const topicIdFromUrl = searchParams.get('topicId');

  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [type, setType] = useState('single');
  const [answers, setAnswers] = useState([
    { text: '', imageUrl: '', is_correct: false },
    { text: '', imageUrl: '', is_correct: false }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadTopics();
  }, []);

  async function loadTopics() {
    try {
      const data = await getTopics();
      setTopics(data);
      if (topicIdFromUrl) {
        setSelectedTopicId(topicIdFromUrl);
      } else if (data.length > 0) {
        setSelectedTopicId(data[0].id);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  function addAnswer() {
    setAnswers([...answers, { text: '', imageUrl: '', is_correct: false }]);
  }

  function removeAnswer(index) {
    if (answers.length > 2) {
      setAnswers(answers.filter((_, i) => i !== index));
    }
  }

  function updateAnswer(index, field, value) {
    const newAnswers = [...answers];
    newAnswers[index][field] = value;

    if (field === 'is_correct' && value === true && type === 'single') {
      newAnswers.forEach((ans, i) => {
        if (i !== index) {
          ans.is_correct = false;
        }
      });
    }

    setAnswers(newAnswers);
  }

  function buildHtmlWithImage(answerText, answerImageUrl) {
    if (!answerImageUrl) return answerText;
    return `${answerText}\n<img src="${answerImageUrl}" alt="imagen">`;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!selectedTopicId) {
      setError('Selecciona un tema');
      return;
    }

    if (!text.trim()) {
      setError('El texto de la pregunta es requerido');
      return;
    }

    const filledAnswers = answers.filter((answer) => answer.text.trim());

    if (filledAnswers.length < 2) {
      setError('Debe haber al menos 2 respuestas');
      return;
    }

    const correctCount = filledAnswers.filter((answer) => answer.is_correct).length;

    if (type === 'single' && correctCount !== 1) {
      setError('Las preguntas de tipo single deben tener exactamente 1 respuesta correcta');
      return;
    }

    if (correctCount === 0) {
      setError('Debe haber al menos una respuesta correcta');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await createQuestion(selectedTopicId, {
        text: buildHtmlWithImage(text, imageUrl),
        type,
        answers: filledAnswers.map((answer) => ({
          text: buildHtmlWithImage(answer.text, answer.imageUrl),
          is_correct: answer.is_correct
        }))
      });

      setSuccess('Pregunta creada exitosamente');
      setText('');
      setImageUrl('');
      setAnswers([
        { text: '', imageUrl: '', is_correct: false },
        { text: '', imageUrl: '', is_correct: false }
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (topics.length === 0) {
    return (
      <div className={styles.createQuestion}>
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Nueva pregunta</p>
            <h2>Crear una pregunta</h2>
            <p className={styles.heroText}>
              Necesitas al menos un tema para poder asociar la pregunta.
            </p>
          </div>
        </section>

        <div className="error-message">
          No hay temas disponibles. Debes crear un tema primero.
        </div>

        <Link to="/create-topic" className={styles.backLink}>
          Ir a crear tema
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.createQuestion}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Nueva pregunta</p>
          <h2>Crear una pregunta</h2>
          <p className={styles.heroText}>
            Completa los datos principales, define el tipo de respuesta y agrega las opciones.
          </p>
        </div>
        <div className={styles.heroBadge}>{answers.length} respuestas</div>
      </section>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className={styles.formLayout}>
        <section className={styles.formCard}>
          <div className={styles.sectionHeader}>
            <h3>Informacion de la pregunta</h3>
            <p>Selecciona el tema y escribe el contenido principal.</p>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="topic">Tema</label>
            <select
              id="topic"
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              disabled={loading}
            >
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="text">Texto de la pregunta</label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribe la pregunta aqui..."
              rows="4"
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="imageUrl">Imagen de apoyo</label>
            <input
              type="text"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
              disabled={loading}
            />
            {imageUrl && (
              <div className={styles.imagePreview}>
                <img src={imageUrl} alt="Vista previa de la pregunta" />
              </div>
            )}
          </div>
        </section>

        <section className={styles.formCard}>
          <div className={styles.sectionHeader}>
            <h3>Configuracion</h3>
            <p>Define como debe responderse la pregunta.</p>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="type">Tipo de pregunta</label>
            <select
              id="type"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                if (e.target.value === 'single') {
                  const correctIndex = answers.findIndex((answer) => answer.is_correct);
                  setAnswers(
                    answers.map((answer, index) => ({
                      ...answer,
                      is_correct: index === Math.max(0, correctIndex)
                    }))
                  );
                }
              }}
              disabled={loading}
            >
              <option value="single">Seleccion unica</option>
              <option value="multiple">Seleccion multiple</option>
            </select>
            <div className={styles.validationInfo}>
              {type === 'single'
                ? 'Debe haber exactamente 1 respuesta correcta.'
                : 'Puede haber mas de 1 respuesta correcta.'}
            </div>
          </div>
        </section>

        <section className={`${styles.formCard} ${styles.answersSection}`}>
          <div className={styles.answersHeader}>
            <div className={styles.sectionHeader}>
              <h3>Respuestas</h3>
              <p>Agrega opciones claras y marca las correctas.</p>
            </div>

            <button
              type="button"
              onClick={addAnswer}
              className={styles.addAnswerButton}
              disabled={loading}
            >
              + Agregar respuesta
            </button>
          </div>

          <div className={styles.answersList}>
            {answers.map((answer, index) => (
              <div key={index} className={styles.answerItemFull}>
                <div className={styles.answerTop}>
                  <div className={styles.answerBadge}>Respuesta {index + 1}</div>
                  {answers.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeAnswer(index)}
                      className={styles.removeButton}
                      disabled={loading}
                    >
                      Quitar
                    </button>
                  )}
                </div>

                <div className={styles.answerRow}>
                  <input
                    type="text"
                    value={answer.text}
                    onChange={(e) => updateAnswer(index, 'text', e.target.value)}
                    placeholder={`Texto de la respuesta ${index + 1}`}
                    disabled={loading}
                    className={styles.answerTextInput}
                  />

                  <label className={styles.correctToggle}>
                    <input
                      type="checkbox"
                      checked={answer.is_correct}
                      onChange={(e) => updateAnswer(index, 'is_correct', e.target.checked)}
                      disabled={loading}
                    />
                    <span>Correcta</span>
                  </label>
                </div>

                <div className={styles.answerImageRow}>
                  <input
                    type="text"
                    value={answer.imageUrl || ''}
                    onChange={(e) => updateAnswer(index, 'imageUrl', e.target.value)}
                    placeholder="URL de imagen opcional"
                    disabled={loading}
                    className={styles.answerImageInput}
                  />
                  {answer.imageUrl && (
                    <div className={styles.answerImagePreview}>
                      <img src={answer.imageUrl} alt={`Vista previa ${index + 1}`} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className={styles.submitRow}>
          <button
            type="submit"
            className={styles.buttonPrimary}
            disabled={loading}
          >
            {loading ? 'Creando...' : 'Crear pregunta'}
          </button>
        </div>
      </form>

      <Link to="/" className={styles.backLink}>Volver al inicio</Link>
    </div>
  );
}
