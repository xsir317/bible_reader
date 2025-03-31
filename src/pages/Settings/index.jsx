import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { FaArrowLeft, FaPalette, FaInfoCircle, FaFileAlt, FaShieldAlt, FaSignOutAlt } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/themes.css';
import './index.css';
import { getTheme, setTheme, getAllThemes, themes } from '../../utils/themeManager';

const Settings = () => {
  const navigate = useNavigate();
  const [currentTheme, setCurrentTheme] = useState(getTheme());
  const availableThemes = getAllThemes();

  const handleThemeChange = (theme) => {
    if (setTheme(theme)) {
      setCurrentTheme(theme);
    }
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
          {availableThemes.map(theme => (
            <div
              key={theme.id}
              className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
              onClick={() => handleThemeChange(theme.id)}
            >
              <div className={`theme-preview ${theme.id}`}></div>
              <span>{theme.name}</span>
            </div>
          ))}
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