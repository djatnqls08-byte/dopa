// components/PhoneDrawer.js
"use client";

import { useState } from "react";
import { GLASS_STYLE } from "@/lib/themes";
import { 
  Wifi, WifiOff, Battery, BatteryWarning, 
  Send, X, MessageSquare, Feather, Sparkles, Flame, Moon
} from "lucide-react";

export default function PhoneDrawer({ 
  isOpen, 
  onClose, 
  theme, 
  contactName = "상대방", 
  contactJob = "연락처", 
  affection = 20, 
  messages = [], 
  onSendMessage,
  inGameTime,        // 예: "1일차 새벽", "자시(子時)", "2일차 정오" 등
  genre = "modern",  // "modern"(현대), "wuxia"(무협), "fantasy"(판타지), "classic"(서신)
  isHorror = false
}) {
  const [inputText, setInputText] = useState("");

  if (!isOpen) return null;

  const handleSend = () => {
    if (!inputText.trim()) return;
    if (onSendMessage) onSendMessage(inputText.trim());
    setInputText("");
  };

  // 🌟 1. 장르별 미니멀 인디케이터 라벨 & 아이콘 매핑
  const getIndicatorData = () => {
    switch (genre) {
      case "wuxia": // 무협
        return {
          time: inGameTime || "1일차 자시(子時)",
          timeIcon: Moon,
          signal: isHorror ? "전음 단절" : "전음(傳音)",
          resource: isHorror ? "내력 15%" : "내력 75%",
          resIcon: Flame,
          placeholder: `${contactName}에게 전음 보내기...`
        };
      case "fantasy": // 판타지 / 로판
        return {
          time: inGameTime || "1일차 자정",
          timeIcon: Sparkles,
          signal: isHorror ? "공명 교란" : "영맥 공명",
          resource: isHorror ? "마력 12%" : "마력 85%",
          resIcon: Sparkles,
          placeholder: `${contactName}에게 전언 보내기...`
        };
      case "classic": // 고전 서신
        return {
          time: inGameTime || "1일차 밤",
          timeIcon: Moon,
          signal: "전서구",
          resource: isHorror ? "잉크 10%" : "잉크 80%",
          resIcon: Feather,
          placeholder: `${contactName}에게 서신 작성...`
        };
      case "modern": // 현대 / 오피스 괴담
      default:
        return {
          time: inGameTime || (isHorror ? "1일차 새벽 · 03:44" : "1일차 오후 · 02:15"),
          timeIcon: Moon,
          signal: isHorror ? "신호 끊김" : "5G",
          resource: isHorror ? "배터리 14%" : "배터리 85%",
          resIcon: isHorror ? BatteryWarning : Battery,
          placeholder: `${contactName}에게 메시지...`
        };
    }
  };

  const current = getIndicatorData();
  const TimeIcon = current.timeIcon;
  const ResIcon = current.resIcon;

  return (
    <div 
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 110,
        backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
        display: "flex", justifyContent: "center", alignItems: "flex-end",
        animation: "fadeIn 0.2s ease-out"
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          ...GLASS_STYLE,
          width: "100%", maxWidth: "440px", height: "82vh", maxHeight: "700px",
          backgroundColor: isHorror ? "rgba(16, 14, 13, 0.96)" : theme.glassPanel,
          border: `1.5px solid ${isHorror ? "rgba(220, 38, 38, 0.35)" : theme.borderHighlight}`,
          borderBottom: "none", borderRadius: "30px 30px 0 0",
          display: "flex", flexDirection: "column", overflow: "hidden", 
          color: theme.text,
          boxShadow: isHorror ? "0 -10px 40px rgba(220, 38, 38, 0.2)" : "0 -10px 40px rgba(0,0,0,0.25)"
        }}
      >
        {/* 🧭 상단 초간결 인디케이터 (시간 · 연결 · 잔량) */}
        <div style={{
          padding: "8px 20px 6px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontSize: "0.72rem", fontWeight: "800",
          color: isHorror ? "#d6d3d1" : theme.textMuted,
          borderBottom: `1px solid ${isHorror ? "rgba(255,255,255,0.06)" : theme.border}`,
          backgroundColor: isHorror ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.03)"
        }}>
          {/* 1. 시간 */}
          <span style={{ display: "flex", alignItems: "center", gap: "4px", color: isHorror ? "#fca5a5" : theme.accent }}>
            <TimeIcon size={12} /> {current.time}
          </span>

          {/* 2. 연결 & 3. 잔량 */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "3px", color: isHorror ? "#f87171" : theme.textMuted }}>
              {isHorror && genre === "modern" ? <WifiOff size={12} /> : null}
              {current.signal}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "3px", color: isHorror ? "#ef4444" : "#22c55e" }}>
              <ResIcon size={12} /> {current.resource}
            </span>
          </div>
        </div>

        {/* 대화 상대방 헤더 */}
        <div style={{ 
          padding: "12px 20px", 
          display: "flex", justifyContent: "space-between", alignItems: "center", 
          borderBottom: `1px solid ${theme.border}`, 
          backgroundColor: isHorror ? "rgba(25, 20, 18, 0.9)" : theme.glassPanelAlt 
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "50%",
              backgroundColor: isHorror ? "rgba(220, 38, 38, 0.15)" : theme.inputBg,
              border: `1px solid ${isHorror ? "rgba(220, 38, 38, 0.4)" : theme.border}`,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <MessageSquare size={16} color={isHorror ? "#f87171" : theme.accent} />
            </div>
            <div>
              <div style={{ fontWeight: "900", fontSize: "0.95rem", color: theme.text }}>
                {contactName}
              </div>
              <div style={{ fontSize: "0.72rem", color: theme.textMuted }}>
                {contactJob} {affection !== undefined && `· 유대 ♥ ${affection}`}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: theme.textMuted, cursor: "pointer", padding: "4px" }}>
            <X size={20} />
          </button>
        </div>

        {/* 메시지 리스트 스크롤 영역 */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {messages.length === 0 ? (
            <div style={{ margin: "auto", textAlign: "center", color: theme.textMuted, fontSize: "0.8rem", padding: "20px" }}>
              주고받은 대화가 없습니다.
            </div>
          ) : (
            messages.map((m, idx) => {
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
                      backgroundColor: isUser ? (theme.accent || "#ea580c") : (isHorror ? "rgba(35, 30, 26, 0.9)" : theme.glassPanelAlt),
                      color: isUser ? "#ffffff" : theme.text,
                      fontSize: "0.85rem", lineHeight: "1.5",
                      border: `1px solid ${isUser ? "transparent" : (isHorror ? "rgba(255,255,255,0.08)" : theme.border)}`,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      wordBreak: "keep-all"
                    }}
                  >
                    {m.text}
                  </div>
                  <span style={{ fontSize: "0.62rem", color: theme.textMuted, marginTop: "2px" }}>{m.time || "방금"}</span>
                </div>
              );
            })
          )}
        </div>

        {/* 하단 입력 바 */}
        <div style={{ 
          padding: "12px 16px", 
          borderTop: `1px solid ${theme.border}`, 
          display: "flex", gap: "8px", 
          backgroundColor: isHorror ? "rgba(25, 20, 18, 0.95)" : theme.glassPanelAlt 
        }}>
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
            placeholder={current.placeholder}
            style={{
              flex: 1, padding: "10px 16px", borderRadius: "20px",
              backgroundColor: isHorror ? "rgba(0,0,0,0.3)" : theme.inputBg, 
              border: `1px solid ${theme.border}`,
              color: theme.text, outline: "none", fontSize: "0.85rem"
            }}
          />
          <button 
            type="button"
            onClick={handleSend}
            style={{
              padding: "0 16px", borderRadius: "20px",
              backgroundColor: theme.accent || "#ea580c", color: "#fff",
              border: "none", fontWeight: "800", fontSize: "0.82rem", 
              cursor: "pointer", display: "flex", alignItems: "center", gap: "4px"
            }}
          >
            <Send size={13} /> 전송
          </button>
        </div>
      </div>
    </div>
  );
}
