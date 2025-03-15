import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { FaArrowLeft, FaPalette, FaInfoCircle, FaFileAlt, FaShieldAlt, FaSignOutAlt } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/themes.css';
import './index.css';

const Settings = () => {
  const navigate = useNavigate();
  const [currentTheme, setCurrentTheme] = useState('brown-light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'brown-light';
    setCurrentTheme(savedTheme);
    document.body.className = `theme-${savedTheme}`;
  }, []);

  const handleThemeChange = (theme) => {
    setCurrentTheme(theme);
    localStorage.setItem('theme', theme);
    document.body.className = `theme-${theme}`;
  };

  const menuItems = [
    { icon: <FaInfoCircle />, text: '关于我们', path: '/about' },
    { icon: <FaFileAlt />, text: '使用条款', path: '/terms' },
    { icon: <FaShieldAlt />, text: '隐私政策', path: '/privacy' },
  ];

  return (
    <div className="settings-container">
      <ToastContainer position="top-center" />
      
      <div className="settings-header">
        <FaArrowLeft className="back-icon" onClick={() => navigate(-1)} />
        <h2>设置</h2>
      </div>

      <div className="settings-section">
        <div className="section-title">
          <FaPalette />
          <h3>主题设置</h3>
        </div>
        <div className="theme-options">
          <div
            className={`theme-option ${currentTheme === 'brown-light' ? 'active' : ''}`}
            onClick={() => handleThemeChange('brown-light')}
          >
            <div className="theme-preview brown-light"></div>
            <span>温暖棕</span>
          </div>
          <div
            className={`theme-option ${currentTheme === 'green-light' ? 'active' : ''}`}
            onClick={() => handleThemeChange('green-light')}
          >
            <div className="theme-preview green-light"></div>
            <span>清新绿</span>
          </div>
          <div
            className={`theme-option ${currentTheme === 'dark' ? 'active' : ''}`}
            onClick={() => handleThemeChange('dark')}
          >
            <div className="theme-preview dark"></div>
            <span>深色模式</span>
          </div>
        </div>
      </div>

      <div className="settings-menu">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className="menu-item"
            onClick={() => navigate(item.path)}
          >
            {item.icon}
            <span>{item.text}</span>
          </div>
        ))}
      </div>

      <button className="logout-button">
        <FaSignOutAlt />
        <span>退出登录</span>
      </button>
    </div>
  );
};

export default Settings;