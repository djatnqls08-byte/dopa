"use client";

import React, { useState } from "react";
import { X, BookOpen, Heart, UserRound, Lock, ShieldAlert, Image as ImageIcon } from "lucide-react";

export default function CharacterSheet({ 
  activeSession, 
  isDarkMode, 
  isMobile, 
  isSheetOpen, 
  setIsSheetOpen, 
  theme,
  setActivePortraitTarget,
  setShowPortraitEditModal
}) {
  const [expandedNpcId, setExpandedNpcId] = useState(null);
  const [showBackstory, setShowBackstory] = useState(false);

  // 시트가 열려있지 않거나 세션이 없으면 렌더링하지 않음
  if (!isSheetOpen || !activeSession) return null;

  const sheet = activeSession.sheet || {};
  const npcs = sheet.npcs || [];
  
  // 수집품과 단서(취향 정보 등)를 하나로 합쳐서 보여줌
  const itemsAndClues = [
    ...(sheet.items || []), 
    ...(sheet.clues || []), 
    ...(sheet.handouts?.filter(h => h.revealed) || [])
  ];

  // 멘탈 & 스트레스 (연애/추리 공용)
  const hp = sheet.hp || 100;
  const maxHp = sheet.maxHp || 100;
  const fatigue = sheet.fatigue || 0; // 스트레스 지수

  return (
    <>
      {/* 🌟 배경 딤(Dim) 처리 (바깥 클릭 시 닫힘) */}
      <div 
        onClick={() => setIsSheetOpen(false)}
        style={{
          position: "fixed", inset: 0, zIndex: 99990,
          backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
          transition: "opacity 0.3s"
        }}
      />

      {/* 📱 핸드폰/태블릿 스타일 시트 패널 (우측에서 슬라이드 인) */}
      <div 
        style={{
          position: "fixed", top: 0, bottom: 0, right: 0, zIndex: 99999,
          width: isMobile ? "100%" : "420px",
          backgroundColor: theme.bg, // 🌟 이미지처럼 부드러운 베이지/그레이 배경
          borderLeft: `1px solid ${theme.border}`,
          boxShadow: "-10px 0 40px rgba(0,0,0,0.2)",
          display: "flex", flexDirection: "column",
          animation: "slideLeft 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)"
        }}
      >
        {/* 1. 상단 헤더 & X (닫기) 버튼 복구 */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "18px 24px", backgroundColor: theme.panel,
          borderBottom: `1px solid ${theme.border}`,
          boxShadow: "0 4px 12px rgba(0,0,0,0.03)", zIndex: 10
        }}>
          <span style={{ fontSize: "1.2rem", fontWeight: "900", color: theme.text, letterSpacing: "-0.5px" }}>
            캐릭터 시트
          </span>
          <button 
            onClick={() => setIsSheetOpen(false)}
            style={{ background: "none", border: "none", color: theme.textMuted, cursor: "pointer", display: "flex", padding: "4px" }}
          >
            <X size={26} strokeWidth={2.5} />
          </button>
        </div>

        {/* 2. 스크롤 가능한 본문 영역 */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "20px", WebkitOverflowScrolling: "touch" }}>
          
          {/* 🌟 주인공 프로필 카드 */}
          <div style={{
            backgroundColor: theme.panel, borderRadius: "16px", padding: "18px",
            border: `1px solid ${theme.border}`, boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
            display: "flex", alignItems: "center", gap: "16px"
          }}>
            <div 
              onClick={() => {
                if (setActivePortraitTarget && setShowPortraitEditModal) {
                  setActivePortraitTarget("pc");
                  setShowPortraitEditModal(true);
                  setIsSheetOpen(false);
                }
              }}
              title="사진 변경"
              style={{
                width: "72px", height: "72px", borderRadius: "50%", overflow: "hidden",
                border: `2px solid ${theme.borderHighlight}`, backgroundColor: theme.inputBg,
                flexShrink: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
              }}
            >
              {sheet.portrait ? (
                <img src={sheet.portrait} alt="주인공" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <UserRound size={32} color={theme.textMuted} />
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: "1.3rem", fontWeight: "900", color: theme.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {sheet.name || "이름 미상"}
              </span>
              <span style={{ fontSize: "0.85rem", color: theme.textMuted, fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {sheet.job || "직업 미상"}
              </span>
            </div>
          </div>

          {/* 🌟 백스토리 & 비밀 아코디언 */}
          <div style={{ backgroundColor: theme.panel, borderRadius: "12px", border: `1px solid ${theme.border}`, overflow: "hidden" }}>
            <button 
              onClick={() => setShowBackstory(!showBackstory)}
              style={{
                width: "100%", padding: "14px 18px", background: "none", border: "none",
                display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: theme.textMuted }}>
                <BookOpen size={18} strokeWidth={2.5} />
                <span style={{ fontWeight: "800", fontSize: "0.9rem", color: theme.text }}>내 캐릭터 백스토리 & 비밀</span>
              </div>
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

          {/* 🌟 멘탈 & 스트레스 지수 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* 멘탈 바 */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", backgroundColor: isDarkMode ? "rgba(34, 197, 94, 0.15)" : "#dcfce7", border: `1px solid rgba(34, 197, 94, 0.4)`, borderRadius: "12px" }}>
              <span style={{ fontWeight: "800", fontSize: "0.95rem", color: "#16a34a" }}>멘탈</span>
              <span style={{ fontWeight: "900", fontSize: "1.1rem", color: "#16a34a" }}>{hp} / {maxHp}</span>
            </div>
            
            {/* 스트레스 지수 바 */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", backgroundColor: isDarkMode ? "rgba(245, 158, 11, 0.15)" : "#fef3c7", border: `1px solid rgba(245, 158, 11, 0.4)`, borderRadius: "12px" }}>
              <span style={{ fontWeight: "800", fontSize: "0.95rem", color: "#d97706" }}>스트레스 지수</span>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "80px", height: "6px", backgroundColor: "rgba(217, 119, 6, 0.2)", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(100, Math.max(0, fatigue))}%`, height: "100%", backgroundColor: "#d97706", borderRadius: "4px" }} />
                </div>
                <span style={{ fontWeight: "900", fontSize: "1.1rem", color: "#d97706" }}>{fatigue}%</span>
              </div>
            </div>
          </div>

          {/* 🌟 기억 및 수집품 (단서 + 아이템) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: theme.textMuted, paddingLeft: "4px" }}>
              <Heart size={16} strokeWidth={2.5} />
              <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>기억 및 수집품 ({itemsAndClues.length}건)</span>
            </div>
            {itemsAndClues.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", backgroundColor: isDarkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", border: `1px dashed ${theme.borderHighlight}`, borderRadius: "12px", color: theme.textMuted, fontSize: "0.85rem" }}>
                아직 획득한 수집품이나 단서가 없습니다.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {itemsAndClues.map((item, idx) => (
                  <div key={idx} style={{ padding: "12px 16px", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ fontWeight: "800", fontSize: "0.9rem", color: theme.text }}>{item.name}</span>
                    <span style={{ fontSize: "0.8rem", color: theme.textMuted, lineHeight: "1.5" }}>{item.desc || item.overview}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 🌟 주요 등장인물 (호감도 및 비밀) - 파서 완벽 연동 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: theme.textMuted, paddingLeft: "4px" }}>
              <UserRound size={16} strokeWidth={2.5} />
              <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>주요 등장인물 ({npcs.length}명)</span>
            </div>
            
            {npcs.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", backgroundColor: isDarkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", border: `1px dashed ${theme.borderHighlight}`, borderRadius: "12px", color: theme.textMuted, fontSize: "0.85rem" }}>
                등록된 인물이 없습니다.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", paddingBottom: "30px" }}>
                {npcs.map((npc) => {
                  const isExpanded = expandedNpcId === npc.id;
                  
                  return (
                    <div key={npc.id} style={{ backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "16px", overflow: "hidden", transition: "all 0.2s" }}>
                      
                      {/* 인물 카드 헤더 (클릭 시 아코디언 열림) */}
                      <div 
                        onClick={() => setExpandedNpcId(isExpanded ? null : npc.id)}
                        style={{ display: "flex", alignItems: "center", padding: "16px", cursor: "pointer" }}
                      >
                        {/* 프로필 이미지 */}
                        <div style={{ width: "52px", height: "52px", borderRadius: "50%", backgroundColor: theme.inputBg, border: `1px solid ${theme.borderHighlight}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                          {npc.portraitUrl ? (
                            <img src={npc.portraitUrl} alt={npc.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <UserRound size={24} color={theme.textMuted} />
                          )}
                        </div>

                        {/* 이름 및 직업 */}
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", marginLeft: "14px", gap: "2px" }}>
                          <span style={{ fontSize: "1.05rem", fontWeight: "900", color: theme.text }}>{npc.name || "이름 미상"}</span>
                          <span style={{ fontSize: "0.75rem", color: theme.textMuted, fontWeight: "600" }}>{npc.job || "직업 미상"}</span>
                        </div>

                        {/* 🌟 호감도 (하트 아이콘) */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: isDarkMode ? "rgba(239, 68, 68, 0.1)" : "#fef2f2", padding: "6px 12px", borderRadius: "20px" }}>
                          <Heart size={16} fill="#ef4444" color="#ef4444" />
                          <span style={{ fontWeight: "900", color: "#ef4444", fontSize: "0.95rem" }}>
                            {npc.affection || 0}
                          </span>
                        </div>
                      </div>

                      {/* 확장된 상세 정보 영역 (이미지 UI 완벽 구현) */}
                      {isExpanded && (
                        <div style={{ backgroundColor: isDarkMode ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.03)", padding: "16px", borderTop: `1px solid ${theme.border}` }}>
                          <div style={{ fontSize: "0.85rem", color: theme.text, lineHeight: "1.6", whiteSpace: "pre-wrap", marginBottom: "12px", fontWeight: "500" }}>
                            {npc.behavior || "등록된 상세 설정이 없습니다."}
                          </div>

                          {/* 🌟 잠긴 비밀/진심 영역 */}
                          <div style={{ 
                            display: "flex", gap: "8px", alignItems: "flex-start", 
                            backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", 
                            padding: "12px", borderRadius: "10px", border: `1px dashed ${theme.borderHighlight}` 
                          }}>
                            <Lock size={16} color={theme.textMuted} style={{ marginTop: "2px", flexShrink: 0 }} />
                            <div style={{ fontSize: "0.8rem", color: theme.textMuted, lineHeight: "1.5" }}>
                              {npc.secretRevealed ? (
                                <span style={{ color: theme.text }}>
                                  <strong style={{ color: theme.accent }}>[밝혀진 진심]</strong> {npc.secret}
                                </span>
                              ) : (
                                <span>
                                  <strong style={{ color: theme.danger }}>[숨겨진 비밀/진심]</strong> 아직 서사 속에서 밝혀지지 않은 비밀입니다. (조사 필요)
                                </span>
                              )}
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
