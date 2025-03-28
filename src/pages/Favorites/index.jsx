import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import api from '../../api';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, [page]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await api.get('/contents/collects/my', {
        params: { page }
      });
      
      if (page === 1) {
        setFavorites(response.list);
      } else {
        setFavorites(prev => [...prev, ...response.list]);
      }
      setHasNext(response.has_next);
    } catch (error) {
      toast.error('获取收藏列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (hasNext && !loading) {
      setPage(prev => prev + 1);
    }
  };

  const handleItemClick = (bookId, chapter) => {
    navigate(`/read/${bookId}/${chapter}`);
  };

  return (
    <div className="favorites-container">
      <ToastContainer position="top-center" />
      <h2>我的收藏</h2>
      
      <div className="favorites-list">
        {favorites.map(item => (
          <div 
            key={item.id} 
            className="favorite-item"
            onClick={() => handleItemClick(item.book_id, item.chapter)}
          >
            <div className="favorite-header">
              <span className="book-name">{item.book_name}</span>
              <span className="chapter-verse">
                第{item.chapter}章 第{item.verse}节
              </span>
            </div>
            <div className="favorite-content">{item.content}</div>
            <div className="favorite-time">
              {new Date(item.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {loading && <div className="loading">加载中...</div>}
      
      {hasNext === 1 && !loading && (
        <div className="load-more">
          <button onClick={handleLoadMore}>加载更多</button>
        </div>
      )}
    </div>
  );
};

export default Favorites;