import { Link, useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';

export default function Navbar() {
  const location = useLocation();

  // Ocultar navbar durante el quiz
  if (location.pathname.startsWith('/quiz/')) {
    return null;
  }

  return (
    <div className={styles.navbar}>
      <h1>📝 Plataforma de Cuestionarios</h1>
      <nav>
        <Link 
          to="/" 
          className={location.pathname === '/' ? styles.active : ''}
        >
          Inicio
        </Link>
        <Link 
          to="/create-topic" 
          className={location.pathname === '/create-topic' ? styles.active : ''}
        >
          Crear Tema
        </Link>
        <Link 
          to="/create-question" 
          className={location.pathname === '/create-question' ? styles.active : ''}
        >
          Crear Pregunta
        </Link>
      </nav>
    </div>
  );
}
