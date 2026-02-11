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
      
      const topic = await createTopic(name);
      
      setSuccess(`Tema "${topic.name}" creado/encontrado exitosamente`);
      setName('');
      
      // Redirigir después de 2 segundos
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
      <h2>Crear Tema</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Nombre del Tema</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: JavaScript Básico"
            disabled={loading}
          />
        </div>

        <button 
          type="submit" 
          className={styles.buttonPrimary}
          disabled={loading}
        >
          {loading ? 'Creando...' : 'Crear Tema'}
        </button>
      </form>

      <Link to="/" className={styles.backLink}>← Volver al inicio</Link>
    </div>
  );
}
