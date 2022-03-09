import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import SmartHome from './pages/SmartHome';
import Budget from './pages/Budget';
import Information from './pages/Information';
import Maintenance from './pages/Maintenance';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/smarthome" element={<SmartHome/>} />
        <Route path="/budget" element={<Budget/>} />
        <Route path="/info" element={<Information/>} />
        <Route path="/maintenance" element={<Maintenance/>} />
        <Route path="/" element={<Home/>} />
      </Routes>
    </Router>
  );
}

export default App;
