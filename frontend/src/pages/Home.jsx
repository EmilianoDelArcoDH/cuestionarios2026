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
    const filtered = topics.filter((topic) =>
      topic.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredTopics(filtered);
    setCurrentPage(1);
  }, [searchTerm, topics]);

  const totalPages = Math.ceil(filteredTopics.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTopics = filteredTopics.slice(startIndex, endIndex);
  const totalQuestions = topics.reduce((acc, topic) => acc + (topic._count?.questions || 0), 0);
  const availableTopics = topics.filter((topic) => (topic._count?.questions || 0) > 0).length;
  const hasSearch = searchTerm.trim().length > 0;

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
    if (!confirm(`Estas seguro de eliminar el tema "${topicName}"? Esto tambien eliminara todas sus preguntas.`)) {
      return;
    }

    try {
      await deleteTopic(topicId);
      setTopics(topics.filter((topic) => topic.id !== topicId));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <div className="loading">Cargando temas...</div>;
  }

  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Panel principal</p>
          <h2>Temas y cuestionarios en una vista clara</h2>
          <p className={styles.heroText}>
            Administra tus temas, revisa el contenido disponible y lanza quizzes sin perder tiempo.
          </p>
        </div>

        <div className={styles.heroActions}>
          <Link to="/create-topic" className={styles.primaryAction}>
            + Crear tema
          </Link>
          <button type="button" className={styles.secondaryAction} onClick={loadTopics}>
            Actualizar lista
          </button>
        </div>
      </section>

      <section className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Temas totales</span>
          <strong>{topics.length}</strong>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Temas listos</span>
          <strong>{availableTopics}</strong>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Preguntas cargadas</span>
          <strong>{totalQuestions}</strong>
        </div>
      </section>

      {error && <div className="error-message">{error}</div>}

      <section className={styles.toolbar}>
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}>Buscar</span>
          <input
            type="text"
            placeholder="Buscar temas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {hasSearch && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={() => setSearchTerm('')}
            >
              Limpiar
            </button>
          )}
        </div>

        <div className={styles.resultsPill}>
          {filteredTopics.length} resultado{filteredTopics.length !== 1 ? 's' : ''}
        </div>
      </section>

      {filteredTopics.length === 0 ? (
        <div className={styles.emptyState}>
          {hasSearch ? (
            <>
              <h3>No se encontraron temas</h3>
              <p>No hay temas que coincidan con "{searchTerm}"</p>
              <button onClick={() => setSearchTerm('')}>Limpiar busqueda</button>
            </>
          ) : (
            <>
              <h3>No hay temas disponibles</h3>
              <p>Comienza creando un tema nuevo</p>
              <Link to="/create-topic">Crear tema</Link>
            </>
          )}
        </div>
      ) : (
        <>
          <div className={styles.topicsGrid}>
            {currentTopics.map((topic) => (
              <article key={topic.id} className={styles.topicCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitleBlock}>
                    <h3>{topic.name}</h3>
                    <div className={styles.topicMeta}>
                      {topic._count.questions} pregunta{topic._count.questions !== 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className={styles.cardActions}>
                    <button
                      className={styles.editButton}
                      onClick={() => navigate(`/edit-topic/${topic.id}`)}
                      title="Editar tema"
                    >
                      Editar
                    </button>
                    <button
                      className={styles.manageButton}
                      onClick={() => navigate(`/edit-questions/${topic.id}`)}
                      title="Gestionar preguntas"
                    >
                      Preguntas
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteTopic(topic.id, topic.name)}
                      title="Eliminar tema"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <span
                    className={`${styles.statusBadge} ${
                      topic._count.questions === 0 ? styles.statusEmpty : styles.statusReady
                    }`}
                  >
                    {topic._count.questions === 0 ? 'Sin preguntas' : 'Listo para completar'}
                  </span>
                </div>

                <Link to={`/quiz/${topic.id}`} className={styles.cardLink}>
                  <button
                    className={styles.startQuizButton}
                    disabled={topic._count.questions === 0}
                  >
                    {topic._count.questions === 0 ? 'Agregar preguntas primero' : 'Iniciar quiz'}
                  </button>
                </Link>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className={styles.paginationButton}
              >
                Anterior
              </button>

              <div className={styles.paginationInfo}>
                Pagina {currentPage} de {totalPages}
              </div>

              <button
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className={styles.paginationButton}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
