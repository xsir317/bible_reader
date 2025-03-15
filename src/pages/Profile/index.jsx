import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, message } from 'antd';
import api from '../../api';
import './index.css';

const Profile = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleSendCode = async () => {
    if (!email) {
      message.error('请输入邮箱地址');
      return;
    }
    
    try {
      const response = await api.post('/user/identity/send-email', {
        email,
        type: 'login'
      });
      
      message.success(response.msg || '验证码发送成功');
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
      message.error(error.message || '发送验证码失败');
    }
  };

  const handleLogin = async () => {
    if (!email || !verificationCode) {
      message.error('请输入邮箱和验证码');
      return;
    }

    try {
      const response = await api.post('/user/identity/email-login', {
        email,
        code: verificationCode,
        inviter: ''  // 预留的邀请者字段
      });

      const { id } = response.user;
      localStorage.setItem('userId', id);
      setIsLoggedIn(true);
      message.success('登录成功');
    } catch (error) {
      message.error(error.message || '登录失败');
    }
  };

  if (isLoggedIn) {
    // TODO: 实现已登录状态的界面
    return null;
  }

  return (
    <div className="profile-container">
      <div className="login-form">
        <h2>登录</h2>
        <div className="form-item">
          <Input
            placeholder="请输入邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-item verification-code">
          <Input
            placeholder="请输入验证码"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
          />
          <Button
            disabled={countdown > 0}
            onClick={handleSendCode}
          >
            {countdown > 0 ? `${countdown}秒后重试` : '发送验证码'}
          </Button>
        </div>
        <Button type="primary" block onClick={handleLogin}>
          登录
        </Button>
        <div className="other-login">
          <Button disabled type="link">
            使用 Facebook 登录
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;