// components/TasteModal.js
"use client";

import React, { useState } from "react";
import { 
  X, BookOpen, Gift, Heart, ShieldAlert, 
  Pin, UserRound, Sparkles, Package, AlertCircle 
} from "lucide-react";

export default function TasteModal({
  isOpen,
  onClose,
  activeSession,
  theme,
  isDarkMode = true,
  isMobile = false,
  initialNpc = null,
  onGiveGift // 선물 건네기 클릭 시 실행될 콜백 (targetNpc, item) => void
}) {
  if (!isOpen || !activeSession) return null;

  const sheet = activeSession.sheet || {};
  const npcs = sheet.npcs || [];
  const items = sheet.items || [];
  const clues = sheet.clues || [];

  // 현재 선택된 인물 (초기값: 열 때 전달받은 NPC or 1번째 NPC)
  const [selectedNpcId, setSelectedNpcId] = useState(
    initialNpc?.id || activeSession.activeContactId || npcs[0]?.id || 1
  );

  const selectedNpc = npcs.find(n => n.id === selectedNpcId) || npcs[0] || { name: "상대방" };

  // 선택된 인물의 취향 단서들 필터링
  const npcClues = clues.filter(c => 
    (c.name && c.name.includes(selectedNpc.name)) || 
    c.npcName === selectedNpc.name || 
    npcs.length <= 1
  );

  const likes = npcClues.filter(c => c.type !== "dislike");
  const dislikes = npcClues.filter(c => c.type === "dislike");

  const handleSendGift = (item) => {
    if (onGiveGift) {
      onGiveGift(selectedNpc, item);
    }
    onClose();
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        backgroundColor: "rgba(10, 8, 8, 0.82)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: isMobile ? "10px" : "20px", animation: "fadeIn 0.2s ease-out"
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: "720px", maxHeight: "90vh",
          backgroundColor: isDarkMode ? "#141110" : "#fff",
          border: "1.5px solid rgba(244, 63, 94, 0.35)",
          borderRadius: "24px", display: "flex", flexDirection: "column",
          boxShadow: "0 25px 60px rgba(0,0,0,0.85), 0 0 35px rgba(244, 63, 94, 0.12)",
          overflow: "hidden", color: theme?.text || "#fff"
        }}
      >
        {/* 1. 상단 모달 헤더 */}
        <div style={{
          padding: isMobile ? "14px 18px" : "18px 24px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderBottom: "1px dashed rgba(255, 255, 255, 0.1)",
          backgroundColor: isDarkMode ? "rgba(24, 20, 18, 0.7)" : "#fdf8f6",
          flexShrink: 0
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "38px", height: "38px", borderRadius: "12px",
              backgroundColor: "rgba(244, 63, 94, 0.15)", border: "1.5px solid rgba(244, 63, 94, 0.35)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#f43f5e"
            }}>
              <BookOpen size={20} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#f43f5e", fontWeight: "900", fontSize: isMobile ? "1.02rem" : "1.18rem" }}>
                취향 수첩 & 마음 전달 (TASTE & GIFT)
              </div>
              <div style={{ fontSize: "0.76rem", color: theme?.textMuted || "#a8a29e", marginTop: "2px", fontWeight: "600" }}>
                서사 속에서 파악된 인물별 관심사 열람 및 가방 속 선물 건네기
              </div>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            style={{
              width: "34px", height: "34px", borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.06)", border: "none",
              color: theme?.textMuted || "#a8a29e", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 2. 스크롤 본문 */}
        <div style={{
          flex: 1, minHeight: 0, overflowY: "auto", padding: isMobile ? "14px" : "20px",
          display: "flex", flexDirection: "column", gap: "22px"
        }}>
          
          {/* 👥 1섹션: 인연 대상 카드 덱 (수사보드 스타일 대형 포트레이트 + 붉은 핀) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: isMobile ? "0.88rem" : "0.95rem", fontWeight: "800", color: "#f43f5e", display: "flex", alignItems: "center", gap: "6px" }}>
                <UserRound size={16} /> 인연 대상 ({npcs.length}명)
              </span>
              <span style={{ fontSize: "0.72rem", color: "#a8a29e" }}>
                인물을 터치하여 취향을 확인하고 선물을 건넬 상대를 변경합니다.
              </span>
            </div>

            <div style={{
              display: "flex", gap: "12px", overflowX: "auto", padding: "10px 4px 6px",
              WebkitOverflowScrolling: "touch"
            }}>
              {npcs.length === 0 ? (
                <div style={{ padding: "16px", color: "#a8a29e", fontSize: "0.82rem" }}>등록된 인물이 없습니다.</div>
              ) : (
                npcs.map((npc, idx) => {
                  const isSelected = selectedNpcId === npc.id;
                  return (
                    <div
                      key={npc.id || idx}
                      onClick={() => setSelectedNpcId(npc.id)}
                      style={{
                        minWidth: isMobile ? "115px" : "130px", maxWidth: isMobile ? "125px" : "140px",
                        backgroundColor: isSelected ? "rgba(244, 63, 94, 0.16)" : (isDarkMode ? "#1c1816" : "#fdfbf9"),
                        border: `1.5px solid ${isSelected ? "#f43f5e" : "rgba(255,255,255,0.08)"}`,
                        borderRadius: "16px", padding: "12px 10px 10px",
                        cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center",
                        position: "relative", flexShrink: 0, transition: "all 0.15s ease",
                        boxShadow: isSelected ? "0 8px 24px rgba(244, 63, 94, 0.3)" : "0 4px 12px rgba(0,0,0,0.25)",
                        transform: isSelected ? "scale(1.03)" : "scale(1)"
                      }}
                    >
                      {/* 📌 상단 붉은 핀 */}
                      <div style={{ position: "absolute", top: "-8px", color: isSelected ? "#f43f5e" : "#ef4444", zIndex: 2 }}>
                        <Pin size={18} fill={isSelected ? "#f43f5e" : "#ef4444"} style={{ transform: "rotate(45deg)" }} />
                      </div>

                      {/* 1:1 사진 */}
                      <div style={{
                        width: "100%", aspectRatio: "1/1",
                        backgroundColor: "#292524", borderRadius: "10px",
                        overflow: "hidden", border: `1px solid ${isSelected ? "rgba(244, 63, 94, 0.5)" : "rgba(255,255,255,0.08)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px"
                      }}>
                        {npc.portraitUrl || npc.portrait ? (
                          <img src={npc.portraitUrl || npc.portrait} alt={npc.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <UserRound size={32} color="#78716c" />
                        )}
                      </div>

                      <div style={{ fontWeight: "900", color: "#f5f5f4", fontSize: "0.88rem", textAlign: "center", width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {npc.name}
                      </div>
                      <div style={{ fontSize: "0.68rem", color: "#a8a29e", marginTop: "2px", textAlign: "center", width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {npc.job || "신분 미상"}
                      </div>

                      <div style={{ marginTop: "6px", fontSize: "0.65rem", fontWeight: "800", color: isSelected ? "#f43f5e" : "#78716c" }}>
                        {isSelected ? "✓ 열람 중" : "+ 취향 보기"}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 🏷️ 2섹션: 파악된 취향 키워드 (선호 vs 기피) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: isMobile ? "0.88rem" : "0.95rem", fontWeight: "800", color: "#f5f5f4", display: "flex", alignItems: "center", gap: "6px" }}>
                <Sparkles size={16} color="#f43f5e" /> [{selectedNpc.name}]의 파악된 취향
              </span>
              <span style={{ fontSize: "0.72rem", color: "#a8a29e" }}>
                발견된 취향 {npcClues.length}건
              </span>
            </div>

            {npcClues.length === 0 ? (
              <div style={{
                padding: "26px 20px", textAlign: "center",
                backgroundColor: "rgba(255,255,255,0.02)",
                border: "1.5px dashed rgba(255,255,255,0.1)", borderRadius: "16px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "6px"
              }}>
                <BookOpen size={28} color="#78716c" />
                <div style={{ color: "#d6d3d1", fontSize: "0.85rem", fontWeight: "700" }}>
                  [{selectedNpc.name}]에 대해 파악된 취향이 아직 없습니다.
                </div>
                <span style={{ color: "#78716c", fontSize: "0.75rem" }}>
                  대화 속에서 상대방이 좋아하거나 싫어하는 음료, 선물, 행동을 주의 깊게 관찰해 보세요.
                </span>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px" }}>
                {/* 선호 목록 */}
                {likes.map((c, i) => (
                  <div 
                    key={`like_${i}`}
                    style={{
                      padding: "12px 14px", borderRadius: "12px",
                      backgroundColor: isDarkMode ? "rgba(244, 63, 94, 0.08)" : "#fff1f2",
                      border: "1px solid rgba(244, 63, 94, 0.25)",
                      borderLeft: "4px solid #f43f5e",
                      display: "flex", flexDirection: "column", gap: "4px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: "800", fontSize: "0.88rem", color: "#fda4af", display: "flex", alignItems: "center", gap: "5px" }}>
                        <Heart size={14} fill="#f43f5e" color="#f43f5e" /> {c.name}
                      </span>
                      <span style={{ fontSize: "0.65rem", padding: "1px 6px", borderRadius: "4px", backgroundColor: "rgba(244, 63, 94, 0.2)", color: "#fda4af", fontWeight: "800" }}>
                        선호
                      </span>
                    </div>
                    {c.desc && (
                      <div style={{ fontSize: "0.78rem", color: "#d6d3d1", lineHeight: "1.45" }}>
                        {c.desc}
                      </div>
                    )}
                  </div>
                ))}

                {/* 기피 목록 */}
                {dislikes.map((c, i) => (
                  <div 
                    key={`dislike_${i}`}
                    style={{
                      padding: "12px 14px", borderRadius: "12px",
                      backgroundColor: isDarkMode ? "rgba(239, 68, 68, 0.08)" : "#fef2f2",
                      border: "1px solid rgba(239, 68, 68, 0.25)",
                      borderLeft: "4px solid #ef4444",
                      display: "flex", flexDirection: "column", gap: "4px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: "800", fontSize: "0.88rem", color: "#f87171", display: "flex", alignItems: "center", gap: "5px" }}>
                        <ShieldAlert size={14} color="#ef4444" /> {c.name}
                      </span>
                      <span style={{ fontSize: "0.65rem", padding: "1px 6px", borderRadius: "4px", backgroundColor: "rgba(239, 68, 68, 0.2)", color: "#f87171", fontWeight: "800" }}>
                        주의/기피
                      </span>
                    </div>
                    {c.desc && (
                      <div style={{ fontSize: "0.78rem", color: "#d6d3d1", lineHeight: "1.45" }}>
                        {c.desc}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 🎁 3섹션: 가방 속 선물 전달 (인벤토리 서랍 연결) */}
          <div style={{
            backgroundColor: isDarkMode ? "rgba(24, 20, 18, 0.9)" : "#fcf8f6",
            borderRadius: "18px", border: "1.5px solid rgba(244, 63, 94, 0.3)",
            padding: isMobile ? "14px" : "18px",
            display: "flex", flexDirection: "column", gap: "12px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.3)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#f43f5e", fontWeight: "900", fontSize: "0.92rem" }}>
                <Gift size={18} /> [{selectedNpc.name}]에게 소지품 선물하기
              </div>
              <span style={{ fontSize: "0.72rem", color: "#a8a29e" }}>
                내 가방 소지품 {items.length}개
              </span>
            </div>

            {items.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "26px 14px",
                backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "12px",
                border: "1px dashed rgba(255,255,255,0.08)",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "6px"
              }}>
                <Package size={26} color="#78716c" />
                <div style={{ fontSize: "0.82rem", color: "#a8a29e", fontWeight: "600" }}>
                  가방이 비어 있습니다.
                </div>
                <span style={{ fontSize: "0.72rem", color: "#78716c" }}>
                  서사를 진행하며 상대방에게 건넬 특별한 물건이나 선물을 획득해 보세요.
                </span>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "220px", overflowY: "auto" }}>
                {items.map((it, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "10px 14px", borderRadius: "12px",
                      backgroundColor: isDarkMode ? "#1b1715" : "#fff",
                      border: "1px solid rgba(255,255,255,0.08)"
                    }}
                  >
                    <div style={{ flex: 1, paddingRight: "10px" }}>
                      <div style={{ fontWeight: "800", fontSize: "0.88rem", color: "#f5f5f4" }}>
                        • {it.name}
                      </div>
                      {it.desc && (
                        <div style={{ fontSize: "0.72rem", color: "#a8a29e", marginTop: "2px" }}>
                          {it.desc}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSendGift(it)}
                      style={{
                        padding: "7px 14px", borderRadius: "8px", border: "none",
                        backgroundColor: "#f43f5e", color: "#fff",
                        fontSize: "0.78rem", fontWeight: "800", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: "4px",
                        boxShadow: "0 2px 10px rgba(244, 63, 94, 0.35)", flexShrink: 0
                      }}
                    >
                      <Gift size={13} />
                      <span>건네기</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* 4. 하단 푸터 */}
        <div style={{
          padding: isMobile ? "12px 16px" : "14px 20px",
          borderTop: "1px solid rgba(255, 255, 255, 0.06)",
          backgroundColor: isDarkMode ? "rgba(16, 14, 13, 0.9)" : "#fff",
          display: "flex", justifyContent: "flex-end", flexShrink: 0
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "8px 20px", borderRadius: "10px",
              backgroundColor: "rgba(255,255,255,0.08)", border: "none",
              color: "#d6d3d1", fontSize: "0.82rem", fontWeight: "700", cursor: "pointer"
            }}
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
}
