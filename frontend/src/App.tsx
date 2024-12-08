import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MusicCardList from './components/MusicCardList';
import PairingModePage from './pages/PairingModePage';
import MouseModePage from './pages/MouseModePage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MusicCardList />} />
        <Route path="/pairing-mode" element={<PairingModePage />} />
        <Route path="/mouse-mode" element={<MouseModePage />} />
      </Routes>
    </Router>
  );
};

export default App;