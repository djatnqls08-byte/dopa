// components/SecretBoard.js
"use client";

import React, { useState, useRef } from "react";
import { 
  X, Pin, UserRound, FileText, Scale, 
  RotateCcw, AlertCircle, Skull, Mask
} from "lucide-react";

export default function SecretBoard({ 
  activeSession, 
  theme, 
  isMobile, 
  onClose, 
  onDeclareMystery 
}) {
  if (!activeSession) return null;

  const sheet = activeSession.sheet || {};
  const npcs = sheet.npcs || [];
  const clues = [...(sheet.clues || []), ...(sheet.items || [])];

  // 🎭 플레이어가 범인/흑막인지 감지 (피카레스크 완전범죄 모드 플래그)
  const pcName = sheet.name || "도파미너";
  const scenarioContext = ((activeSession.scenarioText || "") + " " + (activeSession.title || "")).toLowerCase();
  const isCulpritPC = scenarioContext.includes(`진범: ${pcName.toLowerCase()}`) || 
                      scenarioContext.includes(`흑막: ${pcName.toLowerCase()}`) ||
                      scenarioContext.includes(`범인: ${pcName.toLowerCase()}`) ||
                      Boolean(activeSession.culpritName && activeSession.culpritName === pcName);

  // 4대 사건 전말 가설 슬롯 상태
  const [culprit, setCulprit] = useState("");
  const [trick, setTrick] = useState("");
  const [smokingGun, setSmokingGun] = useState("");
  const [narrative, setNarrative] = useState("");

  const [lastInsertedSlot, setLastInsertedSlot] = useState(null);

  // 자동 높이 조절용 ref
  const culpritRef = useRef(null);
  const trickRef = useRef(null);
  const smokingGunRef = useRef(null);
  const narrativeRef = useRef(null);

  // 높이 자동 팽창 헬퍼
  const autoResize = (el) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 46)}px`;
  };

  const handleInputChange = (setter, ref) => (e) => {
    setter(e.target.value);
    autoResize(ref.current);
  };

  // 용의자 터치 ➔ 1번 [지목할 진범 / 누명 씌울 희생양] 슬롯 자동 주입
  const handleSelectSuspect = (name) => {
    setCulprit(name);
    triggerSlotFeedback(1);
    setTimeout(() => autoResize(culpritRef.current), 50);
  };

  // 단서 터치 ➔ 3번 [결정적 물증 / 위조 식립 물증] 슬롯 자동 주입
  const handleSelectClueAsSmokingGun = (clueName) => {
    setSmokingGun(clueName);
    triggerSlotFeedback(3);
    setTimeout(() => autoResize(smokingGunRef.current), 50);
  };

  // 단서 터치 ➔ 2번 [범행 트릭 / 조작된 정황] 슬롯 보조 주입
  const handleSelectClueAsTrick = (clueName) => {
    setTrick(prev => {
      const next = prev ? `${prev}\n• ${clueName}` : clueName;
      return next;
    });
    triggerSlotFeedback(2);
    setTimeout(() => autoResize(trickRef.current), 50);
  };

  const triggerSlotFeedback = (slotNum) => {
    setLastInsertedSlot(slotNum);
    setTimeout(() => setLastInsertedSlot(null), 1000);
  };

  // 가설 초기화
  const handleReset = () => {
    const msg = isCulpritPC ? "작성 중인 위장 공작 내용을 모두 초기화하시겠습니까?" : "작성 중인 수사 가설을 모두 초기화하시겠습니까?";
    if (confirm(msg)) {
      setCulprit("");
      setTrick("");
      setSmokingGun("");
      setNarrative("");
      [culpritRef, trickRef, smokingGunRef, narrativeRef].forEach(ref => {
        if (ref.current) ref.current.style.height = "auto";
      });
    }
  };

  // 최종 [ ⚖️ 진상 결착 OR 🎭 위장 결착 ]
  const handleLaunchAccusation = () => {
    if (!culprit.trim()) {
      alert(isCulpritPC ? "누명을 씌울 희생양(1번 슬롯)을 지정해야 공작을 격발할 수 있습니다." : "지목할 진범(1번 슬롯)을 지정해야 전말을 격발할 수 있습니다.");
      return;
    }
    if (!smokingGun.trim()) {
      alert(isCulpritPC ? "희생양을 매장할 위조 물증(3번 슬롯)을 제시해야 합니다." : "범행을 입증할 결정적 물증(3번 슬롯)을 제시해야 합니다.");
      return;
    }

    const formattedAccusation = isCulpritPC 
      ? `[🎭 위장 결착 : 희생양 매장 및 누명 격발]
