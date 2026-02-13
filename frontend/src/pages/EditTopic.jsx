import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTopic, updateTopic } from '../services/api';
import styles from './CreateTopic.module.css';

export default function EditTopic() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTopic();
  }, [topicId]);

  async function loadTopic() {
    try {
      setLoading(true);
      const topic = await getTopic(topicId);
      setName(topic.name);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('El nombre del tema es requerido');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await updateTopic(topicId, { name });
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="loading">Cargando tema...</div>;
  }

  return (
    <div className={styles.createTopic}>
      <h2>Editar Tema</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="topicName">Nombre del Tema:</label>
          <input
            type="text"
            id="topicName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Matemáticas, Historia, etc."
            disabled={submitting}
          />
        </div>

        <div className={styles.actions}>
          <button type="submit" disabled={submitting} className={styles.buttonPrimary}>
            {submitting ? 'Actualizando...' : 'Actualizar Tema'}
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/')}
            disabled={submitting}
            className={styles.cancelButton}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
