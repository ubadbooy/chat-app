// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Chat from './pages/Chat';
import { useAuthStore } from './store/authStore';

function App() {
  const user = useAuthStore((state) => state.user);

  return (
    <Router>
      <Routes>
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/chat" />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/chat" />} />
        <Route path="/chat" element={user ? <Chat /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={user ? "/chat" : "/register"} />} />
      </Routes>
    </Router>
  );
}

export default App;
