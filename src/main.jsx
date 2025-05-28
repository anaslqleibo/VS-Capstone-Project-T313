import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './index.css'; //  This is missing — without it, Tailwind doesn't apply!


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
