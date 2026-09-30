// components/SecretBoard.js
"use client";

import { GLASS_STYLE } from "@/lib/themes";

export default function SecretBoard({ isOpen, onClose, theme, handouts = [], onFlipCard }) {
  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 120,
        backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "16px"
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          ...GLASS_STYLE,
          width: "100%", maxWidth: "440px", maxHeight: "82vh",
          backgroundColor: theme.glassPanel,
          border: `1.5px solid ${theme.borderHighlight}`,
          borderRadius: "24px", display: "flex", flexDirection: "column",
          overflow: "hidden", color: theme.text
        }}
      >
        {/* 헤더 */}
        <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "1.2rem" }}>📌</span>
            <span style={{ fontWeight: "800", fontSize: "0.95rem" }}>시크릿 핸드아웃 보드</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: theme.text, fontSize: "1.2rem", cursor: "pointer" }}>✕</button>
        </div>

        {/* 카드 그리드 */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
          {handouts.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px 0", color: theme.textMuted, fontSize: "0.85rem" }}>
              발견된 인물 비밀이나 사건 단서가 없습니다.
            </div>
          ) : (
            handouts.map((card, idx) => {
              const isRevealed = card.revealed;
              const isFlipped = card.isFlipped;

              return (
                <div
                  key={card.id || idx}
                  onClick={() => onFlipCard(card.id)}
                  style={{
                    ...GLASS_STYLE,
                    minHeight: "180px", borderRadius: "16px", padding: "14px",
                    backgroundColor: isFlipped ? "rgba(220, 50, 80, 0.12)" : theme.glassPanelAlt,
                    border: `1.5px solid ${isFlipped ? theme.danger : isRevealed ? theme.accent : theme.border}`,
                    cursor: isRevealed ? "pointer" : "default",
                    display: "flex", flexDirection: "column", justifyContent: "space-between",
                    position: "relative"
                  }}
                >
                  <div style={{ fontSize: "0.68rem", fontWeight: "800", color: isFlipped ? theme.danger : theme.accent }}>
                    {isFlipped ? "🔓 비밀 개방" : isRevealed ? "✨ 단서 해금 (터치하여 반전)" : "🔒 잠긴 단서"}
                  </div>

                  <div>
                    <div style={{ fontWeight: "800", fontSize: "0.88rem", margin: "6px 0", color: theme.text }}>
                      {card.title}
                    </div>
                    <div style={{ fontSize: "0.76rem", color: isFlipped ? theme.danger : theme.textMuted, lineHeight: "1.5" }}>
                      {isFlipped ? card.secret : card.overview}
                    </div>
                  </div>

                  <div style={{ fontSize: "0.65rem", color: theme.textMuted, textAlign: "center", borderTop: `1px dashed ${theme.border}`, paddingTop: "6px" }}>
                    {isRevealed ? "터치하여 앞/뒤 전환" : "조사 성공 시 해금"}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
