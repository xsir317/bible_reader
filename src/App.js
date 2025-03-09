import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import BookList from './components/BookList';
import ChapterList from './components/ChapterList';
import ChapterContent from './components/ChapterContent';
import './App.css';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<BookList />} />
                    <Route path="book/:bookId" element={<ChapterList />} />
                    <Route path="book/:bookId/chapter/:chapterId" element={<ChapterContent />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;