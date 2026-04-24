// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; 
import App from './routes/App';
import { AuthProvider } from './context/AuthContext'; // ← provides useAuth() to entire app

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>   {/* ← must wrap App */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);