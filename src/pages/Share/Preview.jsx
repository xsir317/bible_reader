import React from 'react';
import { QRCode } from 'react-qrcode-logo';
import html2canvas from 'html2canvas';
import { ToastContainer, toast } from 'react-toastify';
import { BASE_FRONTEND_DOMAIN } from '../../config';
import 'react-toastify/dist/ReactToastify.css';
import './Preview.css';

const share_url = `${BASE_FRONTEND_DOMAIN}/share`;
const shareText = `始于创世的微光，终于启示的荣美，今日启程见证恩典轨迹。邀你共同接受这份恩典：${share_url}`;

const SharePreview = () => {
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      toast.success('分享文案已复制到剪贴板');
    } catch (err) {
      toast.error('复制失败，请手动复制');
    }
  };

  const handleSaveImage = async () => {
    const element = document.getElementById('share-image');
    try {
      const canvas = await html2canvas(element);
      const link = document.createElement('a');
      link.download = 'share.png';
      link.href = canvas.toDataURL();
      link.click();
      toast.success('图片已保存');
    } catch (err) {
      toast.error('保存图片失败');
    }
  };

  return (
    <div className="preview-container">
      <ToastContainer position="top-center" />
      <h2>分享预览</h2>
      
      <div className="share-image" id="share-image">
        <QRCode 
          value={share_url}
          size={120}
          bgColor="white"
          fgColor="black"
          level="L"
          includeMargin={true}
        />
      </div>

      <div>
        <button className="btn btn-primary" onClick={handleCopyText}>
          复制分享文案
        </button>
        <button className="btn btn-default" onClick={handleSaveImage}>
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