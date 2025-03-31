import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { applyTheme } from './utils/themeManager';
import './styles/themes.css';
import './index.css';

// 应用初始化时应用主题
applyTheme();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);