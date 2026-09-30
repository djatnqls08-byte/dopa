// components/PhoneDrawer.js
"use client";

import { useState } from "react";
import { GLASS_STYLE } from "@/lib/themes";

export default function PhoneDrawer({ isOpen, onClose, theme, contactName, contactJob, affection = 20, messages = [], onSendMessage }) {
  const [inputText, setInputText] = useState("");

  if (!isOpen) return null;

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 110,
        backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)",
        display: "flex", justifyContent: "center", alignItems: "flex-end"
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          ...GLASS_STYLE,
          width: "100%", maxWidth: "480px", height: "78vh", maxHeight: "680px",
          backgroundColor: theme.glassPanel,
          border: `1.5px solid ${theme.borderHighlight}`,
          borderBottom: "none", borderRadius: "28px 28px 0 0",
          display: "flex", flexDirection: "column", overflow: "hidden", color: theme.text
        }}
      >
        {/* 상단 통화/프로필 헤더 */}
        <div style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.glassPanelAlt }}>
          <div>
            <div style={{ fontWeight: "800", fontSize: "0.95rem" }}>💬 {contactName}</div>
            <div style={{ fontSize: "0.72rem", color: theme.textMuted }}>{contactJob} · 호감도 ♥ {affection}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: theme.text, fontSize: "1.2rem", cursor: "pointer" }}>✕</button>
        </div>

        {/* 대화 스크롤 */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {messages.map((m, idx) => {
            const isUser = m.sender === "user";
            return (
              <div 
                key={idx} 
                style={{ 
                  alignSelf: isUser ? "flex-end" : "flex-start", 
                  maxWidth: "80%", display: "flex", flexDirection: "column",
                  alignItems: isUser ? "flex-end" : "flex-start" 
                }}
              >
                <div 
                  style={{
                    padding: "10px 14px",
                    borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                    backgroundColor: isUser ? theme.accent : theme.glassPanelAlt,
                    color: isUser ? "#ffffff" : theme.text,
                    fontSize: "0.85rem", lineHeight: "1.5",
                    border: `1px solid ${isUser ? "transparent" : theme.border}`,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                  }}
                >
                  {m.text}
                </div>
                <span style={{ fontSize: "0.62rem", color: theme.textMuted, marginTop: "2px" }}>{m.time || "방금"}</span>
              </div>
            );
          })}
        </div>

        {/* 하단 입력바 */}
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${theme.border}`, display: "flex", gap: "8px", backgroundColor: theme.glassPanelAlt }}>
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
            placeholder={`${contactName}에게 답장하기...`}
            style={{
              flex: 1, padding: "10px 16px", borderRadius: "20px",
              backgroundColor: "rgba(0,0,0,0.05)", border: `1px solid ${theme.border}`,
              color: theme.text, outline: "none", fontSize: "0.85rem"
            }}
          />
          <button 
            onClick={handleSend}
            style={{
              padding: "0 18px", borderRadius: "20px",
              backgroundColor: theme.accent, color: "#fff",
              border: "none", fontWeight: "700", fontSize: "0.82rem", cursor: "pointer"
            }}
          >
            전송
          </button>
        </div>
      </div>
    </div>
  );
}
