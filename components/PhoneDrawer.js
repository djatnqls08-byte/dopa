// components/PhoneDrawer.js
"use client";

import React, { useState } from "react";
import { 
  X, ChevronLeft, ChevronRight, UserRound, Phone, MessageSquare, 
  Gift, Lightbulb, Heart, MessageCircle, Settings, PenTool, 
  Smartphone, BookOpen, Droplet 
} from "lucide-react";

export default function PhoneDrawer({
  isOpen,
  onClose,
  activeSession,
  isDarkMode = true,
  executeMessage,
  triggerToast,
  onOpenGift,      // 선물 모달 열기 콜백 (npc) => void
  onOpenClue,      // 취향 수첩 열기 콜백 (npc) => void
  onStartVoiceCall,// 음성 통화 시작 콜백 (npc) => void
  onZoomPortrait   // 사진 확대 콜백 (url) => void
}) {
  // ── [내부 스마트폰 네비게이션 상태] ──
  const [phoneNavTab, setPhoneNavTab] = useState("contacts"); // "contacts" | "chats" | "settings"
  const [activePhoneContactId, setActivePhoneContactId] = useState(null);
  const [selectedProfileNpc, setSelectedProfileNpc] = useState(null);
  const [isMyProfileOpen, setIsMyProfileOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneTheme, setPhoneTheme] = useState("parchment");
  const [vibrationLevel, setVibrationLevel] = useState("medium");

  if (!isOpen || !activeSession) return null;

  // 🌟 다이나믹 폰 스킨 엔진
  const PHONE_SKINS = {
    default: { bg: "#f8f9fa", headerBg: "#ffffff", panel: "#ffffff", border: "#e9ecef", text: "#212529", textMuted: "#6c757d", accent: "#3b82f6", danger: "#ef4444", borderHighlight: "#cbd5e1" },
    kakao: { bg: "#bac8d8", headerBg: "#fcd11e", panel: "#ffffff", border: "#a3b5c6", text: "#3c1e1e", textMuted: "#665a5a", accent: "#3c1e1e", danger: "#ef4444", borderHighlight: "#e2b808" },
    parchment: { bg: "#f3efe8", headerBg: "#e8dfd1", panel: "#ffffff", border: "#d9d0c1", text: "#3b3631", textMuted: "#8b8276", accent: "#a68a6d", danger: "#d94a4a", borderHighlight: "#c8beae" },
    cyber: { bg: "#0f172a", headerBg: "#1e293b", panel: "#1e293b", border: "#334155", text: "#f8fafc", textMuted: "#94a3b8", accent: "#8b5cf6", danger: "#f43f5e", borderHighlight: "#475569" }
  };
  const activePhoneSkin = PHONE_SKINS[phoneTheme] || PHONE_SKINS.parchment;

  // 상태메시지 추출 헬퍼
  const getStatusMsg = (behaviorText) => {
    if (!behaviorText) return "상태 메시지 없음";
    const match = behaviorText.match(/상태\s*메시지\s*[:：]\s*["'“]?([^"'\n]+)/i) || behaviorText.match(/상태메시지\s*[:：]\s*["'“]?([^"'\n]+)/i);
    return match ? match[1].replace(/["'”]$/, '').trim() : "상태 메시지가 없습니다.";
  };

  const handleSendMessage = () => {
    if (!phoneInput.trim()) return;
    if (executeMessage) {
      executeMessage(`[메신저 전송] ${phoneInput.trim()}`);
    }
    setPhoneInput("");
  };

  const handleCloseAll = () => {
    setActivePhoneContactId(null);
    setSelectedProfileNpc(null);
    setIsMyProfileOpen(false);
    onClose();
  };

  const npcs = activeSession.sheet?.npcs || [];
  const currentChatMsgs = activePhoneContactId !== null ? ((activeSession.sheet?.phoneChats || {})[activePhoneContactId] || []) : [];
  const activeNpc = npcs.find(n => n.id === activePhoneContactId);

  return (
    <div 
      onClick={handleCloseAll} 
      style={{ position: "fixed", inset: 0, zIndex: 125, display: "flex", justifyContent: "center", alignItems: "flex-end", backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
    >
      <div 
        onClick={e => e.stopPropagation()} 
        style={{ 
          width: "100%", maxWidth: "460px", height: "82vh", maxHeight: "740px", 
          backgroundColor: activePhoneSkin.bg, color: activePhoneSkin.text, 
          borderRadius: "24px 24px 0 0", display: "flex", flexDirection: "column", 
          overflow: "hidden", border: `1px solid ${activePhoneSkin.border}`, borderBottom: "none", 
          boxShadow: "0 -8px 36px rgba(0,0,0,0.38)", animation: "slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)" 
        }}
      >
        {/* 🔹 1. 스마트폰 상단 헤더 바 */}
        <div style={{ height: "54px", padding: "0 16px", backgroundColor: activePhoneSkin.headerBg, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, borderBottom: `1px solid ${activePhoneSkin.border}` }}>
          <div style={{ width: "60px" }}>
            {(activePhoneContactId !== null || selectedProfileNpc || isMyProfileOpen) && (
              <button 
                type="button" 
                onClick={() => { setActivePhoneContactId(null); setSelectedProfileNpc(null); setIsMyProfileOpen(false); }} 
                style={{ background: "none", border: "none", color: activePhoneSkin.text, fontSize: "0.9rem", cursor: "pointer", fontWeight: "800", display: "flex", alignItems: "center", gap: "2px" }}
              >
                <ChevronLeft size={20} /> 뒤로
              </button>
            )}
          </div>
          <div style={{ fontSize: "1rem", fontWeight: "800", color: activePhoneSkin.text, display: "flex", alignItems: "center", gap: "6px" }}>
            {isMyProfileOpen 
              ? "내 프로필" 
              : selectedProfileNpc 
              ? "프로필 상세" 
              : activePhoneContactId !== null 
              ? (activeNpc?.name || "대화") 
              : phoneNavTab === "contacts" ? "인연" : phoneNavTab === "chats" ? "대화" : "더보기"}
          </div>
          <div style={{ width: "60px", display: "flex", justifyContent: "flex-end" }}>
            <button type="button" onClick={handleCloseAll} style={{ background: "none", border: "none", color: activePhoneSkin.textMuted, cursor: "pointer", padding: "4px" }}>
              <X size={24} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* 🔹 2. 본문 화면 분기 렌더링 */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          
          {/* 👤 [화면 A: 내 프로필 상세] */}
          {isMyProfileOpen ? (
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
              <span style={{ fontSize: "0.85rem", color: activePhoneSkin.textMuted, fontWeight: "600" }}>{activeSession.sheet?.job || "직업 미상"}</span>
              <div 
                onClick={() => { if (activeSession.sheet?.portrait && onZoomPortrait) onZoomPortrait(activeSession.sheet.portrait); }}
                style={{ width: "100px", height: "100px", borderRadius: "25%", overflow: "hidden", border: `2px solid ${activePhoneSkin.accent}`, boxShadow: "0 8px 20px rgba(0,0,0,0.1)", cursor: activeSession.sheet?.portrait ? "pointer" : "default" }}
              >
                {activeSession.sheet?.portrait ? <img src={activeSession.sheet.portrait} alt="나" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <UserRound size={60} color={activePhoneSkin.textMuted} style={{ margin: "20px" }}/>}
              </div>
              <div style={{ textAlign: "center", padding: "0 20px" }}>
                <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "900", color: activePhoneSkin.text }}>{activeSession.sheet?.name || "이름 미상"}</h2>
                <span style={{ fontSize: "0.85rem", color: activePhoneSkin.textMuted, whiteSpace: "pre-wrap", lineHeight: "1.5", display: "block", marginTop: "6px" }}>
                  {activeSession.sheet?.background ? getStatusMsg(activeSession.sheet.background) : "상태 메시지가 없습니다."}
                </span>
              </div>
              
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", gap: "10px" }}>
                  <div style={{ flex: 1, backgroundColor: isDarkMode ? "rgba(34, 197, 94, 0.15)" : "#dcfce7", border: `1px solid rgba(34, 197, 94, 0.4)`, borderRadius: "12px", padding: "12px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#16a34a" }}>멘탈</span>
                    <span style={{ fontSize: "1.1rem", fontWeight: "900", color: "#16a34a" }}>{activeSession.sheet?.hp || 100}</span>
                  </div>
                  <div style={{ flex: 1, backgroundColor: isDarkMode ? "rgba(245, 158, 11, 0.15)" : "#fef3c7", border: `1px solid rgba(245, 158, 11, 0.4)`, borderRadius: "12px", padding: "12px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#d97706" }}>스트레스 지수</span>
                    <span style={{ fontSize: "1.1rem", fontWeight: "900", color: "#d97706" }}>{activeSession.sheet?.fatigue || 0}%</span>
                  </div>
                </div>

                <div style={{ width: "100%", backgroundColor: activePhoneSkin.panel, borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px", border: `1px solid ${activePhoneSkin.border}`, boxSizing: "border-box" }}>
                  <div><span style={{ fontSize: "0.75rem", color: activePhoneSkin.textMuted, fontWeight: "700" }}>신분 / 직책</span><div style={{ fontSize: "0.95rem", fontWeight: "800", color: activePhoneSkin.text, marginTop: "4px" }}>{activeSession.sheet?.job || "기록 없음"}</div></div>
                  <div style={{ borderTop: `1px solid ${activePhoneSkin.border}` }}/>
                  <div><span style={{ fontSize: "0.75rem", color: activePhoneSkin.textMuted, fontWeight: "700" }}>백스토리 및 성격</span><div style={{ fontSize: "0.85rem", color: activePhoneSkin.text, marginTop: "6px", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{activeSession.sheet?.background || "기록된 배경이 없습니다."}</div></div>
                  
                  <div style={{ borderTop: `1px solid ${activePhoneSkin.border}` }}/>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: activePhoneSkin.textMuted, fontWeight: "700" }}>소지품 및 단서</span>
                    <div style={{ fontSize: "0.85rem", color: activePhoneSkin.text, marginTop: "6px", lineHeight: 1.6 }}>
                      {activeSession.sheet?.items?.length > 0 || activeSession.sheet?.clues?.length > 0
                        ? [...(activeSession.sheet.items || []).map(i => i.name), ...(activeSession.sheet.clues || []).map(c => c.name)].join(", ")
                        : "획득한 소지품이나 단서가 없습니다."}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          /* 👥 [화면 B: 상대방 프로필 상세] */
          ) : selectedProfileNpc ? (
            <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
              <span style={{ fontSize: "0.85rem", color: activePhoneSkin.textMuted, fontWeight: "600" }}>{selectedProfileNpc.job || "정보 없음"}</span>
              <div 
                onClick={() => { if (selectedProfileNpc.portraitUrl && onZoomPortrait) onZoomPortrait(selectedProfileNpc.portraitUrl); }}
                style={{ width: "100px", height: "100px", borderRadius: "25%", overflow: "hidden", border: `2px solid ${activePhoneSkin.border}`, boxShadow: "0 8px 20px rgba(0,0,0,0.1)", cursor: selectedProfileNpc.portraitUrl ? "pointer" : "default" }}
              >
                {selectedProfileNpc.portraitUrl ? <img src={selectedProfileNpc.portraitUrl} alt="상대" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <UserRound size={60} color={activePhoneSkin.textMuted} style={{ margin: "20px" }}/>}
              </div>
              <div style={{ textAlign: "center" }}>
                <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "900", color: activePhoneSkin.text }}>{selectedProfileNpc.name}</h2>
                <span style={{ fontSize: "0.85rem", color: activePhoneSkin.textMuted }}>"{getStatusMsg(selectedProfileNpc.behavior)}"</span>
              </div>

              {/* 액션 버튼 4개 */}
              <div style={{ width: "100%", display: "flex", justifyContent: "space-around", backgroundColor: activePhoneSkin.panel, padding: "16px", borderRadius: "20px", border: `1px solid ${activePhoneSkin.border}`, boxShadow: "0 4px 12px rgba(0,0,0,0.02)", boxSizing: "border-box" }}>
                {[
                  { icon: <Phone size={24} color="#ec4899" fill="#ec4899" />, label: "전화 걸기", action: () => { if (onStartVoiceCall) onStartVoiceCall(selectedProfileNpc); } },
                  { icon: <MessageSquare size={24} color="#a78bfa" fill="#a78bfa" />, label: "1:1 대화", action: () => { setActivePhoneContactId(selectedProfileNpc.id); setSelectedProfileNpc(null); } },
                  { icon: <Gift size={24} color="#f59e0b" fill="#f59e0b" />, label: "선물하기", action: () => { if (onOpenGift) onOpenGift(selectedProfileNpc); } },
                  { icon: <Lightbulb size={24} color="#eab308" fill="#eab308" />, label: "취향 수첩", action: () => { if (onOpenClue) onOpenClue(selectedProfileNpc); } }
                ].map((btn, i) => (
                  <div key={i} onClick={btn.action} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    {btn.icon}
                    <span style={{ fontSize: "0.75rem", fontWeight: "800", color: activePhoneSkin.text }}>{btn.label}</span>
                  </div>
                ))}
              </div>

              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "16px", padding: "0 8px", boxSizing: "border-box" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: "800", color: activePhoneSkin.danger, display: "flex", alignItems: "center", gap: "6px" }}><Heart size={16} fill="currentColor"/> 정서적 유대감</span>
                  <span style={{ fontSize: "1rem", fontWeight: "900", color: activePhoneSkin.danger }}>{selectedProfileNpc.affection || 0} / 100</span>
                </div>
                <div style={{ borderTop: `2px solid ${activePhoneSkin.border}` }}/>
                <div style={{ fontSize: "0.85rem", color: activePhoneSkin.text, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  <span style={{ fontWeight: "700", color: activePhoneSkin.textMuted, display: "block", marginBottom: "4px" }}>외모 및 특징 메모</span>
                  {selectedProfileNpc.behavior || "기록된 메모가 없습니다."}
                </div>
              </div>
            </div>

          /* 💬 [화면 C: 1:1 대화방] */
          ) : activePhoneContactId !== null ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: activePhoneSkin.bg }}>
              <div style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto" }}>
                {currentChatMsgs.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: activePhoneSkin.textMuted, fontSize: "0.85rem" }}>
                    아직 나눈 메시지가 없습니다.<br/>인사를 건네보세요!
                  </div>
                ) : (
                  currentChatMsgs.map((m, idx) => {
                    const isUser = m.sender === "user";
                    return (
                      <div key={idx} style={{ alignSelf: isUser ? "flex-end" : "flex-start", maxWidth: "80%", display: "flex", flexDirection: isUser ? "row-reverse" : "row", alignItems: "flex-start", gap: "10px" }}>
                        {!isUser && (
                          <div 
                            onClick={() => {
                              const contactUrl = activeNpc?.portraitUrl;
                              if (contactUrl && onZoomPortrait) onZoomPortrait(contactUrl);
                            }}
                            style={{ width: "36px", height: "36px", borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: `1px solid ${activePhoneSkin.borderHighlight}`, cursor: "pointer" }}
                          >
                            <img src={activeNpc?.portraitUrl} alt="상대" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </div>
                        )}
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: isUser ? "flex-end" : "flex-start" }}>
                          {m.photo && (
                            <img src={m.photo} alt="첨부사진" onClick={() => onZoomPortrait && onZoomPortrait(m.photo)} style={{ width: "200px", borderRadius: "12px", cursor: "pointer", border: `1px solid ${activePhoneSkin.border}`, marginBottom: "4px" }} />
                          )}
                          <div style={{ backgroundColor: isUser ? activePhoneSkin.accent : activePhoneSkin.panel, color: isUser ? "#fff" : activePhoneSkin.text, padding: "12px 16px", borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px", fontSize: "0.9rem", lineHeight: "1.5", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                            {m.text}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div style={{ padding: "12px 16px", backgroundColor: activePhoneSkin.headerBg, display: "flex", gap: "10px", alignItems: "center" }}>
                <input 
                  type="text" 
                  value={phoneInput}
                  onChange={e => setPhoneInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="메시지를 입력하세요..." 
                  style={{ flex: 1, padding: "12px 16px", borderRadius: "24px", border: "none", backgroundColor: activePhoneSkin.panel, color: activePhoneSkin.text, outline: "none", fontSize: "0.9rem" }} 
                />
                <button 
                  onClick={handleSendMessage}
                  style={{ padding: "10px 18px", backgroundColor: activePhoneSkin.accent, color: "#fff", border: "none", borderRadius: "20px", fontWeight: "800", cursor: "pointer" }}
                >
                  전송
                </button>
              </div>
            </div>

          /* 📋 [화면 D: 메신저 메인 탭들] */
          ) : (
            <>
              {phoneNavTab === "contacts" && (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ padding: "16px" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "800", color: activePhoneSkin.textMuted, marginLeft: "8px" }}>내 프로필</span>
                    <div onClick={() => setIsMyProfileOpen(true)} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 8px", cursor: "pointer" }}>
                      <div style={{ width: "56px", height: "56px", borderRadius: "25%", overflow: "hidden", border: `1px solid ${activePhoneSkin.borderHighlight}` }}>
                        {activeSession.sheet?.portrait ? <img src={activeSession.sheet.portrait} alt="나" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <UserRound size={32} color={activePhoneSkin.textMuted} style={{ margin: "12px" }}/>}
                      </div>
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontSize: "1.05rem", fontWeight: "800", color: activePhoneSkin.text }}>{activeSession.sheet?.name || "이름 미상"}</span>
                        <span style={{ fontSize: "0.75rem", color: activePhoneSkin.textMuted }}>{getStatusMsg(activeSession.sheet?.background)}</span>
                      </div>
                      <ChevronRight size={20} color={activePhoneSkin.textMuted} />
                    </div>
                  </div>
                  
                  <div style={{ height: "1px", backgroundColor: activePhoneSkin.border }} />

                  <div style={{ padding: "16px" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "800", color: activePhoneSkin.textMuted, marginLeft: "8px" }}>교류 중인 인물 ({npcs.length})</span>
                    <div style={{ display: "flex", flexDirection: "column", marginTop: "8px" }}>
                      {npcs.map(npc => (
                        <div key={npc.id} onClick={() => setSelectedProfileNpc(npc)} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 8px", cursor: "pointer", borderBottom: `1px solid rgba(0,0,0,0.03)` }}>
                          <div style={{ width: "52px", height: "52px", borderRadius: "50%", overflow: "hidden", border: `1px solid ${activePhoneSkin.borderHighlight}` }}>
                            {npc.portraitUrl ? <img src={npc.portraitUrl} alt={npc.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <UserRound size={28} color={activePhoneSkin.textMuted} style={{ margin: "12px" }}/>}
                          </div>
                          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ fontSize: "1rem", fontWeight: "800", color: activePhoneSkin.text }}>{npc.name}</span>
                            <span style={{ fontSize: "0.75rem", color: activePhoneSkin.textMuted }}>"{getStatusMsg(npc.behavior)}"</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <Heart size={14} fill={activePhoneSkin.textMuted} color={activePhoneSkin.textMuted} />
                            <span style={{ fontSize: "0.85rem", fontWeight: "800", color: activePhoneSkin.danger }}>{npc.affection || 0}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {phoneNavTab === "chats" && (
                <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: "800", color: activePhoneSkin.textMuted, marginLeft: "8px", marginBottom: "8px" }}>대화방 목록</span>
                  {npcs.map(npc => (
                    <div key={npc.id} onClick={() => setActivePhoneContactId(npc.id)} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 8px", cursor: "pointer", borderBottom: `1px solid rgba(0,0,0,0.03)` }}>
                      <div style={{ width: "52px", height: "52px", borderRadius: "50%", overflow: "hidden", border: `1px solid ${activePhoneSkin.borderHighlight}` }}>
                        {npc.portraitUrl ? <img src={npc.portraitUrl} alt={npc.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <UserRound size={28} color={activePhoneSkin.textMuted} style={{ margin: "12px" }}/>}
                      </div>
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontSize: "1rem", fontWeight: "800", color: activePhoneSkin.text }}>{npc.name}</span>
                        <span style={{ fontSize: "0.8rem", color: activePhoneSkin.textMuted }}>대화를 시작해 보세요.</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {phoneNavTab === "settings" && (
                <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div>
                    <span style={{ fontSize: "0.85rem", fontWeight: "800", color: activePhoneSkin.text, display: "flex", alignItems: "center", gap: "6px" }}><PenTool size={16}/> 메신저 테마 스킨</span>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginTop: "12px" }}>
                      {[
                        { id: "default", name: "시스템", icon: <Smartphone size={24} strokeWidth={2} /> },
                        { id: "kakao", name: "바나나", icon: <MessageSquare size={24} strokeWidth={2} /> },
                        { id: "parchment", name: "양피지", icon: <BookOpen size={24} strokeWidth={2} /> },
                        { id: "cyber", name: "소다", icon: <Droplet size={24} strokeWidth={2} /> }
                      ].map(t => {
                        const isSelected = phoneTheme === t.id;
                        return (
                          <div 
                            key={t.id} 
                            onClick={() => setPhoneTheme(t.id)} 
                            style={{ 
                              padding: "14px 4px", 
                              border: `1.5px solid ${isSelected ? activePhoneSkin.accent : activePhoneSkin.border}`, 
                              borderRadius: "14px", 
                              backgroundColor: isSelected ? activePhoneSkin.panel : "transparent", 
                              textAlign: "center", cursor: "pointer", 
                              display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", 
                              transition: "all 0.2s" 
                            }}
                          >
                            <div style={{ color: isSelected ? activePhoneSkin.accent : activePhoneSkin.textMuted, transition: "color 0.2s" }}>
                              {t.icon}
                            </div>
                            <span style={{ fontSize: "0.75rem", fontWeight: "700", color: isSelected ? activePhoneSkin.text : activePhoneSkin.textMuted }}>{t.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.85rem", fontWeight: "800", color: activePhoneSkin.text, display: "flex", alignItems: "center", gap: "6px" }}><Smartphone size={16}/> 스마트폰 알림 진동</span>
                    <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                      {["끄기", "약하게", "보통", "강하게"].map(v => (
                        <div key={v} onClick={() => triggerToast && triggerToast("설정 완료", "진동 세기가 변경되었습니다.", "📱")} style={{ flex: 1, padding: "12px 0", textAlign: "center", border: `1px solid ${activePhoneSkin.border}`, borderRadius: "12px", fontSize: "0.8rem", fontWeight: "700", color: activePhoneSkin.textMuted, cursor: "pointer" }}>{v}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* 🔹 3. 하단 3단 탭 네비게이션 바 */}
        {activePhoneContactId === null && !selectedProfileNpc && !isMyProfileOpen && (
          <div style={{ height: "64px", backgroundColor: activePhoneSkin.headerBg, display: "flex", borderTop: `1px solid ${activePhoneSkin.border}` }}>
            {[
              { id: "contacts", label: "인연", icon: <UserRound size={22} fill={phoneNavTab === "contacts" ? activePhoneSkin.accent : "none"} /> },
              { id: "chats", label: "대화", icon: <MessageCircle size={22} fill={phoneNavTab === "chats" ? activePhoneSkin.accent : "none"} /> },
              { id: "settings", label: "더보기", icon: <Settings size={22} fill={phoneNavTab === "settings" ? activePhoneSkin.accent : "none"} /> }
            ].map(tab => (
              <div key={tab.id} onClick={() => setPhoneNavTab(tab.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", color: phoneNavTab === tab.id ? activePhoneSkin.accent : activePhoneSkin.textMuted, cursor: "pointer", transition: "color 0.2s" }}>
                {tab.icon}
                <span style={{ fontSize: "0.7rem", fontWeight: "800" }}>{tab.label}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
