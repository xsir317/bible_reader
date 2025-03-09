import { Outlet, Link } from 'react-router-dom';

export default function Layout() {
    return (
        <div className="app-container">
            <nav className="tabs">
                <Link to="/">阅读圣经</Link>
                <Link to="/my">我的</Link>
            </nav>
            <div className="content">
                <Outlet />
            </div>
        </div>
    );
}