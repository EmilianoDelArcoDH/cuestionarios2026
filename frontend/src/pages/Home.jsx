import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getTopics, deleteTopic } from '../services/api';
import styles from './Home.module.css';

export default function Home() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    loadTopics();
  }, []);

  useEffect(() => {
    // Filter topics based on search term
    const filtered = topics.filter(topic =>
      topic.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredTopics(filtered);
    setCurrentPage(1); // Resetear a la primera página cuando cambia la búsqueda
  }, [searchTerm, topics]);
  
  // Calcular paginación
  const totalPages = Math.ceil(filteredTopics.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTopics = filteredTopics.slice(startIndex, endIndex);

  async function loadTopics() {
    try {
      setLoading(true);
      setError('');
      const data = await getTopics();
      setTopics(data);
      setFilteredTopics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteTopic(topicId, topicName) {
    if (!confirm(`¿Estás seguro de eliminar el tema "${topicName}"? Esto también eliminará todas sus preguntas.`)) {
      return;
    }

    try {
      await deleteTopic(topicId);
      setTopics(topics.filter(t => t.id !== topicId));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <div className="loading">Cargando temas...</div>;
  }

  return (
    <div className={styles.home}>
      <div className={styles.header}>
        <h2>Temas Disponibles</h2>
        <Link to="/create-topic">
          <button className={styles.createButton}>+ Crear Tema</button>
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="🔍 Buscar temas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        {searchTerm && (
          <button 
            className={styles.clearButton}
            onClick={() => setSearchTerm('')}
          >
            ✕
          </button>
        )}
      </div>

      {filteredTopics.length === 0 ? (
        <div className={styles.emptyState}>
          {searchTerm ? (
            <>
              <h3>No se encontraron temas</h3>
              <p>No hay temas que coincidan con "{searchTerm}"</p>
              <button onClick={() => setSearchTerm('')}>Limpiar búsqueda</button>
            </>
          ) : (
            <>
              <h3>No hay temas disponibles</h3>
              <p>Comienza creando un tema nuevo</p>
              <Link to="/create-topic">Crear Tema</Link>
            </>
          )}
        </div>
      ) : (
        <>
          <div className={styles.topicsGrid}>
            {currentTopics.map((topic) => (
              <div key={topic.id} className={styles.topicCard}>
                <div className={styles.cardHeader}>
                  <h3>{topic.name}</h3>
                  <div className={styles.cardActions}>
                    <button
                      className={styles.editButton}
                      onClick={() => navigate(`/edit-topic/${topic.id}`)}
                      title="Editar tema"
                    >
                      ✏️
                    </button>
                    <button
                      className={styles.manageButton}
                      onClick={() => navigate(`/edit-questions/${topic.id}`)}
                      title="Gestionar preguntas"
                    >
                      📝
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteTopic(topic.id, topic.name)}
                      title="Eliminar tema"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div className={styles.topicMeta}>
                  {topic._count.questions} pregunta{topic._count.questions !== 1 ? 's' : ''}
                </div>
                
                <Link to={`/quiz/${topic.id}`}>
                  <button 
                    className={styles.startQuizButton}
                    disabled={topic._count.questions === 0}
                  >
                    {topic._count.questions === 0 ? 'Sin preguntas' : 'Iniciar Quiz'}
                  </button>
                </Link>
              </div>
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={styles.paginationButton}
              >
                ← Anterior
              </button>
              
              <div className={styles.paginationInfo}>
                Página {currentPage} de {totalPages}
              </div>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={styles.paginationButton}
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
