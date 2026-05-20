import React, { useEffect, useState } from 'react';
import { request } from '../api';

const categoryColors = {
    '회의': 'bg-pastel-blue',
    '공부': 'bg-pastel-green',
    '약속': 'bg-pastel-orange',
    '운동': 'bg-pastel-purple',
    '기타': 'bg-pastel-yellow'
};

function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [scheduleList, setScheduleList] = useState([]);
    const [fixedList, setFixedList] = useState([]);

    useEffect(() => {
        request('/schedule/calendar').then(data => {
            setScheduleList(data.scheduleList || []);
            setFixedList(data.fixedList || []);
        });
    }, []);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    // 달력 셀(Grid) 생성 로직
    const cells = [];
    for (let i = 0; i < firstDayIndex; i++) {
        cells.push(<div key={`empty-${i}`} className="cal-cell empty"></div>);
    }

    for (let d = 1; d <= lastDay; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        
        // 1. 해당 날짜의 일반 일정 필터링
        const dayEvents = scheduleList.filter(s => s.date === dateStr);

        // 2. 해당 날짜 요일에 해당하는 고정 일정 추적 및 병합
        const cellDate = new Date(year, month, d);
        const jsDay = cellDate.getDay(); // 0=일요일, 1=월요일, ..., 6=토요일
        const fDayOfWeek = jsDay === 0 ? 6 : jsDay - 1; // DB 규격 매핑: 0=월요일 ~ 6=일요일

        const dayFixedEvents = fixedList.filter(f => {
            if (f.dayOfWeek !== fDayOfWeek) return false;
            if (f.endDate && f.endDate < dateStr) return false; // 종료 기한 체크
            return true;
        }).map(f => ({
            id: `fixed-${f.id}-${dateStr}`,
            title: `📌 ${f.title}`,
            startTime: f.startTime,
            category: f.category,
            isFixed: true
        }));

        // 3. 일반 일정과 고정 일정을 합치고 시간순 정렬
        const allDayEvents = [...dayEvents, ...dayFixedEvents].sort((a, b) => {
            if (!a.startTime) return 1;
            if (!b.startTime) return -1;
            return a.startTime.localeCompare(b.startTime);
        });

        const dow = (firstDayIndex + d - 1) % 7;

        let dateClass = 'cal-date';
        const today = new Date();
        if (d === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dateClass += ' is-today';
        } else if (dow === 0) dateClass += ' text-red';
        else if (dow === 6) dateClass += ' text-blue';

        cells.push(
            <div key={d} className="cal-cell">
                <div className={dateClass}>{d}</div>
                <div className="cal-events">
                    {allDayEvents.map((evt) => {
                        const bgClass = categoryColors[evt.category] || 'bg-pastel-green';
                        return (
                            <div key={evt.id} className={`cal-event-chip ${bgClass}`}>
                                <span className="time">{evt.startTime?.substring(0, 5)}</span> {evt.title}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="section-title">월간 캘린더</div>
            <div className="calendar-controls">
                <button className="btn-cal-nav" onClick={prevMonth}>◀</button>
                <h2 className="calendar-title">{year}년 {month + 1}월</h2>
                <button className="btn-cal-nav" onClick={nextMonth}>▶</button>
            </div>
            <div className="calendar-wrapper">
                <div className="calendar-header-row">
                    <div className="cal-day-name text-red">일</div>
                    <div className="cal-day-name">월</div>
                    <div className="cal-day-name">화</div>
                    <div className="cal-day-name">수</div>
                    <div className="cal-day-name">목</div>
                    <div className="cal-day-name">금</div>
                    <div className="cal-day-name text-blue">토</div>
                </div>
                <div className="calendar-grid">{cells}</div>
            </div>
        </>
    );
}

export default Calendar;