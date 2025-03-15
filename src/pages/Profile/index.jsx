import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { FaEdit, FaBookmark, FaHistory, FaStar, FaPen, FaGift, FaBug, FaShare, FaCog } from 'react-icons/fa';
import api from '../../api';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

const Profile = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      setIsLoggedIn(true);
      fetchUserInfo();
    }
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await api.get('/user/summary/info');
      setUserInfo(response.detail);
    } catch (error) {
      toast.error('获取用户信息失败');
    }
  };

  const handleSendCode = async () => {
    if (!email) {
      toast.error('请输入邮箱地址');
      return;
    }
    
    try {
      const response = await api.post('/user/identity/send-email', {
        email,
        type: 'login'
      });
      
      toast.success(response.msg || '验证码发送成功');
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      toast.error(error.message || '发送验证码失败');
    }
  };

  const handleLogin = async () => {
    if (!email || !verificationCode) {
      toast.error('请输入邮箱和验证码');
      return;
    }

    try {
      const response = await api.post('/user/identity/email-login', {
        email: email,
        code: verificationCode,
        inviter: ''
      });

      console.log(response);
      localStorage.setItem('userId', response.user.id);
      setIsLoggedIn(true);
      toast.success('登录成功');
    } catch (error) {
      toast.error(error.message || '登录失败');
    }
  };

  if (isLoggedIn && userInfo) {
    return (
      <div className="profile-container">
        <ToastContainer position="top-center" />
        <div className="user-info-section">
          <div className="user-basic-info">
            <img src={userInfo.avatar || '/default-avatar.png'} alt="用户头像" className="user-avatar" />
            <div className="user-name">
              <span>{userInfo.nickname || '未设置昵称'}</span>
              <FaEdit className="edit-icon" onClick={() => navigate('/profile/edit')} />
            </div>
          </div>
          <div className="right-section">
            {/* 预留右侧空间 */}
          </div>
        </div>

        <div className="feature-icons">
          <div className="feature-item" onClick={() => navigate('/bookmarks')}>
            <FaBookmark />
            <span>我的书签</span>
          </div>
          <div className="feature-item" onClick={() => navigate('/reading-history')}>
            <FaHistory />
            <span>阅读记录</span>
          </div>
          <div className="feature-item" onClick={() => navigate('/favorites')}>
            <FaStar />
            <span>我的收藏</span>
          </div>
          <div className="feature-item" onClick={() => navigate('/notes')}>
            <FaPen />
            <span>我的笔记</span>
          </div>
        </div>

        <div className="menu-list">
          <div className="menu-item" onClick={() => navigate('/donate')}>
            <FaGift />
            <span>奉献支持</span>
          </div>
          <div className="menu-item" onClick={() => navigate('/feedback')}>
            <FaBug />
            <span>反馈问题</span>
          </div>
          <div className="menu-item" onClick={() => navigate('/share')}>
            <FaShare />
            <span>推荐给好友</span>
          </div>
          <div className="menu-item" onClick={() => navigate('/settings')}>
            <FaCog />
            <span>设置和其他</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <ToastContainer position="top-center" />
      <div className="login-form">
        <h2>登录</h2>
        <div className="form-item">
          <input
            type="email"
            className="form-input"
            placeholder="请输入邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-item verification-code">
          <input
            type="text"
            className="form-input"
            placeholder="请输入验证码"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
          />
          <button
            className="send-code-btn"
            disabled={countdown > 0}
            onClick={handleSendCode}
          >
            {countdown > 0 ? `${countdown}秒后重试` : '发送验证码'}
          </button>
        </div>
        <button className="login-btn" onClick={handleLogin}>
          登录
        </button>
        <div className="other-login">
          <button className="facebook-btn" disabled>
            使用 Facebook 登录
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;