import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreateTopic from './pages/CreateTopic';
import CreateQuestion from './pages/CreateQuestion';
import Quiz from './pages/Quiz';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-topic" element={<CreateTopic />} />
        <Route path="/create-question" element={<CreateQuestion />} />
        <Route path="/quiz/:topicId" element={<Quiz />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
