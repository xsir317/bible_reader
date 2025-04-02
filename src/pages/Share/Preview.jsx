import React from 'react';
import { QRCode } from 'react-qrcode-logo';
import html2canvas from 'html2canvas';
import { ToastContainer, toast } from 'react-toastify';
import { BASE_FRONTEND_DOMAIN } from '../../config';
import 'react-toastify/dist/ReactToastify.css';
import './Preview.css';
import { useNavigate, useLocation } from 'react-router-dom';  // 添加这行在文件顶部的 imports 中

const getShareUrl = (inviter, forward) => {
  let url = `${BASE_FRONTEND_DOMAIN}/share`;
  const params = new URLSearchParams();
  
  if (inviter) {
    params.append('inviter', inviter);
  }
  
  if (forward) {
    params.append('forward', forward);
  }

  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
};

// 修改 sharePage 方法
export const sharePage = (inviter, forward, navigate) => {
  navigate('/share/preview', { 
    state: { inviter, forward }
  });
};

// 修改 SharePreview 组件来接收 location state
const SharePreview = ({ inviter, forward }) => {
  const location = useLocation();
  const finalInviter = inviter || location.state?.inviter;
  const finalForward = forward || location.state?.forward;
  const [previewImage, setPreviewImage] = React.useState('');
  
  const share_url = getShareUrl(finalInviter, finalForward);
  const shareText = `始于创世的微光，终于启示的荣美，今日启程见证恩典轨迹。邀你共同接受这份恩典：${share_url}`;

  React.useEffect(() => {
    generateShareImage();
  }, [share_url]);

  const generateShareImage = async () => {
    const element = document.getElementById('share-image');
    try {
      element.style.display = 'block';
      const canvas = await html2canvas(element);
      // 设置较低的图片质量来减小文件大小
      setPreviewImage(canvas.toDataURL('image/jpeg', 0.7));
      element.style.display = 'none';
    } catch (err) {
      toast.error('生成预览图片失败');
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      toast.success('分享文案已复制到剪贴板');
    } catch (err) {
      toast.error('复制失败，请手动复制');
    }
  };

  const handleSaveImage = () => {
    if (previewImage) {
      const link = document.createElement('a');
      link.download = 'share_bible.jpg';
      link.href = previewImage;
      link.click();
      toast.success('图片已保存');
    }
  };

  return (
    <div className="preview-container">
      <ToastContainer position="top-center" />
      <h2>分享预览</h2>
      
      <div className="share-image" id="share-image">
        <QRCode 
          value={share_url}
          size={100}
          bgColor="white"
          fgColor="black"
          level="L"
          includeMargin={true}
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '10px'
          }}
        />
      </div>

      {previewImage && (
        <div className="preview-image-container">
          <img 
            src={previewImage} 
            alt="分享预览" 
            style={{ width: '100%', maxWidth: '300px' }}
          />
        </div>
      )}

      <div>
        <button className="btn btn-primary" onClick={handleCopyText}>
          复制分享文案
        </button>
        <button className="btn btn-default" onClick={handleSaveImage} style={{ color: '#333' }}>
          保存分享图片
        </button>
      </div>

      <div style={{ whiteSpace: 'pre-wrap' }}>
        预览文案：
        <br />
        {shareText}
      </div>
    </div>
  );
};

export default SharePreview;