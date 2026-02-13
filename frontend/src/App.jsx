import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreateTopic from './pages/CreateTopic';
import CreateQuestion from './pages/CreateQuestion';
import EditTopic from './pages/EditTopic';
import EditQuestion from './pages/EditQuestion';
import Quiz from './pages/Quiz';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-topic" element={<CreateTopic />} />
        <Route path="/create-question" element={<CreateQuestion />} />
        <Route path="/edit-topic/:topicId" element={<EditTopic />} />
        <Route path="/edit-questions/:topicId" element={<EditQuestion />} />
        <Route path="/quiz/:topicId" element={<Quiz />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
