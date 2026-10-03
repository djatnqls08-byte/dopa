// components/GhostBoard.js
"use client";

import React, { useState, useRef } from "react";
import { 
  X, Flame, FileText, UserRound, AlertTriangle, 
  Sparkles, RotateCcw, Pin
} from "lucide-react";

export default function GhostBoard({ 
  isOpen, 
  onClose, 
  activeSession, 
  theme, 
  isDarkMode = true, 
  isMobile = false,
  onDeclareRitual
}) {
  // 유저가 직접 추론하여 작성하는 4대 파훼 설계 데이터
  const [targetEntity, setTargetEntity] = useState("");
  const [requiredItem, setRequiredItem] = useState("");
  const [hiddenTruth, setHiddenTruth] = useState("");
  const [ritualSteps, setRitualSteps] = useState("");

  const [highlightedSlot, setHighlightedSlot] = useState(null);

  // 4개 슬롯 Auto-Growing용 ref
  const targetEntityRef = useRef(null);
  const requiredItemRef = useRef(null);
  const hiddenTruthRef = useRef(null);
  const ritualStepsRef = useRef(null);

  if (!isOpen || !activeSession) return null;

  const sheet = activeSession.sheet || {};
  const npcs = sheet.npcs || [];
  
  // 밝혀진 단서, 수칙서, 소지품 결합
  const clues = [
    ...(sheet.handouts?.filter(h => h.revealed) || sheet.handouts || []),
    ...(sheet.clues || []),
    ...(sheet.items || [])
  ];

  // 높이 자동 팽창 헬퍼
  const autoResize = (el) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 48)}px`;
  };

  const handleInputChange = (setter, ref) => (e) => {
    setter(e.target.value);
    autoResize(ref.current);
  };

  const triggerSlotFeedback = (slotNum) => {
    setHighlightedSlot(slotNum);
    setTimeout(() => setHighlightedSlot(null), 1000);
  };

  // 인물 터치 시 ➔ 1번 [봉인 대상] 자동 주입
  const handleSelectNpc = (name) => {
    setTargetEntity(name);
    triggerSlotFeedback(1);
    setTimeout(() => autoResize(targetEntityRef.current), 50);
  };

  // 단서/소지품 터치 시 ➔ 2번 [필요한 물건] 보조 주입
  const handleSelectClue = (title) => {
    setRequiredItem(prev => (prev ? `${prev}\n• ${title}` : title));
    triggerSlotFeedback(2);
    setTimeout(() => autoResize(requiredItemRef.current), 50);
  };

  // 가설 초기화
  const handleReset = () => {
    if (confirm("작성 중인 파훼·봉인 가설을 모두 초기화하시겠습니까?")) {
      setTargetEntity("");
      setRequiredItem("");
      setHiddenTruth("");
      setRitualSteps("");
      [targetEntityRef, requiredItemRef, hiddenTruthRef, ritualStepsRef].forEach(ref => {
        if (ref.current) ref.current.style.height = "auto";
      });
    }
  };

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

  // 공통 시원한 텍스트에어리어 스타일 (Enter 줄바꿈 + 자동 확장)
  const textareaBaseStyle = (isHighlighted) => ({
    width: "100%",
    minHeight: "48px",
    padding: isMobile ? "12px 14px" : "14px 16px",
    borderRadius: "10px",
    backgroundColor: isDarkMode ? "#1f1915" : "#f5f5f4",
    border: `1.5px solid ${isHighlighted ? "#ea580c" : "rgba(234, 88, 12, 0.35)"}`,
    color: theme?.text || (isDarkMode ? "#fff" : "#1c1917"),
    fontSize: isMobile ? "0.95rem" : "1.02rem",
    lineHeight: "1.65",
    outline: "none",
    resize: "none",
    overflow: "hidden",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    boxShadow: isHighlighted ? "0 0 16px rgba(234, 88, 12, 0.35)" : "none"
  });

  return (
    <div 
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 99995,
        backgroundColor: "rgba(0, 0, 0, 0.82)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: isMobile ? "10px" : "20px", animation: "fadeIn 0.2s ease-out"
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: "860px", maxHeight: "92vh",
          backgroundColor: isDarkMode ? "#13100e" : "#fbf9f5",
          border: `1.5px solid rgba(234, 88, 12, 0.45)`,
          borderRadius: "24px", display: "flex", flexDirection: "column",
          boxShadow: "0 25px 60px rgba(0,0,0,0.8), 0 0 35px rgba(234, 88, 12, 0.15)",
          overflow: "hidden", color: theme?.text || "#fff"
        }}
      >
        {/* 1. 상단 헤더 바 */}
        <div style={{
          padding: isMobile ? "16px 18px" : "20px 28px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderBottom: "1px dashed rgba(255,255,255,0.12)",
          backgroundColor: isDarkMode ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.03)",
          flexShrink: 0
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "12px",
              backgroundColor: "rgba(234, 88, 12, 0.15)", border: "1.5px solid rgba(234, 88, 12, 0.4)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#ea580c"
            }}>
              <Flame size={22} fill="#ea580c" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ea580c", fontWeight: "900", fontSize: isMobile ? "1.08rem" : "1.25rem", letterSpacing: "-0.3px" }}>
                괴이 조사록
              </div>
              <div style={{ fontSize: isMobile ? "0.76rem" : "0.84rem", color: theme?.textMuted || "#a8a29e", marginTop: "2px", fontWeight: "600" }}>
                사건: 《{activeSession.title}》 · 확보 단서 {clues.length}건 · 생존 인원 {npcs.length}명
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button 
              type="button" 
              onClick={handleReset} 
              title="가설 초기화"
              style={{ background: "none", border: "none", color: "#78716c", cursor: "pointer", padding: "8px", display: "flex" }}
            >
              <RotateCcw size={20} />
            </button>
            <button 
              type="button"
              onClick={onClose} 
              style={{ 
                width: "36px", height: "36px", borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.06)", border: "none",
                color: theme?.textMuted || "#a8a29e", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}
            >
              <X size={22} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* 2. 스크롤 본문 영역 */}
        <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px" : "24px", display: "flex", flexDirection: "column", gap: "26px" }}>
          
          {/* A. 상단: 생존자 및 동행자 카드 (터치 시 1번 슬롯 지정) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: isMobile ? "0.9rem" : "0.98rem", fontWeight: "900", color: "#fb923c", display: "flex", alignItems: "center", gap: "8px" }}>
                <UserRound size={18} /> 👥 동행자 및 현장 인원 ({npcs.length}명)
              </span>
              <span style={{ fontSize: isMobile ? "0.74rem" : "0.82rem", color: "#a8a29e" }}>
                인물을 터치하면 1번 봉인 대상에 지정됩니다.
              </span>
            </div>

            <div style={{ display: "flex", gap: "14px", overflowX: "auto", padding: "10px 4px 6px", WebkitOverflowScrolling: "touch" }}>
              {npcs.length === 0 ? (
                <div style={{ width: "100%", padding: "16px", textAlign: "center", color: theme?.textMuted, fontSize: "0.88rem" }}>
                  확인된 인물이 없습니다.
                </div>
              ) : (
                npcs.map((npc, idx) => {
                  const isSelected = targetEntity === npc.name;
                  return (
                    <div 
                      key={npc.id || idx}
                      onClick={() => handleSelectNpc(npc.name)}
                      style={{
                        flex: isMobile ? "0 0 135px" : "0 0 155px",
                        backgroundColor: isSelected ? "rgba(234, 88, 12, 0.16)" : (isDarkMode ? "#221d19" : "#eae4db"),
                        borderRadius: "14px", padding: "12px 10px 10px",
                        border: `1.5px solid ${isSelected ? "#ea580c" : "rgba(255,255,255,0.08)"}`,
                        boxShadow: isSelected ? "0 8px 24px rgba(234, 88, 12, 0.3)" : "0 4px 14px rgba(0,0,0,0.3)",
                        display: "flex", flexDirection: "column", alignItems: "center",
                        position: "relative", cursor: "pointer", transition: "all 0.15s ease",
                        transform: isSelected ? "scale(1.03)" : "scale(1)"
                      }}
                    >
                      {/* 📌 상단 붉은 핀 */}
                      <div style={{
                        position: "absolute", top: "-8px", left: "50%", transform: "translateX(-50%)",
                        color: isSelected ? "#ea580c" : "#ef4444"
                      }}>
                        <Pin size={20} fill={isSelected ? "#ea580c" : "#ef4444"} style={{ transform: "rotate(45deg)" }} />
                      </div>

                      <div style={{
                        width: "100%", aspectRatio: "1/1", borderRadius: "10px",
                        overflow: "hidden", backgroundColor: "rgba(0,0,0,0.3)",
                        marginTop: "4px", display: "flex", alignItems: "center", justifyContent: "center",
                        border: `1px solid ${isSelected ? "rgba(234, 88, 12, 0.5)" : "transparent"}`
                      }}>
                        {npc.portraitUrl || npc.portrait ? (
                          <img src={npc.portraitUrl || npc.portrait} alt={npc.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <UserRound size={36} color="#78716c" />
                        )}
                      </div>

                      <div style={{ marginTop: "8px", textAlign: "center", width: "100%" }}>
                        <div style={{ fontWeight: "900", fontSize: isMobile ? "0.92rem" : "0.98rem", color: isDarkMode ? "#f5f5f4" : "#292524", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {npc.name}
                        </div>
                        <div style={{ fontSize: isMobile ? "0.72rem" : "0.78rem", color: isDarkMode ? "#a8a29e" : "#78716c", fontWeight: "600", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {npc.job || "신분 미상"}
                        </div>
                      </div>

                      <div style={{ marginTop: "6px", fontSize: "0.68rem", fontWeight: "800", color: isSelected ? "#ea580c" : "#78716c" }}>
                        {isSelected ? "✓ 지정됨" : "+ 봉인 대상 꽂기"}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* B. 중단: 확보된 단서 및 수칙 (터치 시 2번 매개체 슬롯에 추가) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: isMobile ? "0.9rem" : "0.98rem", fontWeight: "900", color: "#fb923c", display: "flex", alignItems: "center", gap: "8px" }}>
                <FileText size={18} /> 📜 확보된 괴담 단서 및 생존 수칙 ({clues.length}건)
              </span>
              <span style={{ fontSize: isMobile ? "0.74rem" : "0.82rem", color: "#a8a29e" }}>
                단서를 터치하면 2번 매개체/물증 슬롯에 추가됩니다.
              </span>
            </div>

            {clues.length === 0 ? (
              <div style={{
                padding: "24px", textAlign: "center",
                backgroundColor: isDarkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                border: "1.5px dashed rgba(255,255,255,0.12)", borderRadius: "14px",
                color: theme?.textMuted || "#78716c", fontSize: "0.88rem"
              }}>
                아직 확보된 결정적 단서나 수칙서가 없습니다. 조사를 통해 약점을 수집하십시오.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px" }}>
                {clues.map((item, idx) => {
                  const title = item.title || item.name || "미확인 단서";
                  const desc = item.overview || item.desc || "내용 미기재";
                  return (
                    <div 
                      key={idx}
                      onClick={() => handleSelectClue(title)}
                      style={{
                        padding: isMobile ? "12px 14px" : "14px 16px", borderRadius: "12px",
                        backgroundColor: isDarkMode ? "rgba(35, 30, 26, 0.75)" : "rgba(255,255,255,0.85)",
                        border: "1px solid rgba(234, 88, 12, 0.25)",
                        display: "flex", flexDirection: "column", gap: "4px",
                        cursor: "pointer", transition: "all 0.15s ease",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "#ea580c"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(234, 88, 12, 0.25)"}
                    >
                      <span style={{ fontWeight: "900", fontSize: isMobile ? "0.92rem" : "0.98rem", color: "#fb923c" }}>
                        • {title}
                      </span>
                      <span style={{ fontSize: isMobile ? "0.78rem" : "0.84rem", color: theme?.textMuted || "#a8a29e", lineHeight: "1.5" }}>
                        {desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* C. 하단 핵심: 유저가 직접 수립하는 파훼 의식 설계록 (Auto-growing Textareas) */}
          <div style={{
            display: "flex", flexDirection: "column", gap: "16px",
            padding: isMobile ? "16px" : "22px", borderRadius: "18px",
            backgroundColor: isDarkMode ? "rgba(24, 18, 14, 0.95)" : "#fff",
            border: "1.5px solid rgba(234, 88, 12, 0.45)",
            boxShadow: "inset 0 2px 10px rgba(0,0,0,0.2)"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ea580c", fontWeight: "900", fontSize: isMobile ? "0.95rem" : "1.08rem" }}>
                <Sparkles size={20} /> 파훼·봉인 가설 수립 (직접 작성 및 자유로운 편집)
              </div>
              <span style={{ fontSize: "0.76rem", color: "#a8a29e" }}>
                ※ Enter로 자유롭게 줄바꿈하며 칸이 자동 확장됩니다.
              </span>
            </div>
            
            {/* 1열: 봉인 대상 + 필요한 물건 (PC 환경 2분할, 모바일 1열) */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: isMobile ? "0.82rem" : "0.88rem", fontWeight: "800", color: "#fb923c" }}>
                  1. 봉인 대상 (괴이의 본명 / 실체)
                </label>
                <textarea 
                  ref={targetEntityRef}
                  rows={1}
                  value={targetEntity}
                  onChange={handleInputChange(setTargetEntity, targetEntityRef)}
                  placeholder="예: 지하 4층의 야근하는 사원들, 김지윤 대리"
                  style={textareaBaseStyle(highlightedSlot === 1)}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: isMobile ? "0.82rem" : "0.88rem", fontWeight: "800", color: "#fb923c" }}>
                  2. 필요한 물건 (매개체 / 핵심 물증)
                </label>
                <textarea 
                  ref={requiredItemRef}
                  rows={1}
                  value={requiredItem}
                  onChange={handleInputChange(setRequiredItem, requiredItemRef)}
                  placeholder="예: 3년 전 폐기된 마스터키, 소금, 사원증 (단서 터치 추가 가능)"
                  style={textareaBaseStyle(highlightedSlot === 2)}
                />
              </div>
            </div>

            {/* 3번: 이면의 진상 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: isMobile ? "0.82rem" : "0.88rem", fontWeight: "800", color: "#fb923c" }}>
                3. 이면의 진상 (수칙의 모순 및 괴담 발생 원인)
              </label>
              <textarea 
                ref={hiddenTruthRef}
                rows={1}
                value={hiddenTruth}
                onChange={handleInputChange(setHiddenTruth, hiddenTruthRef)}
                placeholder="예: 수칙서 4번은 괴이의 유인책이며, 화재 비상벨이 울릴 때 전원을 차단해야 함"
                style={textareaBaseStyle(highlightedSlot === 3)}
              />
            </div>

            {/* 4번: 파훼 및 봉인 순서 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: isMobile ? "0.82rem" : "0.88rem", fontWeight: "800", color: "#fb923c" }}>
                4. 파훼 및 봉인 순서 (계획한 행동 수칙)
              </label>
              <textarea 
                ref={ritualStepsRef}
                rows={2}
                value={ritualSteps}
                onChange={handleInputChange(setRitualSteps, ritualStepsRef)}
                placeholder="예: 1단계: 진명 지목으로 주의 분산 ➔ 2단계: 파트너와 함께 배전반 차단 ➔ 3단계: 비상문 빗장 봉인"
                style={textareaBaseStyle(highlightedSlot === 4)}
              />
            </div>
          </div>
        </div>

        {/* 3. 하단 결착 선언 CTA 바 */}
        <div style={{
          padding: isMobile ? "14px 18px" : "18px 28px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          backgroundColor: isDarkMode ? "rgba(12, 10, 9, 0.95)" : "rgba(245, 240, 235, 0.95)",
          display: "flex", flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between", alignItems: isMobile ? "stretch" : "center",
          gap: "14px", flexShrink: 0
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ fontSize: isMobile ? "0.86rem" : "0.95rem", fontWeight: "900", color: "#ea580c", display: "flex", alignItems: "center", gap: "6px" }}>
              <AlertTriangle size={16} /> 결착(結着) 단계 집행 준비
            </span>
            <span style={{ fontSize: isMobile ? "0.74rem" : "0.82rem", color: theme?.textMuted || "#a8a29e" }}>
              선언 시 작성한 가설을 바탕으로 최후의 사투와 주사위 판정이 시작됩니다.
            </span>
          </div>

          <button
            type="button"
            onClick={handleExecuteDeclaration}
            style={{
              padding: isMobile ? "13px 20px" : "15px 30px", borderRadius: "14px",
              backgroundColor: "#ea580c", color: "#fff",
              border: "none", fontWeight: "900", fontSize: isMobile ? "0.92rem" : "1.05rem",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              boxShadow: "0 4px 20px rgba(234, 88, 12, 0.45)",
              transition: "transform 0.15s, background-color 0.15s",
              flexShrink: 0
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#c2410c"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#ea580c"}
          >
            <Flame size={18} fill="#fff" /> 결착 선언 : 파훼 의식 집행 ➔
          </button>
        </div>
      </div>
    </div>
  );
}
