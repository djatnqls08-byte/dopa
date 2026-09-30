// app/page.js
"use client";

import { useState } from "react";
import { THEME_PALETTES, GLASS_STYLE } from "@/lib/themes";
import PhoneDrawer from "@/components/PhoneDrawer";
import SecretBoard from "@/components/SecretBoard";

export default function GameClient() {
  // 1. 테마 및 온보딩 상태
  const [themeMode] = useState("rose");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = isDarkMode ? THEME_PALETTES[themeMode].dark : THEME_PALETTES[themeMode].light;

  const [gameState, setGameState] = useState("TITLE"); // "TITLE" | "PLAY"
  const [pcName, setPcName] = useState("서지언");
  const [pcJob, setPcJob] = useState("기획실 비서");

  // 2. 인게임 HUD 상태
  const [day, setDay] = useState(1);
  const [phase, setPhase] = useState("저녁"); // 아침, 낮, 저녁, 밤, 새벽
  const [tension, setTension] = useState(25); // 호감도/관계성 텐션

  // 3. 서사 및 인터랙션 상태
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "지하 주차장 A구역의 서늘한 공기 사이로, 백서원 팀장의 차량 비상등이 규칙적으로 점멸합니다.\n\n운전석 창문이 스르륵 내려오더니, 평소보다 한결 가라앉은 눈빛이 당신을 응시합니다."
    }
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 4. 모달 스위치
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [isBoardOpen, setIsBoardOpen] = useState(false);

  // 5. 시크릿 핸드아웃 데이터
  const [handouts, setHandouts] = useState([
    { id: 1, title: "백서원의 알리바이", overview: "오늘 저녁 회의 직후 바로 지하 주차장으로 내려왔다고 주장함.", secret: "사실 18시 10분경, 3층 기획조정실 보안실에 들렀던 흔적이 남아있다.", revealed: true, isFlipped: false },
    { id: 2, title: "차량 조수석의 종이봉투", overview: "밀봉된 갈색 서류 봉투. 겉면에 수신인 이름이 없다.", secret: "경쟁사 로고가 찍힌 기밀 이직 제안서와 인쇄된 계약서.", revealed: false, isFlipped: false }
  ]);

  const [phoneChats, setPhoneChats] = useState([
    { sender: "npc", text: "지언 씨, 퇴근 준비 다 하셨어요?", time: "18:30" }
  ]);

  // 대사 전송
  const handleSendAction = async (textToSend = inputMsg) => {
    if (!textToSend.trim() || isLoading) return;
    const userText = textToSend.trim();
    setInputMsg("");

    const newMsgs = [...messages, { role: "user", text: userText }];
    setMessages(newMsgs);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMsgs,
          playerSheet: { name: pcName, job: pcJob },
          currentPhase: phase,
          ruleMode: "dating"
        })
      });
      const data = await res.json();
      setMessages([...newMsgs, { role: "model", text: data.text || "침묵이 흐릅니다." }]);
    } catch (e) {
      setMessages([...newMsgs, { role: "model", text: "통신 오류가 발생했습니다." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlipCard = (id) => {
    setHandouts(prev => prev.map(h => h.id === id ? { ...h, isFlipped: !h.isFlipped } : h));
  };

  // ── [1] 타이틀 및 프로필 생성 화면 ──
  if (gameState === "TITLE") {
    return (
      <main style={{ minHeight: "100dvh", background: theme.bg, color: theme.text, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "24px" }}>
        <div style={{ ...GLASS_STYLE, width: "100%", maxWidth: "380px", backgroundColor: theme.glassPanel, border: `1.5px solid ${theme.borderHighlight}`, borderRadius: "28px", padding: "32px 24px", textAlign: "center" }}>
          <div style={{ fontSize: "2.4rem", marginBottom: "8px" }}>🗝️</div>
          <h1 style={{ margin: "0 0 6px 0", fontSize: "1.45rem", fontWeight: "900", letterSpacing: "-0.5px" }}>SECRET NOVEL</h1>
          <p style={{ margin: "0 0 24px 0", fontSize: "0.8rem", color: theme.textMuted }}>비밀을 밝혀내는 인터랙티브 로맨스 스릴러</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", textAlign: "left", marginBottom: "20px" }}>
            <label style={{ fontSize: "0.75rem", fontWeight: "800", color: theme.accent }}>주인공 이름</label>
            <input 
              type="text" value={pcName} onChange={e => setPcName(e.target.value)} 
              style={{ padding: "10px 14px", borderRadius: "12px", border: `1px solid ${theme.border}`, backgroundColor: theme.glassPanelAlt, color: theme.text, outline: "none", fontSize: "0.88rem" }}
            />
            <label style={{ fontSize: "0.75rem", fontWeight: "800", color: theme.accent, marginTop: "6px" }}>직업 / 신분</label>
            <input 
              type="text" value={pcJob} onChange={e => setPcJob(e.target.value)} 
              style={{ padding: "10px 14px", borderRadius: "12px", border: `1px solid ${theme.border}`, backgroundColor: theme.glassPanelAlt, color: theme.text, outline: "none", fontSize: "0.88rem" }}
            />
          </div>

          <button 
            onClick={() => setGameState("PLAY")}
            style={{ width: "100%", padding: "14px", borderRadius: "16px", border: "none", backgroundColor: theme.accent, color: "#fff", fontWeight: "800", fontSize: "0.95rem", cursor: "pointer", boxShadow: theme.accentGlow }}
          >
            이야기 속으로 입장 ➔
          </button>
        </div>
      </main>
    );
  }

  // ── [2] 인게임 메인 플레이 룸 ──
  return (
    <main style={{ minHeight: "100dvh", background: theme.bg, color: theme.text, display: "flex", flexDirection: "column", position: "relative" }}>
      
      {/* 상단 HUD (글래스모피즘 상태 바) */}
      <header style={{ ...GLASS_STYLE, height: "54px", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.glassPanel, position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: "800", padding: "4px 8px", borderRadius: "12px", backgroundColor: theme.glassPanelAlt, border: `1px solid ${theme.border}` }}>
            🕒 {day}일차 [{phase}]
          </span>
          <span style={{ fontSize: "0.76rem", color: theme.danger, fontWeight: "800" }}>
            ♥ 텐션 {tension}%
          </span>
        </div>

        <div style={{ display: "flex", gap: "6px" }}>
          <button onClick={() => setIsBoardOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }} title="증거/핸드아웃 보드">📌</button>
          <button onClick={() => setIsPhoneOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }} title="스마트폰 메신저">📱</button>
          <button onClick={() => setIsDarkMode(!isDarkMode)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }}>{isDarkMode ? "☀️" : "🌙"}</button>
        </div>
      </header>

      {/* 중앙 소설 서사 캔버스 */}
      <section style={{ flex: 1, overflowY: "auto", padding: "18px 16px 80px", display: "flex", flexDirection: "column", gap: "14px" }}>
        {messages.map((m, idx) => {
          const isUser = m.role === "user";
          return (
            <div 
              key={idx}
              style={{
                ...GLASS_STYLE,
                alignSelf: isUser ? "flex-end" : "flex-start",
                maxWidth: isUser ? "82%" : "94%",
                padding: "14px 18px",
                borderRadius: isUser ? "20px 4px 20px 20px" : "20px 20px 20px 4px",
                backgroundColor: isUser ? theme.glassPanelAlt : theme.glassPanel,
                border: `1px solid ${isUser ? theme.accent : theme.border}`,
                fontSize: "0.92rem", lineHeight: "1.8", whiteSpace: "pre-wrap"
              }}
            >
              {!isUser && <div style={{ fontSize: "0.74rem", fontWeight: "800", color: theme.accent, marginBottom: "4px" }}>백서원 팀장</div>}
              {m.text}
            </div>
          );
        })}
        {isLoading && <div style={{ color: theme.accent, fontSize: "0.82rem", fontStyle: "italic" }}>상대방의 반응을 기다리는 중...</div>}
      </section>

      {/* 하단 캡슐형 입력 바 */}
      <footer style={{ position: "sticky", bottom: 0, padding: "12px 16px", backgroundColor: "transparent", display: "flex", justifyContent: "center" }}>
        <div style={{ ...GLASS_STYLE, width: "100%", display: "flex", alignItems: "center", backgroundColor: theme.glassPanelAlt, border: `1.5px solid ${theme.borderHighlight}`, borderRadius: "30px", padding: "4px 8px 4px 14px" }}>
          <input 
            type="text"
            value={inputMsg}
            onChange={e => setInputMsg(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSendAction(); }}
            placeholder="대사나 행동을 입력하세요..."
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: theme.text, fontSize: "0.88rem" }}
          />
          <button 
            onClick={() => handleSendAction()}
            style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: theme.accent, border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}
          >
            ↑
          </button>
        </div>
      </footer>

      {/* 모달 연동 */}
      <PhoneDrawer 
        isOpen={isPhoneOpen} onClose={() => setIsPhoneOpen(false)} theme={theme}
        contactName="백서원" contactJob="기획 1팀 팀장" affection={tension}
        messages={phoneChats} onSendMessage={(text) => setPhoneChats(prev => [...prev, { sender: "user", text }])}
      />
      <SecretBoard 
        isOpen={isBoardOpen} onClose={() => setIsBoardOpen(false)} theme={theme}
        handouts={handouts} onFlipCard={handleFlipCard}
      />
    </main>
  );
}
