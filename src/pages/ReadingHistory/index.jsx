import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import api from '../../api';
import './index.css';

const ReadingHistory = () => {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.post('/contents/content/reading-history');
      setHistory(response.history);
    } catch (error) {
      toast.error('获取阅读记录失败');
    }
  };

  const formatTime = (timeStr) => {
    const time = dayjs(timeStr);
    const today = dayjs();
    
    if (time.isSame(today, 'day')) {
      return time.format('HH:mm');
    }
    return time.format('MM-DD');
  };

  return (
    <div className="reading-history-container">
      <h2>阅读记录</h2>
      <div className="history-list">
        {history.map((item, index) => (
          <div key={index} className="history-item">
            <div className="book-info">
              <span 
                className="book-name"
                onClick={() => navigate(`/book/${item.book_id}`)}
              >
                {item.book_name}
              </span>
              <span className="read-time">{formatTime(item.updated_at)}</span>
            </div>
            <button 
              className="continue-btn"
              onClick={() => navigate(`/book/${item.book_id}/chapter/${item.last_chapter_id}`)}
            >
              继续
            </button>
          </div>
        ))}
        {history.length === 0 && (
          <div className="empty-history">
            暂无阅读记录
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadingHistory;