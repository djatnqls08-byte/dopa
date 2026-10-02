"use client";

import React, { useState } from "react";
import { X, BookOpen, Heart, UserRound, Lock, Image as ImageIcon } from "lucide-react";

export default function CharacterSheet({ activeSession, isDarkMode, isMobile, isSheetOpen, setIsSheetOpen, theme, setActivePortraitTarget, setShowPortraitEditModal }) {
  const [expandedNpcId, setExpandedNpcId] = useState(null);
  const [showBackstory, setShowBackstory] = useState(false);

  if (!isSheetOpen || !activeSession) return null;

  const sheet = activeSession.sheet || {};
  const npcs = sheet.npcs || [];
  const itemsAndClues = [...(sheet.items || []), ...(sheet.clues || []), ...(sheet.handouts?.filter(h => h.revealed) || [])];
  
  const hp = sheet.hp !== undefined ? sheet.hp : 100;
  const maxHp = sheet.maxHp || 100;
  const fatigue = sheet.fatigue || 0;

  // 🌟 (신규) 현재 룰 모드에 따라 UI 단어를 찰떡같이 바꿔주는 마법!
  const isDating = activeSession.ruleMode?.startsWith("dating");
  const isHorror = activeSession.ruleMode === "horror";

  const hpLabel = isDating ? "멘탈 (HP)" : isHorror ? "정신력 (HP)" : "신뢰도 (HP)";
  const fatigueLabel = isDating ? "스트레스 지수" : isHorror ? "침식도" : "수사 피로도";
  const itemLabel = isDating ? "기억 및 수집품" : isHorror ? "기이한 흔적 및 단서" : "사건 파일 & 물증";

  return (
    <>
      <div onClick={() => setIsSheetOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 99990, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} />
      <div style={{ position: "fixed", top: 0, bottom: 0, right: 0, zIndex: 99999, width: isMobile ? "100%" : "420px", backgroundColor: theme.bg, borderLeft: `1px solid ${theme.border}`, boxShadow: "-10px 0 40px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", animation: "slideLeft 0.3s ease-out" }}>
        
        {/* 헤더 (유령 저장 버튼 삭제 완료!) */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", backgroundColor: theme.panel, borderBottom: `1px solid ${theme.border}` }}>
          <span style={{ fontSize: "1.2rem", fontWeight: "900", color: theme.text }}>캐릭터 시트</span>
          <button onClick={() => setIsSheetOpen(false)} style={{ background: "none", border: "none", color: theme.textMuted, cursor: "pointer", padding: "4px" }}><X size={26} strokeWidth={2.5} /></button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* 주인공 프로필 카드 (🌟 사진 클릭 시에만 팝업 호출되도록 분리 완료!) */}
          <div style={{ backgroundColor: theme.panel, borderRadius: "16px", padding: "18px", border: `1px solid ${theme.border}`, boxShadow: "0 8px 20px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "16px" }}>
            <div 
              onClick={(e) => { 
                e.stopPropagation(); // 뒤로 클릭 이벤트 번짐 방지
                if (setActivePortraitTarget) { setActivePortraitTarget("pc"); setShowPortraitEditModal(true); setIsSheetOpen(false); } 
              }} 
              style={{ width: "72px", height: "72px", borderRadius: "50%", overflow: "hidden", border: `2px solid ${theme.borderHighlight}`, backgroundColor: theme.inputBg, flexShrink: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {sheet.portraitUrl || sheet.portrait ? <img src={sheet.portraitUrl || sheet.portrait} alt="주인공" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <UserRound size={32} color={theme.textMuted} />}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
              <span style={{ fontSize: "1.3rem", fontWeight: "900", color: theme.text }}>{sheet.name || "이름 미상"}</span>
              <span style={{ fontSize: "0.85rem", color: theme.textMuted, fontWeight: "600" }}>{sheet.job || "직업 미상"}</span>
            </div>
          </div>

          {/* 백스토리 & 비밀 아코디언 */}
          <div style={{ backgroundColor: theme.panel, borderRadius: "12px", border: `1px solid ${theme.border}`, overflow: "hidden" }}>
            <button onClick={() => setShowBackstory(!showBackstory)} style={{ width: "100%", padding: "14px 18px", background: "none", border: "none", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: theme.textMuted }}>
              <BookOpen size={18} strokeWidth={2.5} />
              <span style={{ fontWeight: "800", fontSize: "0.9rem", color: theme.text }}>내 캐릭터 백스토리 & 비밀</span>
            </button>
            {showBackstory && (
              <div style={{ padding: "0 18px 18px 18px", fontSize: "0.85rem", color: theme.text, lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                <div style={{ marginBottom: "10px" }}>{sheet.background || "기록된 배경 설정이 없습니다."}</div>
                {sheet.secret && (
                  <div style={{ backgroundColor: isDarkMode ? "rgba(220, 38, 38, 0.1)" : "#fef2f2", color: theme.danger, padding: "10px", borderRadius: "8px", border: `1px solid rgba(220, 38, 38, 0.3)` }}>
                    <strong style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}><Lock size={14} /> 나의 비밀</strong>
                    {sheet.secret}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 멘탈 & 스트레스 (🌟 모드에 따라 이름이 예쁘게 바뀝니다!) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", backgroundColor: isDarkMode ? "rgba(34, 197, 94, 0.15)" : "#dcfce7", border: `1px solid rgba(34, 197, 94, 0.4)`, borderRadius: "12px" }}>
              <span style={{ fontWeight: "800", fontSize: "0.95rem", color: "#16a34a" }}>{hpLabel}</span>
              <span style={{ fontWeight: "900", fontSize: "1.1rem", color: "#16a34a" }}>{hp} / {maxHp}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", backgroundColor: isDarkMode ? "rgba(245, 158, 11, 0.15)" : "#fef3c7", border: `1px solid rgba(245, 158, 11, 0.4)`, borderRadius: "12px" }}>
              <span style={{ fontWeight: "800", fontSize: "0.95rem", color: "#d97706" }}>{fatigueLabel}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "80px", height: "6px", backgroundColor: "rgba(217, 119, 6, 0.2)", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(100, Math.max(0, fatigue))}%`, height: "100%", backgroundColor: "#d97706", borderRadius: "4px" }} />
                </div>
                <span style={{ fontWeight: "900", fontSize: "1.1rem", color: "#d97706" }}>{fatigue}%</span>
              </div>
            </div>
          </div>

          {/* 수집품 및 단서 (🌟 모드별 단어 적용 완료!) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: theme.textMuted, paddingLeft: "4px" }}>
              <Heart size={16} strokeWidth={2.5} />
              <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>{itemLabel} ({itemsAndClues.length}건)</span>
            </div>
            {itemsAndClues.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", backgroundColor: isDarkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", border: `1px dashed ${theme.borderHighlight}`, borderRadius: "12px", color: theme.textMuted, fontSize: "0.85rem" }}>아직 획득한 아이템이 없습니다.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {itemsAndClues.map((item, idx) => (
                  <div key={idx} style={{ padding: "12px 16px", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "12px" }}>
                    <span style={{ fontWeight: "800", fontSize: "0.9rem", color: theme.text, display: "block", marginBottom: "4px" }}>{item.name}</span>
                    <span style={{ fontSize: "0.8rem", color: theme.textMuted, lineHeight: "1.5" }}>{item.desc || item.overview}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 등장인물 (🌟 아코디언과 사진 팝업 기능 100% 분리 완료!) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: theme.textMuted, paddingLeft: "4px" }}>
              <UserRound size={16} strokeWidth={2.5} />
              <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>주요 등장인물 ({npcs.length}명)</span>
            </div>
            {npcs.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", backgroundColor: isDarkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", border: `1px dashed ${theme.borderHighlight}`, borderRadius: "12px", color: theme.textMuted, fontSize: "0.85rem" }}>등록된 인물이 없습니다.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", paddingBottom: "30px" }}>
                {npcs.map((npc) => {
                  const isExpanded = expandedNpcId === npc.id;
                  const aff = npc.affection || 0;
                  const fillPercent = Math.max(0, Math.min(100, aff));
                  
                  return (
                    <div key={npc.id} style={{ backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "16px", overflow: "hidden", transition: "all 0.2s" }}>
                      
                      {/* 카드 몸통 (클릭 시 아코디언 열림) */}
                      <div onClick={() => setExpandedNpcId(isExpanded ? null : npc.id)} style={{ display: "flex", alignItems: "center", padding: "16px", cursor: "pointer" }}>
                        
                        {/* 초상화 사진 (클릭 시 사진 팝업 열림, 아코디언 동작 막음!) */}
                        <div 
                          onClick={(e) => {
                            e.stopPropagation(); // 여기서 막아야 아코디언이 안 열립니다!
                            if (setActivePortraitTarget && setShowPortraitEditModal) {
                              setActivePortraitTarget(npc.id);
                              setShowPortraitEditModal(true);
                              setIsSheetOpen(false); // 사진 바꿀 땐 시트를 잠깐 닫아줌
                            }
                          }}
                          style={{ width: "52px", height: "52px", borderRadius: "50%", backgroundColor: theme.inputBg, border: `1px solid ${theme.borderHighlight}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}
                        >
                          {npc.portraitUrl ? <img src={npc.portraitUrl} alt={npc.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <UserRound size={24} color={theme.textMuted} />}
                        </div>
                        
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", marginLeft: "14px", gap: "2px" }}>
                          <span style={{ fontSize: "1.05rem", fontWeight: "900", color: theme.text }}>{npc.name || "이름 미상"}</span>
                          <span style={{ fontSize: "0.75rem", color: theme.textMuted, fontWeight: "600" }}>{npc.job || "직업 미상"}</span>
                        </div>
                        
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: isDarkMode ? "rgba(239, 68, 68, 0.1)" : "#fef2f2", padding: "6px 12px", borderRadius: "20px" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24">
                            <defs>
                              <linearGradient id={`heartGrad-${npc.id}`} x1="0" y1="1" x2="0" y2="0">
                                <stop offset={`${fillPercent}%`} stopColor="#ef4444" />
                                <stop offset={`${fillPercent}%`} stopColor={isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(148, 163, 184, 0.4)"} />
                              </linearGradient>
                            </defs>
                            <path fill={`url(#heartGrad-${npc.id})`} stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                          <span style={{ fontWeight: "900", color: "#ef4444", fontSize: "0.95rem" }}>{aff}</span>
                        </div>
                      </div>
                      
                      {/* 아코디언이 열리면 보여주는 상세 정보! */}
                      {isExpanded && (
                        <div style={{ backgroundColor: isDarkMode ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.03)", padding: "16px", borderTop: `1px solid ${theme.border}` }}>
                          <div style={{ fontSize: "0.85rem", color: theme.text, lineHeight: "1.6", whiteSpace: "pre-wrap", marginBottom: "12px", fontWeight: "500" }}>{npc.behavior || "등록된 상세 설정이 없습니다."}</div>
                          <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", padding: "12px", borderRadius: "10px", border: `1px dashed ${theme.borderHighlight}` }}>
                            <Lock size={16} color={theme.textMuted} style={{ marginTop: "2px", flexShrink: 0 }} />
                            <div style={{ fontSize: "0.8rem", color: theme.textMuted, lineHeight: "1.5" }}>
                              {npc.secretRevealed ? <span style={{ color: theme.text }}><strong style={{ color: theme.accent }}>[밝혀진 진심]</strong> {npc.secret}</span> : <span><strong style={{ color: theme.danger }}>[숨겨진 비밀/진심]</strong> 아직 서사 속에서 밝혀지지 않은 비밀입니다. (조사 필요)</span>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
