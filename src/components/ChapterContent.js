import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api';

export default function ChapterContent() {
    const { bookId, chapterId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [verses, setVerses] = useState([]);
    const totalChapters = location.state?.totalChapters;

    useEffect(() => {
        api.post('/contents/content/chapter-content', {
            book_id: bookId,
            chapter_id: chapterId
        })
            .then(data => setVerses(data.verses));
    }, [bookId, chapterId]);

    const handleChapterChange = (delta) => {
        const newChapter = parseInt(chapterId) + delta;
        if (newChapter > 0 && newChapter <= totalChapters) {
            navigate(`/book/${bookId}/chapter/${newChapter}`, {
                state: { totalChapters }
            });
        }
    };

    // 修改后的按钮容器部分
    return (
        <div className="chapter-content">
            <div className="chapter-controls">
                <button onClick={() => navigate(-1)} className="back-btn">
                    返回
                </button>
                <div className="chapter-nav">
                    <button
                        onClick={() => handleChapterChange(-1)}
                        disabled={parseInt(chapterId) === 1}
                    >
                        上一章
                    </button>
                    <button
                        onClick={() => handleChapterChange(1)}
                        disabled={parseInt(chapterId) === totalChapters}
                    >
                        下一章
                    </button>
                </div>
            </div>
            <h3>第 {chapterId} 章</h3>
            <div className="verses">
                {verses.map(verse => (
                    <p key={verse.verse_num}>
                        <sup>{verse.verse_num}</sup> {verse.content}
                    </p>
                ))}
            </div>
        </div>
    );
}