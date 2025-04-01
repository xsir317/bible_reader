import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

export default function BookList() {
    const [books, setBooks] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        let isSubscribed = true;

        const fetchBooks = async () => {
            try {
                const data = await api.post('/contents/content/books-menu');
                if (isSubscribed) {
                    const booksArray = Object.entries(data).map(([id, book]) => ({
                        id: parseInt(id),
                        ...book
                    }));
                    setBooks(booksArray);
                }
            } catch (error) {
                console.error('获取书籍列表失败:', error);
            }
        };

        fetchBooks();

        return () => {
            isSubscribed = false;
        };
    }, []);

    return (
        <div className="book-list">
            {books.map(book => (
                <div
                    key={book.id}
                    className="book-item"
                    onClick={() => navigate(`/book/${book.id}`, { state: { book } })}
                >
                    <div className="book-short">{book.short}</div>
                    <div className="book-name">{book.name}</div>
                </div>
            ))}
        </div>
    );
}