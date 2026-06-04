import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { request } from '../api';

function Sidebar({ isOpen, setIsSidebarOpen }) {
    const [streakDays, setStreakDays] = useState(0);
    const [currentDateStr, setCurrentDateStr] = useState('');
    const location = useLocation();

    useEffect(() => {
        // 스트릭 일수 동기화
        request('/user/me')
            .then(data => {
                setStreakDays(data.streak || 0);
            })
            .catch(() => {
                setStreakDays(0);
            });

        // 오늘 날짜 라벨 실시간 계산 처리
        const today = new Date();
        const mm = today.getMonth() + 1;
        const dd = today.getDate();
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        const dayLabel = days[today.getDay()];
        setCurrentDateStr(`${mm}.${dd} (${dayLabel})`);
    }, 
    [isOpen, location.pathname]); 

    const getMenuClass = ({ isActive }) => isActive ? "menu-item active" : "menu-item";

    const handleMenuClick = () => {
        if(setIsSidebarOpen) setIsSidebarOpen(false);
    };

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-logo">
                <h2>YAHO <span>일정 관리</span></h2>
            </div>
            
            <nav className="sidebar-nav">
                <NavLink to="/" className={getMenuClass} onClick={handleMenuClick}>🏠 홈</NavLink>
                <NavLink to="/timeline" className={getMenuClass} onClick={handleMenuClick}>⏳ 타임라인</NavLink>
                <NavLink to="/calendar" className={getMenuClass} onClick={handleMenuClick}>📆 캘린더</NavLink>
                <NavLink to="/gemini" className={getMenuClass} onClick={handleMenuClick}>🤖 AI 비서</NavLink>
                <NavLink to="/mypage" className={getMenuClass} onClick={handleMenuClick}>👤 마이페이지</NavLink>
            </nav>

            <div className="sidebar-bottom">
                <div className="streak-card">
                    <span className="icon">🔥</span>
                    <div className="text">연속 일정 달성</div>
                    <div className="days">{streakDays}<span>일</span></div>
                    <div className="date">{currentDateStr}</div>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;