import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createTopic } from '../services/api';
import styles from './CreateTopic.module.css';

export default function CreateTopic() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (!name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const topic = await createTopic(name, []);

      setSuccess(`Tema "${topic.name}" creado o encontrado exitosamente`);
      setName('');

      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.createTopic}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Nuevo tema</p>
          <h2>Crear un tema</h2>
          <p className={styles.heroText}>
            Define el nombre del tema para empezar a cargar preguntas y organizar el contenido.
          </p>
        </div>
        <div className={styles.heroBadge}>1 paso</div>
      </section>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <section className={styles.formCard}>
        <div className={styles.sectionHeader}>
          <h3>Informacion principal</h3>
          <p>Usa un nombre claro para identificar el tema rapidamente.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Nombre del tema</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: JavaScript Basico"
              disabled={loading}
            />
          </div>

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.buttonPrimary}
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear tema'}
            </button>
          </div>
        </form>
      </section>

      <Link to="/" className={styles.backLink}>Volver al inicio</Link>
    </div>
  );
}
