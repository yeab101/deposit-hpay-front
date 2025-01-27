import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Deposits from './components/Deposits';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Deposits />} />
        <Route path="/deposits" element={<Deposits />} />
      </Routes>
    </Router>
  );
}

export default App;