• 누명 대상(희생양): ${culprit.trim()}
• 조작 정황: ${trick.trim() || "희생양의 알리바이 공백을 노린 정황 조작"}
• 식립 위조 물증: ${smokingGun.trim()}
• 가짜 전말: ${narrative.trim() || "탐정을 속여 희생양을 진범으로 확정 짓는 위장 시나리오"}`
      : `[⚖️ 진상 결착 : 전말 격발]
• 지목 진범: ${culprit.trim()}
• 범행 수법: ${trick.trim() || "현장 알리바이 조작 및 계획적 범행"}
• 결정적 물증: ${smokingGun.trim()}
• 사건 전말: ${narrative.trim() || "수집된 단서와 알리바이 모순에 기반한 확정적 진상"}`;

    if (onDeclareMystery) {
      onDeclareMystery(formattedAccusation, {
        isCulpritPC,
        culprit: culprit.trim(),
        trick: trick.trim() || (isCulpritPC ? "정황 조작" : "현장 알리바이 조작"),
        smokingGun: smokingGun.trim(),
        narrative: narrative.trim() || (isCulpritPC ? "위장 시나리오" : "확정적 진상")
      });
    }
    onClose();
  };

  const isReady = culprit.trim().length > 0 && smokingGun.trim().length > 0;

  // 공통 시원한 텍스트에어리어 스타일
  const textareaBaseStyle = (isHighlighted) => ({
    width: "100%",
    minHeight: "48px",
    padding: isMobile ? "12px 14px" : "14px 16px",
    borderRadius: "10px",
    backgroundColor: "#0d0b0a",
    border: `1.5px solid ${isHighlighted ? (isCulpritPC ? "#ef4444" : "#f59e0b") : "#38312b"}`,
    color: "#ffffff",
    fontSize: isMobile ? "0.95rem" : "1.02rem",
    lineHeight: "1.65",
    outline: "none",
    resize: "none",
    overflow: "hidden",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    boxShadow: isHighlighted ? `0 0 14px ${isCulpritPC ? "rgba(239, 68, 68, 0.35)" : "rgba(245, 158, 11, 0.25)"}` : "none"
  });

  const accentColor = isCulpritPC ? "#ef4444" : "#f59e0b";

  return (
    <div 
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100000,
        backgroundColor: "rgba(5, 5, 5, 0.88)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: isMobile ? "10px" : "24px", animation: "fadeIn 0.2s ease-out"
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: "860px", height: "92vh", maxHeight: "900px",
          backgroundColor: "#13110f",
          border: `1.5px solid ${isCulpritPC ? "#5c1d1d" : "#3d322a"}`,
          borderRadius: "22px", overflow: "hidden", display: "flex", flexDirection: "column",
          boxShadow: isCulpritPC ? "0 25px 70px rgba(0,0,0,0.85), 0 0 40px rgba(239, 68, 68, 0.12)" : "0 25px 70px rgba(0,0,0,0.85), 0 0 40px rgba(245, 158, 11, 0.08)",
          color: "#f8fafc"
        }}
      >
        {/* 1. 상단 수사본부 / 위장 공작 헤더 */}
        <div style={{
          padding: isMobile ? "16px 18px" : "20px 28px",
          backgroundColor: isCulpritPC ? "#1a0f0f" : "#181512",
          borderBottom: `1px solid ${isCulpritPC ? "#3d1b1b" : "#2e2620"}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "42px", height: "42px", borderRadius: "12px",
              backgroundColor: isCulpritPC ? "rgba(239, 68, 68, 0.15)" : "rgba(245, 158, 11, 0.15)", 
              border: `1.5px solid ${isCulpritPC ? "rgba(239, 68, 68, 0.35)" : "rgba(245, 158, 11, 0.35)"}`,
              display: "flex", alignItems: "center", justifyContent: "center", color: accentColor
            }}>
              <Pin size={22} style={{ transform: "rotate(45deg)" }} />
            </div>
            <div>
              <div style={{ fontSize: isMobile ? "1.08rem" : "1.25rem", fontWeight: "900", color: accentColor, letterSpacing: "-0.3px" }}>
                {isCulpritPC ? "🎭 완전범죄 공작보드 (FRAME-UP DOSSIER)" : "수사 본부 증거보드 (EVIDENCE DOSSIER)"}
              </div>
              <div style={{ fontSize: isMobile ? "0.78rem" : "0.85rem", color: "#a8a29e", fontWeight: "600", marginTop: "2px" }}>
                {isCulpritPC 
                  ? `[흑막: ${pcName}] · 위장 공작 대상 물색 및 탐정 유도용 알리바이 조작`
                  : `사건: 《${activeSession.title || "사건명 미상"}》 · 확보 단서 ${clues.length}건 · 용의자 ${npcs.length}명`}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button 
              type="button" 
              onClick={handleReset} 
              title="가설/공작 초기화"
              style={{ background: "none", border: "none", color: "#78716c", cursor: "pointer", padding: "8px", display: "flex" }}
            >
              <RotateCcw size={20} />
            </button>
            <button 
              type="button" 
              onClick={onClose}
              style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.06)", border: "none", color: "#d6d3d1", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 2. 본문 스크롤 영역 */}
        <div style={{
          flex: 1, minHeight: 0, overflowY: "auto", padding: isMobile ? "16px" : "26px",
          display: "flex", flexDirection: "column", gap: "26px",
          backgroundImage: "radial-gradient(#2b241e 1.2px, transparent 1.2px)", backgroundSize: "20px 20px"
        }}>
          
          {/* 👥 1섹션: 용의자 / 희생양 후보 카드 덱 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: isMobile ? "0.92rem" : "1rem", fontWeight: "900", color: accentColor, display: "flex", alignItems: "center", gap: "8px" }}>
                <UserRound size={18} /> {isCulpritPC ? `누명을 씌울 희생양 후보 (${npcs.length}명)` : `용의자 및 사건 관계자 (${npcs.length}명)`}
              </span>
              <span style={{ fontSize: isMobile ? "0.74rem" : "0.82rem", color: "#a8a29e" }}>
                {isCulpritPC ? "희생양을 터치하면 1번 대상 슬롯에 자동 지정됩니다." : "인물을 터치하면 1번 진범 슬롯에 자동 지정됩니다."}
              </span>
            </div>

            <div style={{
              display: "flex", gap: "14px", overflowX: "auto", padding: "12px 4px 8px",
              WebkitOverflowScrolling: "touch"
            }}>
              {npcs.length === 0 ? (
                <div style={{ padding: "24px", color: "#78716c", fontSize: "0.88rem" }}>등록된 인물이 없습니다.</div>
              ) : (
                npcs.map((npc, idx) => {
                  const isSelected = culprit === npc.name;
                  return (
                    <div 
                      key={npc.id || idx}
                      onClick={() => handleSelectSuspect(npc.name)}
                      style={{
                        minWidth: isMobile ? "125px" : "145px", maxWidth: isMobile ? "135px" : "155px",
                        backgroundColor: isSelected ? (isCulpritPC ? "rgba(239, 68, 68, 0.16)" : "rgba(245, 158, 11, 0.16)") : "#1c1917",
                        border: `1.5px solid ${isSelected ? accentColor : "#38312b"}`,
                        borderRadius: "16px", padding: "14px 12px 12px",
                        cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center",
                        position: "relative", flexShrink: 0, transition: "all 0.15s ease",
                        boxShadow: isSelected ? `0 8px 26px ${isCulpritPC ? "rgba(239, 68, 68, 0.35)" : "rgba(245, 158, 11, 0.3)"}` : "0 4px 14px rgba(0,0,0,0.35)",
                        transform: isSelected ? "scale(1.03)" : "scale(1)"
                      }}
                    >
                      <div style={{ position: "absolute", top: "-10px", color: isSelected ? accentColor : "#ef4444", zIndex: 2 }}>
                        <Pin size={22} fill={isSelected ? accentColor : "#ef4444"} style={{ transform: "rotate(45deg)" }} />
                      </div>

                      <div style={{
                        width: "100%", aspectRatio: "1/1",
                        backgroundColor: "#292524", borderRadius: "12px",
                        overflow: "hidden", border: `1px solid ${isSelected ? accentColor : "#44403c"}`,
                        display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px"
                      }}>
                        {npc.portraitUrl || npc.portrait ? (
                          <img src={npc.portraitUrl || npc.portrait} alt={npc.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <UserRound size={42} color="#78716c" />
                        )}
                      </div>

                      <div style={{ fontWeight: "900", color: "#f5f5f4", fontSize: isMobile ? "0.92rem" : "1rem", textAlign: "center", width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {npc.name}
                      </div>
                      <div style={{ fontSize: isMobile ? "0.72rem" : "0.78rem", color: "#a8a29e", marginTop: "3px", textAlign: "center", width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {npc.job || "신분 미상"}
                      </div>

                      <div style={{ marginTop: "8px", fontSize: "0.72rem", fontWeight: "800", color: isSelected ? accentColor : "#78716c" }}>
                        {isCulpritPC 
                          ? (isSelected ? "✓ 희생양 지정됨" : "+ 희생양 지정") 
                          : (isSelected ? "✓ 진범 지정됨" : "+ 진범 꽂기")}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 📂 2섹션: 확보된 사건 단서 및 물증 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: isMobile ? "0.92rem" : "1rem", fontWeight: "900", color: accentColor, display: "flex", alignItems: "center", gap: "8px" }}>
                <FileText size={18} /> {isCulpritPC ? `현장 단서 및 식립할 조작 증거물 (${clues.length}건)` : `확보된 사건 단서 및 물증 (${clues.length}건)`}
              </span>
              <span style={{ fontSize: isMobile ? "0.74rem" : "0.82rem", color: "#a8a29e" }}>
                {isCulpritPC ? "단서를 터치하여 위조 물증 슬롯에 지정할 수 있습니다." : "단서를 터치하여 스모킹 건 슬롯에 지정할 수 있습니다."}
              </span>
            </div>

            {clues.length === 0 ? (
              <div style={{ padding: "28px", border: "1.5px dashed #3d322a", borderRadius: "14px", textAlign: "center", color: "#78716c", fontSize: "0.88rem", backgroundColor: "rgba(0,0,0,0.3)" }}>
                {isCulpritPC ? "조작에 활용할 수 있는 증거물이나 소지품이 없습니다." : "아직 수집된 결정적 증거가 없습니다. 현장 조사와 심문을 통해 물증을 확보하십시오."}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "12px" }}>
                {clues.map((item, idx) => {
                  const clueName = typeof item === "string" ? item : (item.name || item.title || "미확인 단서");
                  const clueDesc = typeof item === "object" ? (item.desc || item.overview || item.detail || "") : "";
                  const isSelectedGun = smokingGun === clueName;

                  return (
                    <div 
                      key={idx}
                      style={{
                        padding: isMobile ? "14px" : "16px", 
                        backgroundColor: isSelectedGun ? (isCulpritPC ? "rgba(239, 68, 68, 0.14)" : "rgba(245, 158, 11, 0.14)") : "rgba(28, 25, 23, 0.8)",
                        border: `1.5px solid ${isSelectedGun ? accentColor : "#38312b"}`,
                        borderRadius: "14px", display: "flex", flexDirection: "column", gap: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.25)"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: "900", fontSize: isMobile ? "0.92rem" : "1rem", color: isSelectedGun ? accentColor : (isCulpritPC ? "#fca5a5" : "#fbbf24") }}>
                          • {clueName}
                        </span>
                        {isSelectedGun && (
                          <span style={{ fontSize: "0.68rem", padding: "2px 8px", borderRadius: "4px", backgroundColor: accentColor, color: "#fff", fontWeight: "900" }}>
                            {isCulpritPC ? "위조물증 지정" : "스모킹건 지정"}
                          </span>
                        )}
                      </div>

                      {clueDesc && (
                        <div style={{ fontSize: isMobile ? "0.8rem" : "0.86rem", color: "#d6d3d1", lineHeight: "1.5" }}>
                          {clueDesc}
                        </div>
                      )}

                      <div style={{ display: "flex", gap: "8px", marginTop: "auto", paddingTop: "6px" }}>
                        <button
                          type="button"
                          onClick={() => handleSelectClueAsSmokingGun(clueName)}
                          style={{
                            flex: 1, padding: "8px 10px", borderRadius: "8px", border: "none",
                            backgroundColor: isSelectedGun ? accentColor : (isCulpritPC ? "rgba(239, 68, 68, 0.2)" : "rgba(245, 158, 11, 0.2)"),
                            color: isSelectedGun ? "#fff" : (isCulpritPC ? "#f87171" : "#fbbf24"),
                            fontSize: isMobile ? "0.78rem" : "0.82rem", fontWeight: "800", cursor: "pointer"
                          }}
                        >
                          {isCulpritPC ? "위조 물증 지정" : "스모킹건 지정"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectClueAsTrick(clueName)}
                          style={{
                            padding: "8px 12px", borderRadius: "8px",
                            backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid #44403c",
                            color: "#d6d3d1", fontSize: isMobile ? "0.78rem" : "0.82rem", fontWeight: "700", cursor: "pointer"
                          }}
                        >
                          {isCulpritPC ? "정황 조작에 추가" : "트릭에 추가"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 🎯 3섹션: 사건 전말 가설 수립 및 위장 공작 슬롯 */}
          <div style={{
            backgroundColor: isCulpritPC ? "rgba(26, 17, 17, 0.95)" : "rgba(24, 21, 18, 0.95)", borderRadius: "18px",
            border: `1.5px solid ${isCulpritPC ? "#5c2424" : "#3d322a"}`, padding: isMobile ? "16px" : "22px",
            display: "flex", flexDirection: "column", gap: "16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Scale size={20} color={accentColor} />
                <span style={{ fontSize: isMobile ? "0.95rem" : "1.08rem", fontWeight: "900", color: accentColor }}>
                  {isCulpritPC ? "완전범죄 위장 공작 수립 (상단 터치 및 자유 타이핑)" : "사건 전말 가설 수립 (상단 터치 주입 및 자유로운 작성)"}
                </span>
              </div>
              <span style={{ fontSize: "0.76rem", color: "#a8a29e" }}>
                ※ Enter로 자유롭게 줄바꿈하며 칸이 자동 확장됩니다.
              </span>
            </div>

            {/* 1열: 진범 지목 + 트릭 파훼 */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1.2fr", gap: "14px" }}>
              
              {/* 슬롯 1: 진범 지목 OR 희생양 지정 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: isMobile ? "0.82rem" : "0.88rem", fontWeight: "800", color: accentColor }}>
                  {isCulpritPC ? "1. 누명을 씌울 희생양 (Target Scapegoat)" : "1. 지목할 진범 (주모자 / 실체)"}
                </label>
                <textarea
                  ref={culpritRef}
                  rows={1}
                  value={culprit}
                  onChange={handleInputChange(setCulprit, culpritRef)}
                  placeholder={isCulpritPC ? "예: 백수진 (의심을 사기 가장 쉬운 인물)" : "예: 백수진, 지하 4층 관리자"}
                  style={textareaBaseStyle(lastInsertedSlot === 1)}
                />
              </div>

              {/* 슬롯 2: 범행 트릭 OR 조작된 정황 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: isMobile ? "0.82rem" : "0.88rem", fontWeight: "800", color: accentColor }}>
                  {isCulpritPC ? "2. 조작된 범행 정황 및 알리바이 공백 (Fabricated Circumstance)" : "2. 파훼할 범행 트릭 및 수법"}
                </label>
                <textarea
                  ref={trickRef}
                  rows={1}
                  value={trick}
                  onChange={handleInputChange(setTrick, trickRef)}
                  placeholder={isCulpritPC ? "희생양이 범인으로 몰릴 수밖에 없는 조작된 행적과 시간대..." : "예: 배전반을 차단해 시차를 조작하고 비상구로 도주함 (줄바꿈 가능)"}
                  style={textareaBaseStyle(lastInsertedSlot === 2)}
                />
              </div>

            </div>

            {/* 슬롯 3: 결정적 물증 OR 위조 식립 물증 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: isMobile ? "0.82rem" : "0.88rem", fontWeight: "800", color: accentColor }}>
                {isCulpritPC ? "3. 식립한 위조 물증 (Planted Evidence)" : "3. 결정적 물증 (스모킹 건 / 핵심 증거물)"}
              </label>
              <textarea
                ref={smokingGunRef}
                rows={1}
                value={smokingGun}
                onChange={handleInputChange(setSmokingGun, smokingGunRef)}
                placeholder={isCulpritPC ? "희생양의 락커나 주머니에 몰래 심어둔 피 묻은 장갑, 위조 흉기 등..." : "범인이 절대 반박할 수 없는 단 하나의 결정적 물증 (상단 단서 터치 또는 직접 입력)"}
                style={textareaBaseStyle(lastInsertedSlot === 3)}
              />
            </div>

            {/* 슬롯 4: 전말 추리 해설 OR 탐정 유도용 가짜 전말 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: isMobile ? "0.82rem" : "0.88rem", fontWeight: "800", color: accentColor }}>
                {isCulpritPC ? "4. 탐정 유도용 가짜 전말 (Framing Story)" : "4. 탐정의 사건 전말 추리 해설 (범행 동기 및 종합 타임라인)"}
              </label>
              <textarea
                ref={narrativeRef}
                rows={2}
                value={narrative}
                onChange={handleInputChange(setNarrative, narrativeRef)}
                placeholder={isCulpritPC ? "탐정이 완전히 속아 넘어가 희생양을 체포하게 만들 정교한 가짜 추리 시나리오..." : "이 사건은 처음부터 피해자의 유산을 노린 계획 범행이었습니다... 자유롭게 타이핑하십시오."}
                style={textareaBaseStyle(lastInsertedSlot === 4)}
              />
            </div>

          </div>

        </div>

        {/* 4. 하단 결착 액션 푸터 */}
        <div style={{
          padding: isMobile ? "14px 18px" : "18px 28px",
          backgroundColor: isCulpritPC ? "#1a0f0f" : "#181512",
          borderTop: `1px solid ${isCulpritPC ? "#3d1b1b" : "#2e2620"}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          gap: "16px", flexShrink: 0
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: isReady ? accentColor : "#78716c", fontWeight: "800", fontSize: isMobile ? "0.86rem" : "0.95rem" }}>
              <AlertCircle size={16} /> {isCulpritPC ? "위장 결착 준비 : 희생양 매장 공작 완료" : "결착(結着) 단계 전말 격발 준비"}
            </div>
            <span style={{ fontSize: isMobile ? "0.74rem" : "0.82rem", color: "#a8a29e" }}>
              {isCulpritPC ? "선언 시 탐정을 속여 무고한 인물에게 누명을 씌우는 최후의 공작이 시작됩니다." : "선언 시 작성한 가설을 바탕으로 최후의 3단계 논리 공방이 시작됩니다."}
            </span>
          </div>

          <button
            type="button"
            onClick={handleLaunchAccusation}
            disabled={!isReady}
            style={{
              padding: isMobile ? "13px 20px" : "15px 30px", borderRadius: "14px",
              backgroundColor: isReady ? (isCulpritPC ? "#dc2626" : "#ea580c") : "#292524",
              color: isReady ? "#fff" : "#78716c",
              border: "none",
              fontWeight: "900", fontSize: isMobile ? "0.92rem" : "1.05rem",
              cursor: isReady ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", gap: "8px",
              boxShadow: isReady ? `0 4px 20px ${isCulpritPC ? "rgba(220, 38, 38, 0.45)" : "rgba(234, 88, 12, 0.4)"}` : "none",
              transition: "transform 0.15s ease",
              flexShrink: 0
            }}
            onMouseEnter={e => { if (isReady) e.currentTarget.style.transform = "scale(1.02)"; }}
            onMouseLeave={e => { if (isReady) e.currentTarget.style.transform = "scale(1)"; }}
          >
            <Scale size={18} />
            <span>{isCulpritPC ? "🎭 위장 결착 : 희생양 매장 및 누명 격발 ➔" : "⚖️ 결착 선언 : 전말 격발 ➔"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
