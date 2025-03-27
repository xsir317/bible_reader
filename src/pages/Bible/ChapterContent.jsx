import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../api';
import './ChapterContent.css';

export default function ChapterContent() {
    const { bookId, chapterId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [verses, setVerses] = useState([]);
    const [explains, setExplains] = useState([]);
    const [activeExplain, setActiveExplain] = useState(null);
    // 新增状态
    const [notes, setNotes] = useState({});
    const [collectVerses, setCollectVerses] = useState([]);
    const totalChapters = location.state?.totalChapters;

    useEffect(() => {
        api.post('/contents/content/chapter-content', {
            book_id: bookId,
            chapter_id: chapterId
        })
            .then(data => {
                setVerses(data.verses);
                setExplains(data.explains || []);
                setNotes(data.notes || {});
                setCollectVerses(data.collect_verses || []);
                setActiveExplain(null);
            });
    }, [bookId, chapterId]);

    const getExplainForVerse = (verseNum) => {
        return explains.find(exp => 
            verseNum >= exp.start_verse && verseNum <= exp.end_verse
        );
    };

    const handleChapterChange = (delta) => {
        const newChapter = parseInt(chapterId) + delta;
        if (newChapter > 0 && newChapter <= totalChapters) {
            navigate(`/book/${bookId}/chapter/${newChapter}`, {
                state: { totalChapters }
            });
        }
    };

    const handleBack = () => {
        navigate(`/book/${bookId}`, {
            state: { book: location.state?.book }
        });
    };

    // 添加一个函数来组织verses
    const groupVersesByExplain = () => {
        const groups = [];
        let currentGroup = [];
        let currentExplain = null;

        verses.forEach(verse => {
            const explain = getExplainForVerse(verse.verse_num);
            
            if (explain !== currentExplain) {
                if (currentGroup.length > 0) {
                    groups.push({
                        verses: currentGroup,
                        explain: currentExplain
                    });
                    currentGroup = [];
                }
                currentExplain = explain;
            }
            
            currentGroup.push(verse);
        });

        if (currentGroup.length > 0) {
            groups.push({
                verses: currentGroup,
                explain: currentExplain
            });
        }

        return groups;
    };

    return (
        <div className="chapter-content">
            <div className="chapter-controls">
                <button onClick={handleBack} className="back-btn">
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
                {groupVersesByExplain().map(group => {
                    const isActive = group.explain && 
                        activeExplain?.start_verse === group.explain.start_verse;
                    
                    return (
                        <div key={group.verses[0].verse_num}>
                            <div 
                                onClick={() => group.explain && setActiveExplain(
                                    isActive ? null : group.explain
                                )}
                                className={`verse-group ${group.explain ? 'has-explain' : ''} ${isActive ? 'active' : ''}`}
                                style={{ cursor: group.explain ? 'pointer' : 'default' }}
                            >
                                {group.verses.map(verse => {
                                    const hasNote = notes[verse.verse_num];
                                    const isCollected = collectVerses.includes(verse.verse_num);
                                    
                                    return (
                                        <p 
                                            key={verse.verse_num}
                                            className={`${isCollected ? 'collected' : ''}`}
                                        >
                                            <sup>{verse.verse_num}</sup> 
                                            {verse.content}
                                            {hasNote && <span className="note-indicator">•</span>}
                                        </p>
                                    );
                                })}
                            </div>
                            {isActive && (
                                <div className="verse-explain">
                                    {group.explain.explain_txt}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}