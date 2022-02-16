import React from 'react';

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Budget from './pages/Budget';
import Home from './pages/Home';
import SmartHome from './pages/SmartHome';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/budget" element={<Budget/>} />
        <Route path="/smarthome" element={<SmartHome/>} />
        <Route path="/" element={<Home/>} />
      </Routes>
    </Router>
  );
}

export default App;
