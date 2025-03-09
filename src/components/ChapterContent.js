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
        api.get(`contents/content/chapter-content?book_id=${bookId}&chapter_id=${chapterId}`)
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

    return (
        <div className="chapter-content">
            <button onClick={() => navigate(-1)}>返回章节列表</button>
            <div className="navigation">
                <button
                    onClick={() => handleChapterChange(-1)}
                    disabled={parseInt(chapterId) === 1}
                >
                    上一章
                </button>
                <h3>第 {chapterId} 章</h3>
                <button
                    onClick={() => handleChapterChange(1)}
                    disabled={parseInt(chapterId) === totalChapters}
                >
                    下一章
                </button>
            </div>
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