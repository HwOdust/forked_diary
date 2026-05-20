import React, { useEffect, useState } from 'react';
import { request } from '../api';

// ✨ 카테고리별 파스텔톤 배경색 고정 매핑
const categoryColors = {
    '회의': 'bg-pastel-blue',
    '공부': 'bg-pastel-green',
    '약속': 'bg-pastel-orange',
    '운동': 'bg-pastel-purple',
    '기타': 'bg-pastel-yellow'
};


function Timeline() {
    const [scheduleList, setScheduleList] = useState([]);
    const [fixedList, setFixedList] = useState([]);
    const [aiMessage, setAiMessage] = useState('');
    const [isFixedFormOpen, setIsFixedFormOpen] = useState(false);

    // 모달 상태
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState({ id: '', title: '', date: '', startTime: '', endTime: '' });

    // 시간표 범위 상수 설정 (픽셀 매핑용)
    const PX_PER_HOUR = 60;
    const startH = 9; 

    const dayMap = [1, 2, 3, 4, 5, 6, 0]; // 월요일부터 일요일순 정렬 매핑
    const dayLabels = ['월', '화', '수', '목', '금', '토', '일'];

    const loadData = () => {
        request('/schedule/timeline').then(data => {
            setScheduleList(data.scheduleList);
            setFixedList(data.fixedList);
        });
    };

    useEffect(() => { loadData(); }, []);

    // AI 일정 추가
    const handleAiSubmit = async (e) => {
        e.preventDefault();
        try {
            await request('/schedule/ai', { method: 'POST', body: { message: aiMessage } });
            setAiMessage('');
            loadData();
        } catch (err) { alert(err.message); }
    };

    // 일반 일정 수정 저장
    const handleUpdateSchedule = async (e) => {
        e.preventDefault();
        try {
            await request('/schedule/update', { method: 'PUT', body: selectedEvent });
            setModalOpen(false);
            loadData();
        } catch (err) { alert(err.message); }
    };

    // 일반 일정 삭제
    const handleDeleteSchedule = async () => {
        if (!window.confirm('정말 삭제할까요?')) return;
        try {
            await request(`/schedule/delete/${selectedEvent.id}`, { method: 'DELETE' });
            setModalOpen(false);
            loadData();
        } catch (err) { alert(err.message); }
    };

    // 고정 일정 추가
    const handleAddFixed = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const body = Object.fromEntries(formData.entries());
        try {
            await request('/fixed/add', { method: 'POST', body });
            setIsFixedFormOpen(false);
            loadData();
        } catch (err) { alert(err.message); }
    };

    // 고정 일정 삭제
    const handleDeleteFixed = async (id) => {
        if (!window.confirm('정말 삭제할까요?')) return;
        try {
            await request(`/fixed/delete/${id}`, { method: 'DELETE' });
            loadData();
        } catch (err) { alert(err.message); }
    };

    // 위치 픽셀 계산 유틸 함수
    const getPos = (startTimeStr, endTimeStr) => {
        if (!startTimeStr) return { top: 0, height: 60 };
        const [hh, mm] = startTimeStr.split(':').map(Number);
        const startFloat = hh + mm / 60;
        const top = (startFloat - startH) * PX_PER_HOUR + 1;

        let height = PX_PER_HOUR;
        if (endTimeStr) {
            const [eh, em] = endTimeStr.split(':').map(Number);
            const duration = (eh + em / 60) - startFloat;
            if (duration > 0) height = duration * PX_PER_HOUR - 2;
        }
        return { top: `${top}px`, height: `${height}px` };
    };

    const currentDayOfWeek = new Date().getDay();

    return (
        <>
            <div className="section-title">주간 일정 관리 &amp; 시간표</div>

            {/* AI 입력 폼 */}
            <div className="ai-form-container">
                <form onSubmit={handleAiSubmit} className="ai-form">
                    <input type="text" className="ai-input" placeholder="예: 이번주 금요일 오후 3시에 회의 추가" value={aiMessage} onChange={(e) => setAiMessage(e.target.value)} required />
                    <button type="submit" className="btn-ai">✨ AI 일정 추가</button>
                </form>
            </div>

            <div className="timeline-layout">
                {/* 왼쪽 사이드 패널: 고정일정 관리 */}
                <div className="fixed-panel">
                    <div className="fixed-panel-header">📌 고정 일정</div>
                    <div className="fixed-panel-body">
                        <button className="btn-fixed-add-toggle" onClick={() => setIsFixedFormOpen(!isFixedFormOpen)}>+ 고정 일정 추가</button>
                        
                        {isFixedFormOpen && (
                            <form onSubmit={handleAddFixed} className="fixed-add-form open">
                                <label>일정 이름</label><input type="text" name="title" required />
                                <label>요일</label>
                                <select name="dayOfWeek" required>
                                    {dayLabels.map((l, i) => <option key={i} value={i}>{l}요일</option>)}
                                </select>
                                <label>시작 시간</label>
                                <select name="startTime" required>
                                    <option value="09:00">09시</option><option value="10:00">10시</option>
                                    <option value="11:00">11시</option><option value="12:00">12시</option>
                                    <option value="13:00">13시</option><option value="14:00">14시</option>
                                    <option value="15:00">15시</option><option value="16:00">16시</option>
                                    <option value="17:00">17시</option><option value="18:00">18시</option>
                                </select>
                                <label>종료 시간</label>
                                <select name="endTime" required>
                                    <option value="10:00">10시</option><option value="11:00">11시</option>
                                    <option value="12:00">12시</option><option value="13:00">13시</option>
                                    <option value="14:00">14시</option><option value="15:00">15시</option>
                                    <option value="16:00">16시</option><option value="17:00">17시</option>
                                    <option value="18:00">18시</option><option value="19:00">19시</option>
                                </select>
                                <label>카테고리</label>
                                <select name="category" required>
                                    {['회의', '공부', '약속', '운동', '기타'].map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                                <label>기한 (비워두면 무기한)</label><input type="date" name="endDate" />
                                <button type="submit" className="btn-fixed-submit">✅ 추가</button>
                            </form>
                        )}

                        {fixedList.map(f => (
                            <div key={f.id} className={`fixed-item-card cat-${f.category}`}>
                                <div className="f-title">{f.title}</div>
                                <div className="f-day">{dayLabels[f.dayOfWeek]}요일</div>
                                <div className="f-time">{f.startTime} ~ {f.endTime}</div>
                                <button className="btn-fixed-del" onClick={() => handleDeleteFixed(f.id)}>🗑 삭제</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 메인 시간표 Grid 구역 */}
                <div className="timetable-wrapper">
                    <div className="timetable">
                        <div className="time-col">
                            <div className="time-header"></div>
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="time-slot">{String(startH + i).padStart(2, '0')}:00</div>
                            ))}
                        </div>

                        {dayMap.map((dayIdx, idx) => {
                            const isToday = currentDayOfWeek === dayIdx;
                            
                            // 해당 요일의 일반 일정 필터링
                            const daySchedules = scheduleList.filter(s => new Date(s.date).getDay() === dayIdx);
                            // 해당 요일의 고정 일정 필터링
                            const dayFixed = fixedList.filter(f => f.dayOfWeek === (dayIdx === 0 ? 6 : dayIdx - 1));

                            return (
                                <div key={dayIdx} className={`day-col ${isToday ? 'is-today' : ''}`}>
                                    <div className="day-header">{dayLabels[idx]}</div>
                                    <div className="day-grid" style={{ height: `${10 * PX_PER_HOUR}px` }}>
                                        {/* 일반 일정 렌더링 */}
                                        {daySchedules.map((s) => {
                                            const { top, height } = getPos(s.startTime, s.endTime);
                                            // ✨ 흰색으로 깨지지 않도록 카테고리 고정 파스텔 컬러 적용
                                            const bgClass = categoryColors[s.category] || 'bg-pastel-green';

                                            return (
                                                <div key={s.id} className={`timetable-event ${bgClass}`} style={{ top, height, cursor: 'pointer' }} onClick={() => {
                                                    setSelectedEvent({ id: s.id, title: s.title, date: s.date, startTime: s.startTime.substring(0, 5), endTime: s.endTime ? s.endTime.substring(0, 5) : '' });
                                                    setModalOpen(true);
                                                }}>
                                                    {s.title}
                                                </div>
                                            );
                                        })}
                                        {/* 고정 일정 렌더링 */}
                                        {dayFixed.map((f) => {
                                            const { top, height } = getPos(f.startTime, f.endTime);
                                            return (
                                                <div key={f.id} className="timetable-event bg-pastel-yellow" style={{ top, height, opacity: 0.7, borderLeft: '3px solid #C5A065', fontSize: '11px' }}>
                                                    📌 {f.title}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* 일정 수정 모달 */}
            {modalOpen && (
                <div className="modal-overlay show">
                    <div className="modal-content">
                        <h3>📅 일정 수정</h3>
                        <form onSubmit={handleUpdateSchedule}>
                            <div className="form-group">
                                <label>제목</label>
                                <input type="text" value={selectedEvent.title} onChange={e => setSelectedEvent({ ...selectedEvent, title: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>날짜</label>
                                <input type="date" value={selectedEvent.date} onChange={e => setSelectedEvent({ ...selectedEvent, date: e.target.value })} required />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input type="time" value={selectedEvent.startTime} onChange={e => setSelectedEvent({ ...selectedEvent, startTime: e.target.value })} required />
                                <input type="time" value={selectedEvent.endTime} onChange={e => setSelectedEvent({ ...selectedEvent, endTime: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                <button type="submit" className="btn-auth">💾 저장</button>
                                <button type="button" className="btn-auth" style={{ backgroundColor: '#e74c3c' }} onClick={handleDeleteSchedule}>🗑 삭제</button>
                            </div>
                            <button type="button" className="btn-auth" style={{ backgroundColor: '#ccc', marginTop: '5px' }} onClick={() => setModalOpen(false)}>닫기</button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default Timeline;