import React from 'react';

import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import Budget from './pages/Budget';
import Home from './pages/Home';
import SmartHome from './pages/SmartHome';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/budget" component={Budget} />
        <Route path="/smarthome" component={SmartHome} />
        <Route path="/" component={Home} />
      </Switch>
    </Router>
  );
}

export default App;
