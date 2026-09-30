"use client";

import { useState } from "react";

// 테마 색상 기본값
const DEFAULT_THEME = {
  bg: "#FAF4F5",
  sidebar: "#F3E7EA",
  panel: "rgba(255, 255, 255, 0.94)",
  border: "rgba(190, 130, 140, 0.14)",
  text: "#3D2B30",
  textMuted: "#967E84",
  accent: "#B87680",
  danger: "#c84560"
};

export default function GamePage() {
  const [theme] = useState(DEFAULT_THEME);
  const [inputMsg, setInputMsg] = useState("");

  return (
    <main style={{ display: "flex", flexDirection: "column", height: "100dvh", backgroundColor: theme.bg, color: theme.text }}>
      {/* 상단 헤더 */}
      <header style={{ height: "52px", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", backgroundColor: theme.sidebar }}>
        <span style={{ fontWeight: "800", fontSize: "0.95rem" }}>🕒 1일차 [저녁]</span>
        <button style={{ border: "none", background: "none", fontSize: "1.2rem", cursor: "pointer" }}>📱</button>
      </header>

      {/* 메인 텍스트 영역 */}
      <section style={{ flex: 1, padding: "20px", overflowY: "auto", fontSize: "0.95rem", lineHeight: 1.8 }}>
        <div style={{ backgroundColor: theme.panel, padding: "16px", borderRadius: "12px", border: `1px solid ${theme.border}`, marginBottom: "16px" }}>
          지하 주차장 입구로 내려서자, 서늘한 공기 사이로 익숙한 차량의 미등이 붉게 점멸합니다.
        </div>
      </section>

      {/* 하단 입력바 */}
      <footer style={{ padding: "12px 16px", borderTop: `1px solid ${theme.border}`, backgroundColor: theme.sidebar }}>
        <input 
          type="text" 
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          placeholder="대사나 행동을 입력하세요..." 
          style={{ width: "100%", padding: "12px 16px", borderRadius: "24px", border: `1px solid ${theme.border}`, outline: "none", boxSizing: "border-box", fontSize: "0.9rem" }} 
        />
      </footer>
    </main>
  );
}
