import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Landing() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newAuthor, setNewAuthor] = useState('');
    const [newMessage, setNewMessage] = useState('');

    const loadMessages = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/guestbook');
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setMessages(data);
                } else {
                    setMessages([]); 
                }
            }
        } catch (err) {
        console.error('사용 후기를 불러오는 중 오류 발생:', err);
        setMessages([]); 
       }
    };
    useEffect(() => {
        loadMessages();
    }, []);

    // 사용 후기 DB에 저장
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newAuthor.trim() || !newMessage.trim()) return;

        try {
            const res = await fetch('http://localhost:8080/api/guestbook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ author: newAuthor, message: newMessage })
            });
            if (res.ok) {
                setNewAuthor('');
                setNewMessage('');
                loadMessages(); 
            }
        } catch (err) {
            alert('후기 등록에 실패했습니다.');
        }
    };

    return (
        <div style={{ backgroundColor: 'var(--bg-body)', minHeight: '100vh', color: 'var(--text-brown)', paddingBottom: '60px' }}>
            
            {/* 네비게이션 바 */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', backgroundColor: 'var(--bg-header)', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 100 }}>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: 'var(--text-brown)', letterSpacing: '-0.5px' }}>YAHO</h1>
                
                {/* 로그인 / 회원가입 버튼 */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        onClick={() => navigate('/login')} 
                        style={{ padding: '8px 24px', backgroundColor: 'transparent', color: 'var(--text-brown)', border: '2px solid var(--border-color)', borderRadius: '24px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseOver={(e) => { e.target.style.borderColor = 'var(--text-light)'; }}
                        onMouseOut={(e) => { e.target.style.borderColor = 'var(--border-color)'; }}
                    >
                        로그인
                    </button>
                    <button 
                        onClick={() => navigate('/signup')} 
                        style={{ padding: '8px 24px', backgroundColor: 'var(--point-gold)', color: '#ffffff', border: 'none', borderRadius: '24px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(203, 168, 116, 0.3)', transition: 'all 0.2s' }}
                        onMouseOver={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 16px rgba(203, 168, 116, 0.4)'; }}
                        onMouseOut={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 12px rgba(203, 168, 116, 0.3)'; }}
                    >
                        회원가입
                    </button>
                </div>
            </header>

            {/* 첫 화면? 맨 위에 뜨는 그거 (내비게이션 바 말고) */}
            <section style={{ 
                textAlign: 'center', 
                padding: '120px 20px',
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.75)), url('/image_1dda3d.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                color: '#ffffff'
            }}>
                <h2 style={{ fontSize: '46px', fontWeight: '900', marginBottom: '20px', lineHeight: '1.3', color: '#ffffff' }}>
                    당신의 완벽한 하루를 위한<br/>
                    <span style={{ color: 'var(--point-gold)' }}>일정 관리 사이트, YAHO</span>
                </h2>
                <p style={{ fontSize: '18px', color: '#dddddd', marginBottom: '50px', fontWeight: '500' }}>
                    자연어로 일정을 지시하고, 타임라인으로 하루를 한눈에 관리하세요.
                </p>
                <button 
                    onClick={() => navigate('/signup')} 
                    style={{ fontSize: '18px', padding: '16px 36px', borderRadius: '30px', backgroundColor: '#ffffff', color: 'var(--text-brown)', border: 'none', fontWeight: '800', cursor: 'pointer', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)', transition: 'all 0.3s' }}
                    onMouseOver={(e) => { e.target.style.transform = 'scale(1.05)'; }}
                    onMouseOut={(e) => { e.target.style.transform = 'scale(1)'; }}
                >
                    지금 바로 시작하기
                </button>
            </section>

            {/* 기능 소개 */}
            <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 20px' }}>
                <h3 style={{ textAlign: 'center', fontSize: '26px', fontWeight: '800', marginBottom: '40px' }}>주요 기능</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                    <div className="white-card" style={{ textAlign: 'center', padding: '40px 30px' }}>
                        <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: 'var(--point-gold)' }}>AI 스케줄러 챗봇</h4>
                        <p style={{ fontSize: '14px', color: 'var(--text-light)', lineHeight: '1.6' }}>"내일 오후 3시 회의 잡아줘" 한 마디면 일정이 자동 생성 및 제안됩니다.</p>
                    </div>
                    <div className="white-card" style={{ textAlign: 'center', padding: '40px 30px' }}>
                        <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: 'var(--point-gold)' }}>주간 타임라인</h4>
                        <p style={{ fontSize: '14px', color: 'var(--text-light)', lineHeight: '1.6' }}>드래그 앤 드롭으로 일정을 유연하게 이동하고 시간을 변경하세요.</p>
                    </div>
                    <div className="white-card" style={{ textAlign: 'center', padding: '40px 30px' }}>
                        <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: 'var(--point-gold)' }}>루틴 및 스트릭</h4>
                        <p style={{ fontSize: '14px', color: 'var(--text-light)', lineHeight: '1.6' }}>고정적인 루틴을 설정하고, 매일 달성하며 스트릭(연속 기록)을 쌓으세요.</p>
                    </div>
                </div>
            </section>

            <section style={{ maxWidth: '1000px', margin: '20px auto 60px', padding: '0 20px', textAlign: 'center' }}>
                <h3 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '30px' }}>팀 소개</h3>
                
                {/* 팀 소개 */}
                <div className="white-card" style={{ display: 'inline-block', padding: '40px 80px', marginBottom: '40px' }}>
                    <h4 style={{ color: 'var(--point-gold)', fontSize: '22px', fontWeight: '900', marginBottom: '16px' }}>Team YAHO</h4>
                    <p style={{ fontSize: '16px', color: 'var(--text-brown)', lineHeight: '1.8' }}>
                        당신의 흩어진 시간을 모아, <br/>더 나은 내일을 완성하는 스마트 스케줄링 메이커입니다.
                    </p>
                </div>

                {/* 팀원 소개 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    
                    <div className="white-card" style={{ textAlign: 'center', padding: '30px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--bg-body)', border: '1px solid var(--border-color)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: 'var(--point-gold)', fontWeight: 'bold' }}>
                            프론트
                        </div>
                        <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', color: 'var(--text-brown)' }}>박인정</h4>
                        <p style={{ fontSize: '14px', color: 'var(--text-light)', lineHeight: '1.6' }}>
                            사용자 인터페이스 구축<br/>UI/UX 디자인 총괄
                        </p>
                    </div>
                    <div className="white-card" style={{ textAlign: 'center', padding: '30px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--bg-body)', border: '1px solid var(--border-color)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: 'var(--point-gold)', fontWeight: 'bold' }}>
                            팀장
                        </div>
                        <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', color: 'var(--text-brown)' }}>최희원</h4>
                        <p style={{ fontSize: '14px', color: 'var(--text-light)', lineHeight: '1.6' }}>
                            타임라인 & 캘린더 로직 개발<br/>와이어프레임 작성
                        </p>
                    </div>
                    <div className="white-card" style={{ textAlign: 'center', padding: '30px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--bg-body)', border: '1px solid var(--border-color)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: 'var(--point-gold)', fontWeight: 'bold' }}>
                            백엔드
                        </div>
                        <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', color: 'var(--text-brown)' }}>문서연</h4>
                        <p style={{ fontSize: '14px', color: 'var(--text-light)', lineHeight: '1.6' }}>
                            로그인 & 로그아웃 구현<br/>AI 프롬프트 엔지니어링 담당
                        </p>
                    </div>

                </div>
            </section>

            {/* 사용 후기*/}
            <section style={{ maxWidth: '700px', margin: '0 auto', padding: '0 20px' }}>
                <div className="white-card">
                    <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>프로젝트 사용 후기</h3>
                    
                    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                        <input type="text" placeholder="작성자" value={newAuthor} onChange={e => setNewAuthor(e.target.value)} required style={{ width: '120px', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)', outline: 'none' }} />
                        <input type="text" placeholder="사용 후기를 남겨주세요." value={newMessage} onChange={e => setNewMessage(e.target.value)} required style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)', outline: 'none' }} />
                        <button type="submit" className="btn-submit" style={{ padding: '12px 24px', borderRadius: '10px', fontSize: '14px' }}>등록하기</button>
                    </form>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                        {messages.length === 0 ? (
                            <div style={{ textAlign: 'center', color: 'var(--text-light)', padding: '30px 0', fontSize: '15px' }}>첫 번째 사용 후기를 남겨보세요.</div>
                        ) : (
                            messages.map(msg => (
                                <div key={msg.id} style={{ padding: '16px', backgroundColor: 'var(--bg-body)', border: '1px solid var(--border-color)', borderRadius: '10px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '800', fontSize: '14px', color: 'var(--point-gold)', minWidth: '70px' }}>{msg.author}</span>
                                    <span style={{ fontSize: '15px', color: 'var(--text-brown)', lineHeight: '1.4' }}>{msg.message}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Landing;