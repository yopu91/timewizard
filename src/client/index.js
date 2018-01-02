import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router-dom';
import history from 'services/History';
import App from './app/App.jsx';

ReactDOM.render(
  <Router history={history}>
    <App />
  </Router>
, document.getElementById('root'));