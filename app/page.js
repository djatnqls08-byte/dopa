// app/page.js
"use client";

import { useState } from "react";
import { THEME_PALETTES, GLASS_STYLE } from "@/lib/themes";
import PhoneDrawer from "@/components/PhoneDrawer";
import SecretBoard from "@/components/SecretBoard";

export default function GameClient() {
  // 1. 테마 및 온보딩
  const [themeMode] = useState("rose");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = isDarkMode ? THEME_PALETTES[themeMode].dark : THEME_PALETTES[themeMode].light;

  const [gameState, setGameState] = useState("TITLE"); // "TITLE" | "PLAY"
  const [pcName, setPcName] = useState("서지언");
  const [pcJob, setPcJob] = useState("기획실 비서");

  // 2. 인게임 세션 진행 상태
  const [day, setDay] = useState(1);
  const [phase, setPhase] = useState("저녁");
  const [tension, setTension] = useState(25); // 호감도 / 정서적 유대

  // 3. 서사 기록 (소설 단락 구조)
  const [storyParagraphs, setStoryParagraphs] = useState([
    {
      id: 1,
      type: "narration",
      text: "지하 주차장 A구역의 서늘한 공기 사이로, 익숙한 검은색 세단의 비상등이 규칙적인 궤적을 그리며 붉게 점멸합니다.\n\n발소리를 죽이며 다가서자 운전석의 창문이 매끄럽게 내려앉고, 차가운 유리창 너머로 서류철을 정리하던 백서원 팀장의 시선이 당신에게 머뭅니다."
    },
    {
      id: 2,
      type: "dialogue",
      speaker: "백서원",
      text: "“지언 씨. 퇴근 시간 딱 맞춰 내려왔네요. 조수석 문 열어뒀으니 타요.”"
    },
    {
      id: 3,
      type: "narration",
      text: "단정하게 빗어 넘긴 흑발 사이로 드러난 귓바퀴가 서늘한 냉기에 엷게 붉어져 있습니다. 평소와 다름없는 무감한 어조였지만, 핸들을 쥔 손가락 끝이 미세하게 굳어 있는 것이 눈에 밟힙니다."
    }
  ]);

  const [inputAction, setInputAction] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 4. 모달 서랍 상태 (메신저 & 비밀 보드)
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [isBoardOpen, setIsBoardOpen] = useState(false);

  // 5. 시크릿 핸드아웃 (구 인세인/CoC 단서)
  const [handouts, setHandouts] = useState([
    { 
      id: 1, 
      title: "백서원의 알리바이", 
      overview: "오늘 저녁 회의 직후 줄곧 지하 주차장에서 대기했다고 진술함.", 
      secret: "18시 10분경, 3층 기획조정실 보안 단말기에 그녀의 사원증이 태그된 로그가 남아있다.", 
      revealed: true, 
      isFlipped: false 
    },
    { 
      id: 2, 
      title: "조수석 틈새의 갈색 서류봉투", 
      overview: "밀봉 테이프가 단단히 붙어 있는 서류 봉투. 겉면에 수신인이 적혀 있지 않다.", 
      secret: "경쟁사 로고가 압인된 기밀 이직 계약서 초안과 자문 내역서.", 
      revealed: false, 
      isFlipped: false 
    }
  ]);

  // 스마트폰 서랍 전용 1:1 메신저 내역 (오직 폰 서랍 안에서만 말풍선으로 작동)
  const [phoneChats, setPhoneChats] = useState([
    { sender: "npc", text: "지언 씨, 퇴근 준비 다 하셨어요?", time: "18:30" },
    { sender: "npc", text: "A구역 세단 시동 걸어뒀으니 천천히 내려와요.", time: "18:31" }
  ]);

  // 행동 및 대사 전송 (소설의 다음 단락으로 자연스럽게 이어짐)
  const handleSendAction = async (textToSend = inputAction) => {
    if (!textToSend.trim() || isLoading) return;
    const userPrompt = textToSend.trim();
    setInputAction("");

    // 유저의 행동/대사를 소설 속 한 문단으로 삽입
    const nextUserEntry = {
      id: Date.now(),
      type: "user",
      text: userPrompt.startsWith("“") || userPrompt.startsWith("\"") ? userPrompt : `“${userPrompt}”`
    };

    const nextStory = [...storyParagraphs, nextUserEntry];
    setStoryParagraphs(nextStory);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextStory.map(p => ({ role: p.type === "user" ? "user" : "model", text: p.text })),
          playerSheet: { name: pcName, job: pcJob },
          currentPhase: phase,
          ruleMode: "dating"
        })
      });
      const data = await res.json();
      
      // AI 응답도 챗봇 말풍선이 아니라 소설 본문 문단으로 삽입
      setStoryParagraphs([
        ...nextStory,
        {
          id: Date.now() + 1,
          type: "narration",
          text: data.text || "차창 밖으로 빗방울이 번져가며 무거운 침묵이 흐릅니다."
        }
      ]);
    } catch (e) {
      setStoryParagraphs([
        ...nextStory,
        { id: Date.now() + 1, type: "narration", text: "잠시 통신이 끊기며 차창 밖 빗소리만이 귓가를 맴돕니다." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlipCard = (id) => {
    setHandouts(prev => prev.map(h => h.id === id ? { ...h, isFlipped: !h.isFlipped } : h));
  };

  // ── [1] 타이틀 및 주인공 프로필 설정 ──
  if (gameState === "TITLE") {
    return (
      <main style={{ minHeight: "100dvh", background: theme.bg, color: theme.text, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "24px" }}>
        <div style={{ ...GLASS_STYLE, width: "100%", maxWidth: "380px", backgroundColor: theme.glassPanel, border: `1.5px solid ${theme.borderHighlight}`, borderRadius: "28px", padding: "36px 24px", textAlign: "center" }}>
          <div style={{ fontSize: "2.2rem", marginBottom: "8px" }}>🗝️</div>
          <h1 style={{ margin: "0 0 6px 0", fontSize: "1.45rem", fontWeight: "900", letterSpacing: "-0.5px" }}>시크릿 노벨</h1>
          <p style={{ margin: "0 0 24px 0", fontSize: "0.8rem", color: theme.textMuted }}>비밀을 밝혀내는 감성 인터랙티브 서사</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", textAlign: "left", marginBottom: "24px" }}>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: "800", color: theme.accent, display: "block", marginBottom: "4px" }}>주인공 이름</label>
              <input 
                type="text" value={pcName} onChange={e => setPcName(e.target.value)} 
                style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: "12px", border: `1px solid ${theme.border}`, backgroundColor: theme.glassPanelAlt, color: theme.text, outline: "none", fontSize: "0.88rem" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: "800", color: theme.accent, display: "block", marginBottom: "4px" }}>직업 / 신분</label>
              <input 
                type="text" value={pcJob} onChange={e => setPcJob(e.target.value)} 
                style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: "12px", border: `1px solid ${theme.border}`, backgroundColor: theme.glassPanelAlt, color: theme.text, outline: "none", fontSize: "0.88rem" }}
              />
            </div>
          </div>

          <button 
            onClick={() => setGameState("PLAY")}
            style={{ width: "100%", padding: "14px", borderRadius: "16px", border: "none", backgroundColor: theme.accent, color: "#fff", fontWeight: "800", fontSize: "0.95rem", cursor: "pointer", boxShadow: theme.accentGlow }}
          >
            이야기 시작하기 ➔
          </button>
        </div>
      </main>
    );
  }

  // ── [2] 본편: 전자책 소설 캔버스 뷰 ──
  return (
    <main style={{ minHeight: "100dvh", background: theme.bg, color: theme.text, display: "flex", flexDirection: "column", position: "relative" }}>
      
      {/* 리디바탕 웹폰트 및 소설 타이포그래피 스타일 */}
      <style>{`
        @import url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_twelve@1.0/RIDIBatang.woff');
        .novel-reader {
          font-family: 'RIDIBatang', 'KoPub Batang', serif;
          line-height: 2.1;
          letter-spacing: -0.015em;
          word-break: keep-all;
        }
      `}</style>

      {/* 상단 정갈한 시스템 헤더 */}
      <header style={{ ...GLASS_STYLE, height: "52px", padding: "0 18px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.glassPanel, position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: "800", padding: "3px 8px", borderRadius: "8px", backgroundColor: theme.glassPanelAlt, border: `1px solid ${theme.border}` }}>
            🕒 {day}일차 [{phase}]
          </span>
          <span style={{ fontSize: "0.75rem", color: theme.danger, fontWeight: "800" }}>
            ♥ 텐션 {tension}%
          </span>
        </div>

        {/* 우측 퀵 액션 (증거보드, 스마트폰 메신저 서랍, 다크모드) */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button onClick={() => setIsBoardOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.15rem", padding: "4px" }} title="사건 증거 / 비밀 보드">📌</button>
          <button onClick={() => setIsPhoneOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.15rem", padding: "4px" }} title="스마트폰 메신저 열기">📱</button>
          <button onClick={() => setIsDarkMode(!isDarkMode)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.15rem", padding: "4px" }}>{isDarkMode ? "☀️" : "🌙"}</button>
        </div>
      </header>

      {/* 소설 본문 리더 영역 (이름표나 말풍선 없이 흐르는 순수 문학 캔버스) */}
      <section className="novel-reader" style={{ flex: 1, overflowY: "auto", padding: "28px 22px 90px 22px", display: "flex", flexDirection: "column", gap: "22px" }}>
        
        {/* 장르 소설 챕터 서두 느낌의 미니 배너 */}
        <div style={{ textAlign: "center", margin: "10px 0 16px 0", opacity: 0.65 }}>
          <div style={{ fontSize: "0.72rem", letterSpacing: "3px", textTransform: "uppercase" }}>Chapter I</div>
          <div style={{ width: "24px", height: "1px", backgroundColor: theme.accent, margin: "6px auto 0" }} />
        </div>

        {storyParagraphs.map((entry) => {
          // 유저가 한 대사나 행동: 주인공의 호흡을 살린 인용 단락
          if (entry.type === "user") {
            return (
              <div 
                key={entry.id}
                style={{
                  padding: "12px 18px",
                  borderRadius: "14px",
                  backgroundColor: theme.glassPanelAlt,
                  borderLeft: `3px solid ${theme.accent}`,
                  fontSize: "0.94rem",
                  color: theme.accent,
                  fontWeight: "700"
                }}
              >
                {entry.text}
              </div>
            );
          }

          // 소설 본문 지문 및 인물들의 대사: 유려한 줄글
          return (
            <div 
              key={entry.id}
              style={{
                fontSize: "0.96rem",
                color: theme.text,
                textIndent: "0.4em"
              }}
            >
              {entry.text}
            </div>
          );
        })}

        {isLoading && (
          <div style={{ textAlign: "center", color: theme.accent, fontSize: "0.82rem", fontStyle: "italic", padding: "16px 0", opacity: 0.8 }}>
            침묵 속에서 펜촉이 종이를 스치듯, 서사가 이어지는 중……
          </div>
        )}
      </section>

      {/* 하단 캡슐형 입력 바 (소설 속에 내 대사나 행동을 적어 넣는 슬림 인터페이스) */}
      <footer style={{ position: "sticky", bottom: 0, padding: "12px 16px max(14px, env(safe-area-inset-bottom, 14px))", backgroundColor: "transparent", display: "flex", justifyContent: "center" }}>
        <div style={{ ...GLASS_STYLE, width: "100%", maxWidth: "480px", display: "flex", alignItems: "center", backgroundColor: theme.glassPanelAlt, border: `1.5px solid ${theme.borderHighlight}`, borderRadius: "30px", padding: "4px 8px 4px 16px" }}>
          <input 
            type="text"
            value={inputAction}
            onChange={e => setInputAction(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSendAction(); }}
            placeholder="주인공의 대사나 행동을 서술하세요..."
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: theme.text, fontSize: "0.9rem", fontFamily: "inherit" }}
          />
          <button 
            onClick={() => handleSendAction()}
            disabled={isLoading || !inputAction.trim()}
            style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: inputAction.trim() ? theme.accent : "rgba(160, 160, 160, 0.2)", border: "none", color: "#fff", cursor: inputAction.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", transition: "background 0.2s" }}
          >
            ↑
          </button>
        </div>
      </footer>

      {/* 📱 메신저는 오직 이 서랍 안에서만 카톡/말풍선 UI로 전개됩니다 */}
      <PhoneDrawer 
        isOpen={isPhoneOpen} onClose={() => setIsPhoneOpen(false)} theme={theme}
        contactName="백서원" contactJob="기획 1팀 팀장" affection={tension}
        messages={phoneChats} onSendMessage={(text) => setPhoneChats(prev => [...prev, { sender: "user", text, time: "방금" }])}
      />

      {/* 📌 조사 단서 & 비밀(핸드아웃) 뒤집기 수사 보드 */}
      <SecretBoard 
        isOpen={isBoardOpen} onClose={() => setIsBoardOpen(false)} theme={theme}
        handouts={handouts} onFlipCard={handleFlipCard}
      />
    </main>
  );
}
