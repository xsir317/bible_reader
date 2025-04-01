import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Layout() {
    const [lastBiblePath, setLastBiblePath] = useState('/');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // 如果当前路径包含 book，则更新最后阅读位置
        if (location.pathname.includes('book')) {
            setLastBiblePath(location.pathname);
        }
    }, [location]);

    const handleBibleClick = (e) => {
        e.preventDefault();
        navigate(lastBiblePath);
    };

    return (
        <div className="app-container">
            <div className="content">
                <Outlet />
            </div>
            <nav className="tabs">
                <Link to={lastBiblePath} onClick={handleBibleClick}>阅读圣经</Link>
                <Link to="/profile">我的</Link>
            </nav>
        </div>
    );
}