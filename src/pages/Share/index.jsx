import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Share = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 获取URL参数
    const params = new URLSearchParams(location.search);
    const inviter = params.get('inviter');
    const forward = params.get('forward') || '/profile';

    // 如果inviter存在，则保存到localStorage
    if (inviter) {
      localStorage.setItem('inviter', inviter);
    }

    // 跳转到指定页面
    //console.log(forward);
    navigate(forward);
  }, [navigate, location]);

  // 渲染加载中的提示（实际上用户几乎看不到这个页面，因为会立即跳转）
  return (
    <div className="share-redirect-container" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <p>正在跳转，请稍候...</p>
    </div>
  );
};

export default Share;