import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import api from '../../api';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    setPage(1);
    setNotes([]);
    fetchNotes();
  }, [selectedBookId]);

  useEffect(() => {
    if (page > 1) {
      fetchNotes();
    }
  }, [page]);

  const fetchBooks = async () => {
    try {
      const data = await api.post('/contents/content/books-menu');
      const booksArray = Object.entries(data).map(([id, book]) => ({
        id: parseInt(id),
        ...book
      }));
      setBooks(booksArray);
    } catch (error) {
      toast.error('获取书籍列表失败');
    }
  };

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await api.post('/contents/notes/list', { 
        page,
        book_id: selectedBookId 
      });
      
      if (page === 1) {
        setNotes(response.list);
      } else {
        setNotes(prev => [...prev, ...response.list]);
      }
      setHasNext(response.has_next);
    } catch (error) {
      toast.error('获取笔记列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (hasNext && !loading) {
      setPage(prev => prev + 1);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    return `${date.getMonth() + 1}-${date.getDate()}`;
  };

  const handleItemClick = (bookId, chapter) => {
    navigate(`/book/${bookId}/chapter/${chapter}`);
  };

  return (
    <div className="notes-container">
      <ToastContainer position="top-center" />
      <h2>我的笔记</h2>
      
      <div className="filter-section">
        <select 
          value={selectedBookId || ''} 
          onChange={(e) => setSelectedBookId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">全部书卷</option>
          {books.map(book => (
            <option key={book.id} value={book.id}>
              {book.name}
            </option>
          ))}
        </select>
      </div>

      <div className="notes-list">
        {notes.length > 0 ? (
          notes.map(item => (
            <div 
              key={item.id} 
              className="note-item"
              onClick={() => handleItemClick(item.book_id, item.chapter_num)}
            >
              <div className="note-header">
                <span className="book-name">{item.book_name}</span>
                <span className="chapter-verse">
                  第{item.chapter_num}章 第{item.verse_num}节
                </span>
                <span className="note-time">{formatDate(item.created_at)}</span>
              </div>
              <div className="note-content">
                {item.content?.text}
              </div>
            </div>
          ))
        ) : (
          !loading && <div className="empty-message">暂无相关记录</div>
        )}
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

export default Notes;