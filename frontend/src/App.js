import React from 'react';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<div>Accueil</div>} />
    </Routes>
  );
}

export default App;
