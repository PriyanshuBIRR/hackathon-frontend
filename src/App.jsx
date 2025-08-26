import ChatUI from './pages/ChatUI';
import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <Router>

      <main className="h-full"> 
        <Routes>
          <Route path="/" element={<ChatUI />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
