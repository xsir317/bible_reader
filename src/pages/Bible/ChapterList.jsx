import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../api';
import './ChapterList.css';

export default function ChapterList() {
    const { bookId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [book, setBook] = useState(location.state?.book);
    const [readHistory, setReadHistory] = useState(null);

    useEffect(() => {
        if (!book) {
            const fetchBooks = async () => {
                try {
                    const data = await api.post('/contents/content/books-menu');
                    const booksArray = Object.entries(data).map(([id, b]) => ({
                        id: parseInt(id),
                        ...b
                    }));
                    const currentBook = booksArray.find(b => b.id === parseInt(bookId));
                    setBook(currentBook);
                } catch (error) {
                    console.error('获取书籍列表失败:', error);
                }
            };

            fetchBooks();
        }

        // 获取阅读历史
        const fetchReadHistory = async () => {
            try {
                const data = await api.post('/contents/content/chapters-read', {
                    book_id: parseInt(bookId)
                });
                if (data.history) {
                    setReadHistory(data.history);
                }
            } catch (error) {
                console.error('获取阅读历史失败:', error);
            }
        };

        fetchReadHistory();
    }, [book, bookId]);

    const handleBack = () => {
        navigate('/');
    };

    const getChapterClassName = (chapter) => {
        if (!readHistory) return 'chapter-btn';
        
        const classes = ['chapter-btn'];
        if (readHistory.chapter_map[chapter]) {
            classes.push('read');
        }
        if (readHistory.last_chapter_id === chapter) {
            classes.push('last-read');
        }
        return classes.join(' ');
    };

    return (
        <div className="chapter-list">
            <button onClick={handleBack}>返回目录</button>
            <h2>{book?.name}</h2>
            <div className="chapters-grid">
                {Array.from({ length: book?.chapters || 0 }, (_, i) => i + 1).map(chapter => (
                    <button
                        key={chapter}
                        className={getChapterClassName(chapter)}
                        onClick={() => navigate(`/book/${bookId}/chapter/${chapter}`, {
                            state: { totalChapters: book?.chapters }
                        })}
                    >
                        第 {chapter} 章
                    </button>
                ))}
            </div>
        </div>
    );
}