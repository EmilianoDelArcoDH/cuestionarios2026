import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTopics } from '../services/api';
import styles from './Home.module.css';

export default function Home() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTopics();
  }, []);

  async function loadTopics() {
    try {
      setLoading(true);
      setError('');
      const data = await getTopics();
      setTopics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="loading">Cargando temas...</div>;
  }

  return (
    <div className={styles.home}>
      <h2>Temas Disponibles</h2>

      {error && <div className="error-message">{error}</div>}

      {topics.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No hay temas disponibles</h3>
          <p>Comienza creando un tema nuevo</p>
          <Link to="/create-topic">Crear Tema</Link>
        </div>
      ) : (
        <div className={styles.topicsGrid}>
          {topics.map((topic) => (
            <div key={topic.id} className={styles.topicCard}>
              <h3>{topic.name}</h3>
              <div className={styles.topicMeta}>
                {topic._count.questions} pregunta{topic._count.questions !== 1 ? 's' : ''}
              </div>
              <Link to={`/quiz/${topic.id}`}>
                <button disabled={topic._count.questions === 0}>
                  {topic._count.questions === 0 ? 'Sin preguntas' : 'Iniciar Quiz'}
                </button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
