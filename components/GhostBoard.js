// components/GhostBoard.js
"use client";

import React, { useState } from "react";
import { X, Flame, ShieldAlert, FileText, UserRound, AlertTriangle, Key, Sparkles, BookOpen } from "lucide-react";

export default function GhostBoard({ 
  isOpen, 
  onClose, 
  activeSession, 
  theme, 
  isDarkMode = true, 
  isMobile = false,
  onDeclareRitual // 파훼 의식 선언 클릭 시 작성된 데이터를 넘겨받는 콜백
}) {
  // 유저가 직접 추론하여 작성하는 4대 파훼 설계 데이터
  const [targetEntity, setTargetEntity] = useState("");
  const [hiddenTruth, setHiddenTruth] = useState("");
  const [requiredItem, setRequiredItem] = useState("");
  const [ritualSteps, setRitualSteps] = useState("");

  if (!isOpen || !activeSession) return null;

  const sheet = activeSession.sheet || {};
  const npcs = sheet.npcs || [];
  
  // 밝혀진 단서, 수칙서, 소지품 결합
  const clues = [
    ...(sheet.handouts?.filter(h => h.revealed) || sheet.handouts || []),
    ...(sheet.clues || []),
    ...(sheet.items || [])
  ];

  const handleExecuteDeclaration = () => {
    const payload = {
      target: targetEntity.trim() || "미확인 괴이",
      truth: hiddenTruth.trim() || "이면의 진상 불명",
      item: requiredItem.trim() || "소지품 미지정",
      steps: ritualSteps.trim() || "즉흥적 돌파"
    };

    if (onDeclareRitual) {
      onDeclareRitual(payload);
    }
    onClose();
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 99995,
        backgroundColor: "rgba(0, 0, 0, 0.8)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: isMobile ? "10px" : "20px", animation: "fadeIn 0.2s ease-out"
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: "860px", maxHeight: "92vh",
          backgroundColor: isDarkMode ? "#151210" : "#fbf9f5",
          border: `1.5px solid rgba(234, 88, 12, 0.45)`,
          borderRadius: "24px", display: "flex", flexDirection: "column",
          boxShadow: "0 25px 60px rgba(0,0,0,0.7), 0 0 35px rgba(234, 88, 12, 0.15)",
          overflow: "hidden", color: theme?.text || "#fff"
        }}
      >
        {/* 1. 상단 헤더 바 */}
        <div style={{
          padding: "18px 24px 14px",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          borderBottom: "1px dashed rgba(255,255,255,0.12)",
          backgroundColor: isDarkMode ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.03)"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ea580c", fontWeight: "900", fontSize: "1.15rem", letterSpacing: "-0.3px" }}>
              <Flame size={20} fill="#ea580c" /> 괴이 조사록 (OCCULT DOSSIER)
            </div>
            <div style={{ fontSize: "0.76rem", color: theme?.textMuted || "#a8a29e", marginTop: "4px" }}>
              사건: 《{activeSession.title}》 · 확보 단서 {clues.length}건 · 생존 인원 {npcs.length}명
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              background: "none", border: "none", color: theme?.textMuted || "#a8a29e", 
              cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" 
            }}
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* 2. 스크롤 본문 영역 */}
        <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px" : "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* A. 상단: 생존자 및 동행자 카드 (참고용) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: "800", color: theme?.textMuted || "#a8a29e" }}>
              👥 동행자 및 현장 인원
            </span>
            <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px", WebkitOverflowScrolling: "touch" }}>
              {npcs.length === 0 ? (
                <div style={{ width: "100%", padding: "14px", textAlign: "center", color: theme?.textMuted, fontSize: "0.8rem" }}>
                  확인된 인물이 없습니다.
                </div>
              ) : (
                npcs.map((npc, idx) => (
                  <div 
                    key={npc.id || idx}
                    style={{
                      flex: isMobile ? "0 0 140px" : "0 0 160px",
                      backgroundColor: isDarkMode ? "#221d19" : "#eae4db",
                      borderRadius: "10px", padding: "8px 8px 12px",
                      border: "1px solid rgba(255,255,255,0.08)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                      display: "flex", flexDirection: "column", alignItems: "center",
                      position: "relative"
                    }}
                  >
                    <div style={{
                      position: "absolute", top: "-5px", left: "50%", transform: "translateX(-50%)",
                      width: "10px", height: "10px", borderRadius: "50%",
                      backgroundColor: "#ef4444", boxShadow: "0 2px 4px rgba(239, 68, 68, 0.6)"
                    }} />
                    <div style={{
                      width: "100%", aspectRatio: "1/1", borderRadius: "6px",
                      overflow: "hidden", backgroundColor: "rgba(0,0,0,0.3)",
                      marginTop: "6px", display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      {npc.portraitUrl || npc.portrait ? (
                        <img src={npc.portraitUrl || npc.portrait} alt={npc.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <UserRound size={30} color="#78716c" />
                      )}
                    </div>
                    <div style={{ marginTop: "8px", textAlign: "center", width: "100%" }}>
                      <div style={{ fontWeight: "900", fontSize: "0.88rem", color: isDarkMode ? "#f5f5f4" : "#292524", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {npc.name}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: isDarkMode ? "#a8a29e" : "#78716c", fontWeight: "600" }}>
                        {npc.job || "신분 미상"}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* B. 중단: 확보된 단서 및 수칙 (참고용) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: "800", color: theme?.textMuted || "#a8a29e" }}>
              📜 확보된 괴담 단서 및 생존 수칙 ({clues.length}건)
            </span>
            {clues.length === 0 ? (
              <div style={{
                padding: "20px", textAlign: "center",
                backgroundColor: isDarkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                border: "1px dashed rgba(255,255,255,0.12)", borderRadius: "12px",
                color: theme?.textMuted || "#78716c", fontSize: "0.8rem"
              }}>
                아직 확보된 결정적 단서나 수칙서가 없습니다. 조사를 통해 약점을 수집하십시오.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "8px", maxHeight: "160px", overflowY: "auto" }}>
                {clues.map((item, idx) => (
                  <div 
                    key={idx}
                    style={{
                      padding: "10px 12px", borderRadius: "10px",
                      backgroundColor: isDarkMode ? "rgba(35, 30, 26, 0.6)" : "rgba(255,255,255,0.85)",
                      border: "1px solid rgba(234, 88, 12, 0.2)",
                      display: "flex", flexDirection: "column", gap: "2px"
                    }}
                  >
                    <span style={{ fontWeight: "800", fontSize: "0.82rem", color: "#fb923c" }}>
                      • {item.title || item.name}
                    </span>
                    <span style={{ fontSize: "0.74rem", color: theme?.textMuted || "#a8a29e", lineHeight: "1.4" }}>
                      {item.overview || item.desc || "내용 미기재"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* C. 하단 핵심: 유저가 직접 수립하는 파훼 의식 설계록 */}
          <div style={{
            display: "flex", flexDirection: "column", gap: "12px",
            padding: "16px", borderRadius: "16px",
            backgroundColor: isDarkMode ? "rgba(24, 18, 14, 0.85)" : "#fff",
            border: "1.5px solid rgba(234, 88, 12, 0.4)",
            boxShadow: "inset 0 2px 10px rgba(0,0,0,0.2)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#ea580c", fontWeight: "900", fontSize: "0.88rem" }}>
              <Sparkles size={16} /> 파훼·봉인 가설 수립 (직접 작성)
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "0.72rem", fontWeight: "800", color: "#fb923c", display: "block", marginBottom: "4px" }}>
                  1. 봉인 대상 (괴이의 본명 / 실체)
                </label>
                <input 
                  type="text"
                  value={targetEntity}
                  onChange={e => setTargetEntity(e.target.value)}
                  placeholder="예: 지하 4층의 야근하는 사원들, 김지윤 대리"
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: "8px",
                    backgroundColor: isDarkMode ? "#1f1915" : "#f5f5f4",
                    border: "1px solid rgba(255,255,255,0.12)", color: theme?.text || "#fff",
                    fontSize: "0.82rem", outline: "none"
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.72rem", fontWeight: "800", color: "#fb923c", display: "block", marginBottom: "4px" }}>
                  2. 필요한 물건 (매개체 / 핵심 물증)
                </label>
                <input 
                  type="text"
                  value={requiredItem}
                  onChange={e => setRequiredItem(e.target.value)}
                  placeholder="예: 3년 전 폐기된 마스터키, 소금, 사원증"
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: "8px",
                    backgroundColor: isDarkMode ? "#1f1915" : "#f5f5f4",
                    border: "1px solid rgba(255,255,255,0.12)", color: theme?.text || "#fff",
                    fontSize: "0.82rem", outline: "none"
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "0.72rem", fontWeight: "800", color: "#fb923c", display: "block", marginBottom: "4px" }}>
                3. 이면의 진상 (수칙의 모순 및 괴담 발생 원인)
              </label>
              <input 
                type="text"
                value={hiddenTruth}
                onChange={e => setHiddenTruth(e.target.value)}
                placeholder="예: 수칙서 4번은 괴이의 유인책이며, 화재 비상벨이 울릴 때 전원을 차단해야 함"
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: "8px",
                  backgroundColor: isDarkMode ? "#1f1915" : "#f5f5f4",
                  border: "1px solid rgba(255,255,255,0.12)", color: theme?.text || "#fff",
                  fontSize: "0.82rem", outline: "none"
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.72rem", fontWeight: "800", color: "#fb923c", display: "block", marginBottom: "4px" }}>
                4. 파훼 및 봉인 순서 (계획한 행동 수칙)
              </label>
              <textarea 
                rows={2}
                value={ritualSteps}
                onChange={e => setRitualSteps(e.target.value)}
                placeholder="예: 1단계: 진명 지목으로 주의 분산 ➔ 2단계: 파트너와 함께 배전반 차단 ➔ 3단계: 비상문 빗장 봉인"
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: "8px",
                  backgroundColor: isDarkMode ? "#1f1915" : "#f5f5f4",
                  border: "1px solid rgba(255,255,255,0.12)", color: theme?.text || "#fff",
                  fontSize: "0.82rem", outline: "none", resize: "none"
                }}
              />
            </div>
          </div>
        </div>

        {/* 3. 하단 결착 선언 CTA 바 */}
        <div style={{
          padding: "16px 24px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          backgroundColor: isDarkMode ? "rgba(12, 10, 9, 0.95)" : "rgba(245, 240, 235, 0.95)",
          display: "flex", flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between", alignItems: isMobile ? "stretch" : "center",
          gap: "12px"
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: "900", color: "#ea580c", display: "flex", alignItems: "center", gap: "6px" }}>
              <AlertTriangle size={15} /> 결착(結着) 단계 집행 준비
            </span>
            <span style={{ fontSize: "0.72rem", color: theme?.textMuted || "#a8a29e" }}>
              선언 시 작성한 가설을 바탕으로 최후의 사투와 주사위 판정이 시작됩니다.
            </span>
          </div>

          <button
            type="button"
            onClick={handleExecuteDeclaration}
            style={{
              padding: "12px 24px", borderRadius: "14px",
              backgroundColor: "#ea580c", color: "#fff",
              border: "none", fontWeight: "900", fontSize: "0.92rem",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              boxShadow: "0 4px 18px rgba(234, 88, 12, 0.45)",
              transition: "transform 0.15s, background-color 0.15s"
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#c2410c"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#ea580c"}
          >
            <Flame size={16} fill="#fff" /> 결착 선언 : 파훼 의식 집행 →
          </button>
        </div>
      </div>
    </div>
  );
}
