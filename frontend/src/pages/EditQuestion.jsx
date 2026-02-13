import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getQuestions, deleteQuestion, updateQuestion } from '../services/api';
import styles from './EditQuestion.module.css';

export default function EditQuestion() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    text: '',
    imageUrl: '',
    type: 'single',
    answers: []
  });

  useEffect(() => {
    loadQuestions();
  }, [topicId]);

  async function loadQuestions() {
    try {
      setLoading(true);
      setError('');
      const data = await getQuestions(topicId);
      setQuestions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function extractImageUrl(html) {
    if (!html) return '';
    const match = html.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : '';
  }

  function extractTextWithoutImage(html) {
    if (!html) return '';
    return html.replace(/<img[^>]*>/g, '').trim();
  }

  function buildHtmlWithImage(text, imageUrl) {
    if (!imageUrl) return text;
    return `${text}\n<img src="${imageUrl}" alt="imagen">`;
  }

  function startEditing(question) {
    setEditingId(question.id);
    setEditForm({
      text: extractTextWithoutImage(question.text),
      imageUrl: extractImageUrl(question.text),
      type: question.type,
      answers: question.answers.map(a => ({
        id: a.id,
        text: extractTextWithoutImage(a.text),
        imageUrl: extractImageUrl(a.text),
        is_correct: a.isCorrect
      }))
    });
  }

  function cancelEditing() {
    setEditingId(null);
    setEditForm({ text: '', imageUrl: '', type: 'single', answers: [] });
  }

  function updateEditAnswer(index, field, value) {
    const newAnswers = [...editForm.answers];
    newAnswers[index][field] = value;
    
    // Si es single y se marca una como correcta, desmarcar las demás
    if (field === 'is_correct' && value === true && editForm.type === 'single') {
      newAnswers.forEach((ans, i) => {
        if (i !== index) {
          ans.is_correct = false;
        }
      });
    }
    
    setEditForm({ ...editForm, answers: newAnswers });
  }

  function addEditAnswer() {
    setEditForm({
      ...editForm,
      answers: [...editForm.answers, { text: '', imageUrl: '', is_correct: false }]
    });
  }

  function removeEditAnswer(index) {
    if (editForm.answers.length > 2) {
      setEditForm({
        ...editForm,
        answers: editForm.answers.filter((_, i) => i !== index)
      });
    }
  }

  async function handleSaveEdit(questionId) {
    if (!editForm.text.trim()) {
      setError('El texto de la pregunta es requerido');
      return;
    }

    const filledAnswers = editForm.answers.filter(a => a.text.trim());
    
    if (filledAnswers.length < 2) {
      setError('Debe haber al menos 2 respuestas');
      return;
    }

    const correctCount = filledAnswers.filter(a => a.is_correct).length;
    
    if (editForm.type === 'single' && correctCount !== 1) {
      setError('Las preguntas de tipo "single" deben tener exactamente 1 respuesta correcta');
      return;
    }

    if (correctCount === 0) {
      setError('Debe haber al menos una respuesta correcta');
      return;
    }

    try {
      setError('');
      await updateQuestion(topicId, questionId, {
        text: buildHtmlWithImage(editForm.text, editForm.imageUrl),
        type: editForm.type,
        answers: filledAnswers.map(a => ({
          text: buildHtmlWithImage(a.text, a.imageUrl),
          is_correct: a.is_correct
        }))
      });
      
      await loadQuestions();
      cancelEditing();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(questionId) {
    if (!confirm('¿Estás seguro de eliminar esta pregunta?')) {
      return;
    }

    try {
      await deleteQuestion(topicId, questionId);
      setQuestions(questions.filter(q => q.id !== questionId));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <div className="loading">Cargando preguntas...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Gestionar Preguntas</h2>
        <Link to={`/create-question?topicId=${topicId}`}>
          <button className={styles.addButton}>+ Nueva Pregunta</button>
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      {questions.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No hay preguntas en este tema</h3>
          <p>Comienza agregando una pregunta nueva</p>
          <Link to={`/create-question?topicId=${topicId}`}>
            <button>Agregar Pregunta</button>
          </Link>
        </div>
      ) : (
        <div className={styles.questionsList}>
          {questions.map((question, index) => (
            <div key={question.id} className={styles.questionCard}>
              {editingId === question.id ? (
                // Modo edición
                <div className={styles.editForm}>
                  <div className={styles.formGroup}>
                    <label>Texto de la Pregunta</label>
                    <textarea
                      value={editForm.text}
                      onChange={(e) => setEditForm({ ...editForm, text: e.target.value })}
                      rows="3"
                      placeholder="Escribe la pregunta aquí..."
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>URL de Imagen (opcional)</label>
                    <input
                      type="text"
                      value={editForm.imageUrl}
                      onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                    {editForm.imageUrl && (
                      <div className={styles.imagePreview}>
                        <img src={editForm.imageUrl} alt="Vista previa" />
                      </div>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label>Tipo de Pregunta</label>
                    <select
                      value={editForm.type}
                      onChange={(e) => {
                        const newType = e.target.value;
                        setEditForm({ ...editForm, type: newType });
                        if (newType === 'single') {
                          const correctIndex = editForm.answers.findIndex(a => a.is_correct);
                          setEditForm({
                            ...editForm,
                            type: newType,
                            answers: editForm.answers.map((a, i) => ({
                              ...a,
                              is_correct: i === Math.max(0, correctIndex)
                            }))
                          });
                        }
                      }}
                    >
                      <option value="single">Selección Única</option>
                      <option value="multiple">Selección Múltiple</option>
                    </select>
                  </div>

                  <div className={styles.answersSection}>
                    <h4>Respuestas</h4>
                    {editForm.answers.map((answer, idx) => (
                      <div key={idx} className={styles.answerItemFull}>
                        <div className={styles.answerRow}>
                          <input
                            type="text"
                            value={answer.text}
                            onChange={(e) => updateEditAnswer(idx, 'text', e.target.value)}
                            placeholder={`Respuesta ${idx + 1}`}
                            className={styles.answerTextInput}
                          />
                          <div className={styles.answerControls}>
                            <input
                              type="checkbox"
                              id={`edit-correct-${idx}`}
                              checked={answer.is_correct}
                              onChange={(e) => updateEditAnswer(idx, 'is_correct', e.target.checked)}
                            />
                            <label htmlFor={`edit-correct-${idx}`}>Correcta</label>
                            {editForm.answers.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeEditAnswer(idx)}
                                className={styles.removeAnswerButton}
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
                            onChange={(e) => updateEditAnswer(idx, 'imageUrl', e.target.value)}
                            placeholder="URL de imagen (opcional)"
                            className={styles.answerImageInput}
                          />
                          {answer.imageUrl && (
                            <div className={styles.answerImagePreview}>
                              <img src={answer.imageUrl} alt={`Vista previa ${idx + 1}`} />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addEditAnswer}
                      className={styles.addAnswerButton}
                    >
                      + Agregar Respuesta
                    </button>
                  </div>

                  <div className={styles.editActions}>
                    <button 
                      onClick={() => handleSaveEdit(question.id)}
                      className={styles.saveButton}
                    >
                      💾 Guardar
                    </button>
                    <button 
                      onClick={cancelEditing}
                      className={styles.cancelButton}
                    >
                      ✕ Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                // Modo vista
                <>
                  <div className={styles.questionHeader}>
                    <span className={styles.questionNumber}>#{index + 1}</span>
                    <span className={styles.questionType}>
                      {question.type === 'single' ? 'Única' : 'Múltiple'}
                    </span>
                  </div>
                  
                  <div 
                    className={styles.questionText}
                    dangerouslySetInnerHTML={{ __html: question.text }}
                  />
                  
                  <div className={styles.answers}>
                    {question.answers.map((answer) => (
                      <div 
                        key={answer.id} 
                        className={`${styles.answer} ${answer.isCorrect ? styles.correct : ''}`}
                      >
                        {answer.isCorrect && <span className={styles.checkmark}>✓</span>}
                        <span dangerouslySetInnerHTML={{ __html: answer.text }} />
                      </div>
                    ))}
                  </div>

                  <div className={styles.actions}>
                    <button 
                      onClick={() => startEditing(question)}
                      className={styles.editButton}
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(question.id)}
                      className={styles.deleteButton}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <div className={styles.backButton}>
        <button onClick={() => navigate('/')}>Volver al Inicio</button>
      </div>
    </div>
  );
}
