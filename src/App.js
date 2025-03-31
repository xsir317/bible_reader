import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import BookList from './pages/Bible/index';
import ChapterList from './pages/Bible/ChapterList';
import ChapterContent from './pages/Bible/ChapterContent';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ReadingHistory from './pages/ReadingHistory';
import Favorites from './pages/Favorites';
import Notes from './pages/Notes';
import './App.css';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<BookList />} />
                    <Route path="book/:bookId" element={<ChapterList />} />
                    <Route path="book/:bookId/chapter/:chapterId" element={<ChapterContent />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="reading-history" element={<ReadingHistory />} />
                    <Route path="favorites" element={<Favorites />} />
                    <Route path="notes" element={<Notes />} />
                    <Route path="about" element={<div>关于我们</div>} />
                    <Route path="terms" element={<div>使用条款</div>} />
                    <Route path="privacy" element={<div>隐私政策</div>} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;