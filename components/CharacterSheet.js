// 파일 위치: components/CharacterSheet.js
"use client";

import { FileSearch, LockOpen, Lock, UserRound, BookOpen, Heart, Activity, Ghost } from "lucide-react";

export default function CharacterSheet({
  activeSession,
  theme,
  isMobile,
  isSheetOpen,
  setIsSheetOpen,
  isDarkMode,
  setActivePortraitTarget,
  setShowPortraitEditModal,
  handleSaveCurrentAsPreset,
  handleSaveSessionAsLobbyPreset
}) {
  if (!activeSession || !activeSession.sheet) return null;
  const sheet = activeSession.sheet;

  // 🌟 (신규 추가!) 모드에 따른 아이콘 및 텍스트 분기 로직
  const getHandoutTitle = () => {
    if (activeSession.ruleMode === "dating") return { text: "기억 및 수집품", icon: <Heart size={14} strokeWidth={2.5} /> };
    if (activeSession.ruleMode === "horror") return { text: "기이한 흔적 및 단서", icon: <Ghost size={14} strokeWidth={2.5} /> };
    return { text: "사건 파일 & 물증", icon: <FileSearch size={14} strokeWidth={2.5} /> };
  };
  const handoutHeader = getHandoutTitle();

  return (
    <div style={{
      position: "absolute", top: 0, right: 0, bottom: 0, width: isMobile ? "100%" : "360px",
      backgroundColor: theme.sidebar, borderLeft: `1px solid ${theme.border}`, zIndex: 90,
      transform: isSheetOpen ? "translateX(0)" : "translateX(100%)",
      transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      display: "flex", flexDirection: "column", boxShadow: isSheetOpen ? "-10px 0 30px rgba(0,0,0,0.3)" : "none"
    }}>
      {/* ── 상단 헤더 ── */}
      <div style={{ padding: "18px 20px", borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.panel, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <span style={{ fontWeight: "900", fontSize: "1.05rem", color: theme.text }}>캐릭터 시트</span>
      </div>

      {/* ── 시트 본문 스크롤 영역 ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {/* 1. PC 프로필 카드 */}
        <div style={{ padding: "16px", borderRadius: "12px", display: "flex", gap: "14px", alignItems: "center", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <div
            onClick={() => { setActivePortraitTarget("pc"); setShowPortraitEditModal(true); }}
            title="초상화 변경"
            style={{ width: "60px", height: "60px", borderRadius: "50%", overflow: "hidden", border: `2px solid ${theme.accent}`, flexShrink: 0, cursor: "pointer", backgroundColor: theme.inputBg }}
          >
            {sheet.portrait ? (
              <img src={sheet.portrait} alt="PC" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => (e.currentTarget.style.display = "none")} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: theme.textMuted }}>
                 <UserRound size={24} strokeWidth={1.5}/>
              </div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ fontWeight: "900", fontSize: "1.1rem", color: theme.text }}>{sheet.name || "주인공"}</div>
            <div style={{ fontSize: "0.75rem", color: theme.textMuted, fontWeight: "600" }}>{sheet.job || "탐색자"}</div>
          </div>
        </div>

        {/* 2. 당면한 목표 (퀘스트) */}
        {sheet.currentObjective && (
          <div style={{ padding: "14px 16px", borderRadius: "10px", backgroundColor: "rgba(245, 158, 11, 0.08)", borderLeft: `4px solid ${theme.warning}` }}>
            <div style={{ fontSize: "0.72rem", color: theme.warning, fontWeight: "800", marginBottom: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
              <FileSearch size={14} strokeWidth={2.5} /> 당면한 목표 / 퀘스트
            </div>
            <div style={{ fontWeight: "800", fontSize: "0.9rem", color: theme.text, lineHeight: "1.4" }}>
              {sheet.currentObjective.main}
            </div>
            {sheet.currentObjective.step && (
              <div style={{ fontSize: "0.75rem", color: theme.textMuted, marginTop: "6px", display: "flex", alignItems: "flex-start", gap: "4px" }}>
                <span style={{ fontSize: "0.8rem", color: theme.warning }}>❯</span> 
                <span>{sheet.currentObjective.step}</span>
              </div>
            )}
          </div>
        )}

        {/* 3. 백스토리 & 시나리오 개요 아코디언 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <details style={{ cursor: "pointer", backgroundColor: theme.panelAlt, padding: "12px 14px", borderRadius: "8px", border: `1px solid ${theme.border}` }}>
            <summary style={{ fontSize: "0.8rem", fontWeight: "800", color: theme.text, outline: "none", display: "flex", alignItems: "center", gap: "6px" }}>
              <BookOpen size={16} color={theme.accent} /> 내 캐릭터 백스토리 & 비밀
            </summary>
            <div style={{ marginTop: "12px", fontSize: "0.78rem", lineHeight: "1.6", color: theme.textMuted, whiteSpace: "pre-wrap", borderTop: `1px dashed ${theme.border}`, paddingTop: "10px" }}>
              <strong style={{ color: theme.accent }}>[백스토리]</strong><br/>
              {sheet.background || "기재된 설정이 없습니다."}
              {sheet.secret && (
                <div style={{ marginTop: "10px", color: theme.danger }}>
                  <strong style={{ color: theme.danger }}>[숨겨진 비밀/사명]</strong><br/>
                  {sheet.secret}
                </div>
              )}
            </div>
          </details>
        </div>

        {/* 4. 신뢰도 & 피로도 (체력바) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", backgroundColor: "rgba(34, 197, 94, 0.1)", border: "1px solid rgba(34, 197, 94, 0.3)", borderRadius: "10px" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: "800", color: theme.success || "#22c55e" }}>
              {activeSession?.ruleMode === 'dating' ? '멘탈' : activeSession?.ruleMode === 'horror' ? '정신력' : '신뢰도'}
            </span>
            <strong style={{ color: theme.success || "#22c55e", fontSize: "0.95rem" }}>{sheet.hp || 100} / {sheet.maxHp || 100}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", backgroundColor: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "10px" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: "800", color: theme.warning || "#f59e0b" }}>
              {activeSession?.ruleMode === 'dating' ? '스트레스 지수' : activeSession?.ruleMode === 'horror' ? '침식도' : '수사 피로도'}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "60px", height: "6px", backgroundColor: "rgba(0,0,0,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: `${sheet.fatigue || 0}%`, height: "100%", backgroundColor: theme.warning || "#f59e0b", transition: "width 0.3s" }} />
              </div>
              <strong style={{ color: theme.warning || "#f59e0b", fontSize: "0.9rem" }}>{sheet.fatigue || 0}%</strong>
            </div>
          </div>
        </div>

        {/* 5. 소지품 인벤토리 */}
        {sheet.items && sheet.items.filter(it => it.name !== "소지품").length > 0 && (
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: "800", color: theme.textMuted, marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
              <LockOpen size={14} strokeWidth={2.5}/> 인벤토리
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {sheet.items.filter(it => it.name !== "소지품").map((it, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: "8px", padding: "8px 12px" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: "700", color: theme.text }}>{it.name}</span>
                  <span style={{ fontSize: "0.68rem", color: theme.textMuted, backgroundColor: theme.inputBg, padding: "2px 8px", borderRadius: "10px" }}>소지중</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. 사건 파일 & 단서 리스트 (단어 자동 변경 반영됨) */}
        <div>
          <div style={{ fontSize: "0.75rem", fontWeight: "800", color: theme.textMuted, marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
            {handoutHeader.icon} {handoutHeader.text} ({(sheet.handouts || []).length}건)
          </div>
          {(!sheet.handouts || sheet.handouts.length === 0) ? (
            <div style={{ textAlign: "center", padding: "20px", fontSize: "0.75rem", color: theme.textMuted, border: `1px dashed ${theme.border}`, borderRadius: "10px" }}>확보된 단서가 없습니다.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {sheet.handouts.map((h, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <div key={idx} style={{ backgroundColor: isEven ? (isDarkMode ? "#0c4a6e" : "#e0f2fe") : (isDarkMode ? "#4c1d95" : "#f3e8ff"), padding: "12px 14px", borderRadius: "6px", position: "relative", borderLeft: `4px solid ${isEven ? (isDarkMode ? "#0284c7" : "#0284c7") : (isDarkMode ? "#7c3aed" : "#9333ea")}`, boxShadow: "0 4px 10px rgba(0,0,0,0.1)", color: isDarkMode ? "#e0e7ff" : "#0f172a" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                      <span style={{ fontWeight: "900", fontSize: "0.85rem", color: isEven ? (isDarkMode ? "#38bdf8" : "#0369a1") : (isDarkMode ? "#c084fc" : "#6b21a8") }}>{h.name || h.title}</span>
                      {h.revealed ? <LockOpen size={14} strokeWidth={2.5} style={{ opacity: 0.6 }} /> : <Lock size={14} strokeWidth={2.5} style={{ opacity: 0.4 }} />}
                    </div>
                    <div style={{ fontSize: "0.75rem", lineHeight: "1.5", fontWeight: "500", opacity: 0.9, whiteSpace: "pre-wrap" }}>{h.revealed ? (h.secret || h.overview) : h.overview}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 🌟 7. 주요 등장인물 호감도 리스트 (클릭 활성화 완료!) */}
        {sheet.npcs && sheet.npcs.length > 0 && (
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: "800", color: theme.textMuted, marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
              <UserRound size={14} strokeWidth={2.5} /> 주요 등장인물 ({sheet.npcs.length}명)
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {sheet.npcs.map(npc => (
                <div key={npc.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", backgroundColor: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: "10px" }}>
                  
                  {/* 👇 인물 사진을 클릭했을 때 모달창 띄우기 */}
                  <div 
                    onClick={() => {
                      if (setActivePortraitTarget && setShowPortraitEditModal) {
                        setActivePortraitTarget(npc.id);
                        setShowPortraitEditModal(true);
                      }
                    }}
                    title="초상화 보기/변경"
                    style={{ 
                      width: "38px", height: "38px", borderRadius: "50%", overflow: "hidden", 
                      border: `1px solid ${theme.border}`, flexShrink: 0, backgroundColor: theme.inputBg,
                      cursor: "pointer" 
                    }}
                  >
                    {npc.portrait ? (
                      <img src={npc.portrait} alt={npc.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => (e.currentTarget.style.display = "none")} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: theme.textMuted }}>
                        <UserRound size={16} strokeWidth={2}/>
                      </div>
                    )}
                  </div>
                  {/* 👆 클릭 활성화 영역 끝 */}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: "800", fontSize: "0.85rem", color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{npc.name}</div>
                    <div style={{ fontSize: "0.68rem", color: theme.textMuted, marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{npc.title || npc.job || "관계자"}</div>
                  </div>
                  
                  {/* 🌟 룰에 따른 아이콘/명칭 동적 표시 */}
                  <div style={{ fontWeight: "900", color: activeSession?.ruleMode === 'dating' ? theme.danger : theme.warning, fontSize: "0.85rem", flexShrink: 0, display: "flex", alignItems: "center", gap: "4px" }}>
                     {activeSession?.ruleMode === 'dating' ? <Heart size={14} fill={theme.danger}/> : <Activity size={14} strokeWidth={2.5}/>}
                     {npc.affection || 0}
                  </div>
                  
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
