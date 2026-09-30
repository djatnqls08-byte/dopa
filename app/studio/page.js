// app/studio/page.js
"use client";
import { useState } from "react";

export default function StudioPage() {
  const [rawText, setRawText] = useState("");

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px", height: "100dvh", boxSizing: "border-box" }}>
      <h2 style={{ margin: 0, fontSize: "1.1rem" }}>🎬 시나리오 창작 스튜디오</h2>
      <textarea 
        value={rawText} 
        onChange={(e) => setRawText(e.target.value)} 
        placeholder="시나리오 원문을 붙여넣으세요..." 
        style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #ccc", resize: "none" }}
      />
      <button style={{ padding: "12px", backgroundColor: "#6366f1", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700" }}>
        데이터 자동 추출 및 검증
      </button>
    </div>
  );
}
