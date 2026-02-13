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
    
    // Si es tipo single y se marca una como correcta, desmarcar las demás
    if (field === 'is_correct' && value === true && type === 'single') {
      newAnswers.forEach((ans, i) => {
        if (i !== index) {
          ans.is_correct = false;
        }
      });
    }
    
    setAnswers(newAnswers);
  }

  function buildHtmlWithImage(text, imageUrl) {
    if (!imageUrl) return text;
    return `${text}\n<img src="${imageUrl}" alt="imagen">`;
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

    const filledAnswers = answers.filter(a => a.text.trim());
    
    if (filledAnswers.length < 2) {
      setError('Debe haber al menos 2 respuestas');
      return;
    }

    const correctCount = filledAnswers.filter(a => a.is_correct).length;
    
    if (type === 'single' && correctCount !== 1) {
      setError('Las preguntas de tipo "single" deben tener exactamente 1 respuesta correcta');
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
        answers: filledAnswers.map(a => ({
          text: buildHtmlWithImage(a.text, a.imageUrl),
          is_correct: a.is_correct
        }))
      });

      setSuccess('Pregunta creada exitosamente');
      
      // Reset form
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
        <h2>Crear Pregunta</h2>
        <div className="error-message">
          No hay temas disponibles. Debes crear un tema primero.
        </div>
        <Link to="/create-topic" className={styles.backLink}>
          → Crear Tema
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.createQuestion}>
      <h2>Crear Pregunta</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit}>
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
          <label htmlFor="text">Texto de la Pregunta</label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe la pregunta aquí..."
            rows="3"
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="imageUrl">URL de Imagen (opcional)</label>
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

        <div className={styles.formGroup}>
          <label htmlFor="type">Tipo de Pregunta</label>
          <select
            id="type"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              // Si cambia a single, asegurar que solo haya una correcta
              if (e.target.value === 'single') {
                const correctIndex = answers.findIndex(a => a.is_correct);
                setAnswers(answers.map((a, i) => ({
                  ...a,
                  is_correct: i === Math.max(0, correctIndex)
                })));
              }
            }}
            disabled={loading}
          >
            <option value="single">Selección Única (Radio)</option>
            <option value="multiple">Selección Múltiple (Checkbox)</option>
          </select>
          <div className={styles.validationInfo}>
            {type === 'single' 
              ? '💡 Debe haber exactamente 1 respuesta correcta'
              : '💡 Puede haber más de 1 respuesta correcta'
            }
          </div>
        </div>

        <div className={styles.answersSection}>
          <h3>Respuestas</h3>
          
          {answers.map((answer, index) => (
            <div key={index} className={styles.answerItemFull}>
              <div className={styles.answerRow}>
                <input
                  type="text"
                  value={answer.text}
                  onChange={(e) => updateAnswer(index, 'text', e.target.value)}
                  placeholder={`Respuesta ${index + 1}`}
                  disabled={loading}
                  className={styles.answerTextInput}
                />
                
                <div className={styles.answerControls}>
                  <input
                    type="checkbox"
                    id={`correct-${index}`}
                    checked={answer.is_correct}
                    onChange={(e) => updateAnswer(index, 'is_correct', e.target.checked)}
                    disabled={loading}
                  />
                  <label htmlFor={`correct-${index}`}>Correcta</label>

                  {answers.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeAnswer(index)}
                      className={styles.removeButton}
                      disabled={loading}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
              
              <div className={styles.answerImageRow}>
                <input
                  type="text"
                  value={answer.imageUrl || ''}
                  onChange={(e) => updateAnswer(index, 'imageUrl', e.target.value)}
                  placeholder="URL de imagen (opcional)"
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

          <button
            type="button"
            onClick={addAnswer}
            className={styles.addAnswerButton}
            disabled={loading}
          >
            + Agregar Respuesta
          </button>
        </div>

        <button 
          type="submit" 
          className={styles.buttonPrimary}
          disabled={loading}
        >
          {loading ? 'Creando...' : 'Crear Pregunta'}
        </button>
      </form>

      <Link to="/" className={styles.backLink}>← Volver al inicio</Link>
    </div>
  );
}
