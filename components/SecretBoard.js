"use client";
import React from "react";
import { X, UserRound, Pin, FileText, Lightbulb } from "lucide-react";

export default function SecretBoard({ activeSession, theme, isMobile, onClose, onDeclareMystery }) {
  if (!activeSession) return null;

  const sheet = activeSession.sheet || {};
  const npcs = sheet.npcs || [];
  const clues = [...(sheet.clues || []), ...(sheet.items || [])];

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100000, padding: isMobile ? "16px" : "40px", animation: "fadeIn 0.2s ease-out" }}>
      <div style={{ width: "100%", maxWidth: "800px", height: "90vh", backgroundColor: "#1e1b1a", borderRadius: "16px", border: "1px solid #4a403a", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
        
        {/* 헤더 */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #3d3530", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#eab308", fontSize: "1.15rem", fontWeight: "900" }}>
              <Pin size={20} style={{ transform: "rotate(45deg)" }} /> 수사 본부 증거보드 (EVIDENCE BOARD)
            </div>
            <div style={{ fontSize: "0.8rem", color: "#a8a29e", fontWeight: "600" }}>
              사건: 《{activeSession.title}》 · 확보 단서 {clues.length}건 · 관련자 {npcs.length}명
            </div>
          </div>
          <button onClick={onClose} style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.1)", border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)"} onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}>
            <X size={20} />
          </button>
        </div>

        {/* 본문 스크롤 영역 */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "32px", backgroundImage: "radial-gradient(#3d3530 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
          
          {/* 용의자(NPC) 그리드 - 변수 에러 완벽 차단! */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: "16px" }}>
            {npcs.map((npc, idx) => (
              <div key={npc.id || idx} style={{ backgroundColor: "#f5f5f4", borderRadius: "8px", padding: "12px", display: "flex", flexDirection: "column", alignItems: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.2)", position: "relative" }}>
                <div style={{ position: "absolute", top: "-10px", color: "#ef4444" }}><Pin size={24} fill="#ef4444" /></div>
                
                {/* 🌟 바로 이곳이 에러의 원인이었던 사진 렌더링 구역입니다 (npc로 통일 완료) */}
                <div style={{ width: "100%", aspectRatio: "1/1", backgroundColor: "#e7e5e4", borderRadius: "4px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #d6d3d1", marginBottom: "12px" }}>
                  {npc.portraitUrl || npc.portrait ? (
                    <img src={npc.portraitUrl || npc.portrait} alt="인물" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <UserRound size={40} color="#4c1d95" opacity={0.8} />
                  )}
                </div>
                
                <div style={{ fontWeight: "900", color: "#1c1917", fontSize: "1.05rem", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>{npc.name}</div>
                <div style={{ fontSize: "0.75rem", color: "#57534e", fontWeight: "600", marginTop: "2px", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>{npc.job}</div>
              </div>
            ))}
          </div>

          {/* 확보된 증거 리스트 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#e8e3dc", fontSize: "0.95rem", fontWeight: "800" }}>
              <FileText size={18} /> 확보된 증거 및 사건 파일 ({clues.length}건)
            </div>
            {clues.length === 0 ? (
              <div style={{ padding: "30px", border: "1px dashed #57534e", borderRadius: "12px", textAlign: "center", color: "#78716c", fontSize: "0.85rem", backgroundColor: "rgba(0,0,0,0.2)" }}>
                아직 수집된 결정적 증거가 없습니다. 현장 조사와 심문을 통해 물증을 확보하세요.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {clues.map((c, idx) => (
                  <div key={idx} style={{ padding: "16px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "10px", border: "1px solid #57534e", color: "#e8e3dc" }}>
                    <div style={{ fontWeight: "800", fontSize: "0.95rem", marginBottom: "4px", color: "#fcd34d" }}>{c.name}</div>
                    <div style={{ fontSize: "0.85rem", color: "#d6d3d1", lineHeight: "1.5" }}>{c.desc || c.overview}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 하단 푸터 (진상 추리 선언) */}
        <div style={{ padding: "20px 24px", borderTop: "1px solid #3d3530", backgroundColor: "#292524", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#fcd34d", fontWeight: "800", fontSize: "0.9rem" }}>
              <Lightbulb size={16} /> 진상 추리 체크리스트
            </div>
            <div style={{ fontSize: "0.75rem", color: "#a8a29e", fontWeight: "700" }}>
              ① 진범 지목 ➔ ② 알리바이 & 결정적 물증 제시 ➔ ③ 트릭 해명
            </div>
          </div>
          <button onClick={onDeclareMystery} style={{ padding: "12px 20px", backgroundColor: "#ef4444", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "900", fontSize: "0.95rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 4px 15px rgba(239, 68, 68, 0.4)", transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
            ✍️ 추리 선언 ➔
          </button>
        </div>

      </div>
    </div>
  );
}
