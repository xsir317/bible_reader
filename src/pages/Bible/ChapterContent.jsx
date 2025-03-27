import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../api';
import './ChapterContent.css';
import { Popover, IconButton } from '@mui/material';

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

    // 新增 state 用于控制 Popover
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedVerse, setSelectedVerse] = useState(null);
    const [longPressTimer, setLongPressTimer] = useState(null);

    // 处理长按开始
    const handlePressStart = (event, verse) => {
        event.preventDefault(); // 防止默认行为
        const timer = setTimeout(() => {
            handleVerseAction(event, verse);
        }, 500); // 500ms 长按阈值
        setLongPressTimer(timer);
    };

    // 处理长按结束
    const handlePressEnd = () => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            setLongPressTimer(null);
        }
    };

    // 处理右键菜单
    const handleContextMenu = (event, verse) => {
        event.preventDefault();
        handleVerseAction(event, verse);
    };

    // 处理经文操作
    const handleVerseAction = (event, verse) => {
        setSelectedVerse(verse);
        setAnchorEl(event.currentTarget);
    };

    // 关闭 Popover
    const handleClose = () => {
        setAnchorEl(null);
        setSelectedVerse(null);
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
                                            onMouseDown={(e) => handlePressStart(e, verse)}
                                            onMouseUp={handlePressEnd}
                                            onMouseLeave={handlePressEnd}
                                            onTouchStart={(e) => handlePressStart(e, verse)}
                                            onTouchEnd={handlePressEnd}
                                            onContextMenu={(e) => handleContextMenu(e, verse)}
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

            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <div className="verse-actions">
                    <button 
                        onClick={() => {
                            // TODO: 实现收藏/取消收藏功能
                            handleClose();
                        }}
                    >
                        {collectVerses.includes(selectedVerse?.verse_num) ? '取消收藏' : '收藏'}
                    </button>
                    <button 
                        onClick={() => {
                            // TODO: 实现笔记功能
                            handleClose();
                        }}
                    >
                        {notes[selectedVerse?.verse_num] ? '编辑笔记' : '添加笔记'}
                    </button>
                    {notes[selectedVerse?.verse_num] && (
                        <div className="existing-note">
                            {notes[selectedVerse.verse_num]}
                        </div>
                    )}
                </div>
            </Popover>
        </div>
    );
}