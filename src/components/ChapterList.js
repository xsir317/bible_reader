import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api';

export default function ChapterList() {
    const { bookId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [book, setBook] = useState(location.state?.book);

    useEffect(() => {
        if (!book) {
            api.get('/contents/content/books-menu')
                .then(data => {
                    const booksArray = Object.entries(data).map(([id, b]) => ({
                        id: parseInt(id),
                        ...b
                    }));
                    const currentBook = booksArray.find(b => b.id === parseInt(bookId));
                    setBook(currentBook);
                });
        }
    }, [book, bookId]);

    return (
        <div className="chapter-list">
            <button onClick={() => navigate(-1)}>返回目录</button>
            <h2>{book?.name}</h2>
            <div className="chapters-grid">
                {Array.from({ length: book?.chapters || 0 }, (_, i) => i + 1).map(chapter => (
                    <button
                        key={chapter}
                        className="chapter-btn"
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