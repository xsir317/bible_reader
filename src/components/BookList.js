import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function BookList() {
    const [books, setBooks] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/contents/content/books-menu')
            .then(data => {
                const booksArray = Object.entries(data).map(([id, book]) => ({
                    id: parseInt(id),
                    ...book
                }));
                setBooks(booksArray);
            });
    }, []);

    return (
        <div className="book-list">
            {books.map(book => (
                <div
                    key={book.id}
                    className="book-item"
                    onClick={() => navigate(`/book/${book.id}`, { state: { book } })}
                >
                    <h3>{book.name}</h3>
                    <p>共 {book.chapters} 章</p>
                </div>
            ))}
        </div>
    );
}