import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import BookList from './pages/Bible';
import ChapterList from './pages/Bible/ChapterList';
import ChapterContent from './pages/Bible/ChapterContent';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<BookList />} />
          <Route path="book/:bookId" element={<ChapterList />} />
          <Route path="book/:bookId/chapter/:chapterId" element={<ChapterContent />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;