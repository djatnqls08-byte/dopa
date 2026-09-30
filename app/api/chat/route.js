import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const FALLBACK_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.6-flash",
  "gemini-3.7-flash",
  "gemini-3.8-flash",
  "gemini-2.5-flash",
];

export async function POST(req) {
  try { 
    const body = await req.json().catch(() => ({}));
    const {
      messages = [],
      scenarioText = "",
      playerSheet = {},
      ruleMode = "freeform",
      playPreference = "",
      isPhoneChat = false, 
      isVoiceCall = false,
      voiceCallNpc = null,
      facingNpc = null,
      targetNpc = null,
      lastStoryContext = "",
      recentEvents = [],
      currentPhase = "낮",
    } = body;

    const rawKeys = process.env.GEMINI_API_KEY || process.env.Gemini_API_Key || "";

    const apiKeys = rawKeys.split(",").map(k => k.trim()).filter(Boolean);
    if (apiKeys.length === 0) {
      return new Response(JSON.stringify({ error: "API 키가 등록되지 않았습니다." }), { status: 400 });
    }

    const pName = playerSheet?.name || "주인공";
    const pGender = playerSheet?.gender || "미상";
    const pAge = playerSheet?.age || "미상";
    const pJob = playerSheet?.job || "주인공";
    const pcTone = playerSheet?.background || "자연스러운 성격과 말투";
    
    const activePartner = targetNpc || playerSheet?.npcs?.[0] || { name: "상대", job: "조력자" };
    const partnerName = activePartner.name || "상대";
    const partnerGender = activePartner.gender || "미상";
    const partnerAge = activePartner.age || "미상";
    const partnerJob = activePartner.job || activePartner.title || "인물";
    const partnerDetail = activePartner.detail || activePartner.desc || activePartner.setting || "주인공과 아는 사이";
    const currentAffinity = activePartner.affinity ?? activePartner.affection ?? 0;
    const allNpcNames = (playerSheet?.npcs || []).map(n => n.name).filter(Boolean).join(", ") || partnerName;

    const eventsSummary = (recentEvents && recentEvents.length > 0)
      ? recentEvents.map(e => `   * ${e}`).join("\n")
      : "   * 특별히 기록된 사건 없음";

    let romanceGenrePrompt = "시나리오에 정의된 인물들의 성별, 외모, 관계성 설정을 왜곡 없이 준수하십시오.";
    if (playPreference.includes("#GL") || playPreference.includes("#백합")) {
      romanceGenrePrompt = "현재 태그 [#GL / #백합] 적용 중: 여성 간의 섬세한 감정선과 유대를 다룹니다. 단, 다른 성별로 명시된 인물의 설정은 훼손하지 마십시오.";
    }

    const coreIdentityPrompt = `
[🚨 절대 서사 원칙 - 관계성 미학 및 캐릭터성 존중]
1. [장르 지침]: ${romanceGenrePrompt}
2. 물리적·심리적 강압(납치, 감금, 폭력적 질투) 및 유치한 소유욕 묘사를 엄격히 배제합니다.
3. 상대방은 독립적인 인격을 지키며, PC의 무례한 행동에는 냉정해질 수 있습니다.

[🧠 리얼리티 및 망각 방지 지침]
1. 방금 전 대화 주제를 잊지 마십시오. 대화가 뚝 끊기고 새 화제를 꺼내는 것을 금지합니다.
2. 현재 [시간대: ${currentPhase}], [최근 기억된 사건], [현재 호감도: ${currentAffinity}]를 철저히 반영하여 온도를 조절하십시오.

[🚨 절대 규칙 - 임의 스킵 금지 및 3인칭 대명사 금지]
1. 주인공 '${pName}'의 대사나 신체적 행동을 AI가 대신 서술하지 마십시오.
2. 지문에서 '그녀', '그' 같은 3인칭 대명사를 일절 사용하지 말고 오직 실제 이름만 사용하십시오.`;

    let systemInstruction = "";

    if (ruleMode === "dating" || ruleMode === "dating_msg") {
      // (기존 미연시/메신저 모드 지침 동일 유지 - 저작권 무관 영역)
      systemInstruction = `${coreIdentityPrompt}\n[1:1 스마트폰 메신저 / 인터랙티브 서사 모드]\n당신은 '${pName}'과 대화 중인 '${partnerName}'입니다.\n\n[상대 정보]\n- 이름: ${partnerName} (역할: ${partnerJob})\n- 상세 설정: ${partnerDetail}\n- 시나리오 배경: ${scenarioText}\n\n[서술 규칙]\n1. 괄호() 지문, 상황 묘사를 배제하고 순수한 메신저 대사 텍스트만 출력하십시오.\n2. 호감도 변동 시: <!-- AFFECTION: {"name": "${partnerName}", "value": 변경후수치} -->`;
    } else {
      const currentCycle = playerSheet?.cycle || 1;
      const currentScene = playerSheet?.scene || 1;
      const currentPhaseVal = playerSheet?.phase || "MAIN";

      let rulePrompt = "";
      
      // 🌟 독자 규격: 1D100 미스터리 엔진 (기존 CoC 대체)
      if (ruleMode === "coc") {
        rulePrompt = `[1D100 미스터리 룰 마스터링 수칙 - 🚨 자체 규격]
1. [행동 판정 엄수]: 플레이어가 행동(조사, 설득 등)을 선언하면 결과를 임의로 지어내지 마십시오.
2. [1D100 판정 대기]: 성공/실패 여부를 묘사하기 전, 지문 끝에 태그를 단 1번 출력해 주사위를 요구하고 답변을 멈추십시오.
   예시: <!-- CHECK: {"skill": "관찰력", "target": 50, "reason": "단서를 찾기 위해"} -->
3. 🚨 [오토플레이 금지]: 주사위 결과 묘사 후 서술을 멈추고 플레이어의 다음 롤플레잉을 기다리십시오.
4. [멘탈 체크]: 끔찍한 진실 목격 시 이성 판정을 요구하십시오. <!-- CHECK: {"skill": "이성", "target": ${playerSheet?.san || 50}, "reason": "충격적인 장면 목격"} -->`;
      
      // 🌟 독자 규격: 2D6 심리 서스펜스 엔진 (기존 인세인 대체)
      } else if (ruleMode === "insane") {
        rulePrompt = `[2D6 심리 서스펜스 룰 마스터링 수칙 - 🚨 자체 규격]
현재 상태: ${currentPhaseVal} 페이즈 | ${currentCycle}사이클 / ${currentScene}씬
1. [페이즈 관리]: 플레이어가 해당 씬의 [주요 행동]을 마쳤을 때만 단 1회 <!-- ADVANCE_SCENE --> 태그를 출력하십시오.
2. [2D6 행동 판정]: 플레이어의 조사 선언 시, 결과를 임의로 짓지 말고 어울리는 특기를 지정해 2D6 주사위 판정 태그를 출력하고 대기하십시오.
   예시: <!-- CHECK: {"skill": "특기명", "target": 5, "type": "INVESTIGATION", "targetName": "대상명"} -->
3. [비밀 해금 루틴]: 플레이어가 핸드아웃 조사 성공 시, <!-- REVEAL_HANDOUT: {"title": "대상명"} --> 태그를 출력하여 이면의 비밀을 공개하십시오.
   공개된 비밀에 충격적인 내용이 있다면 즉시 멘탈 판정(공포)을 요구하십시오: <!-- CHECK: {"skill": "지정특기", "target": 5, "type": "FEAR", "targetName": "${pName}"} -->`;
      
      // 🌟 독자 규격: 본격 추리/수사 엔진
      } else {
        rulePrompt = `[추리/수사 마스터링 절대 수칙]
1. [페어 플레이]: 시나리오 [기밀/진상]에 적힌 진범과 트릭을 도중에 절대 바꾸지 마십시오.
2. [수사 시스템 태그]: 물증 발견 시 <!-- ITEM: {"name": "물증명", "desc": "설명"} -->, 증언 획득 시 <!-- CLUE: {"name": "단서명", "desc": "설명"} --> 태그를 출력하십시오.
3. [진상 추리 심판]: 플레이어의 진상 추리 논리가 틀렸거나 억지 물증을 제시하면, 지문 끝에 <!-- DAMAGE: 1 --> 태그를 출력하여 신뢰도를 깎으십시오.`;
      }

      systemInstruction = `당신은 텍스트 인터랙티브 서사의 마스터입니다.

${coreIdentityPrompt}${rulePrompt}

[시나리오 배경 및 이면의 진실]:
${scenarioText || "미상의 시나리오"}

[인물 정보]
- 주인공: ${pName} (성별: ${pGender}, 나이: ${pAge}, 직업: ${playerSheet?.job || "조사원"})
- 파트너: ${partnerName} (상세: ${partnerDetail})
- 최근 사건 수첩: ${eventsSummary}

[🚨 서술 문체 규칙]
1. 모든 지문 서술은 정중한 경어체(~합니다/했습니다)로 100% 일관되게 서술하십시오.
2. 주사위 판정 요구 시 태그 출력 후 즉시 서술을 멈추십시오.
3. 당면 목표 갱신 시: <!-- OBJECTIVE: {"main": "전체 목적", "step": "당장 해야 할 행동"} -->`;
    }

    let formattedContents = [{ role: "user", parts: [{ text: systemInstruction }] }, { role: "model", parts: [{ text: "독자 규격 마스터링 수칙을 완벽히 숙지했습니다." }] }];

    const msgList = Array.isArray(messages) ? messages : [];
    const recentHistory = msgList.slice(-40);

    for (const m of recentHistory) {
      const role = m.role === "user" ? "user" : "model";
      const text = (m.text || "").trim();
      if (!text) continue;

      if (formattedContents.length > 0 && formattedContents[formattedContents.length - 1].role === role) {
        formattedContents[formattedContents.length - 1].parts[0].text += "\n\n" + text;
      } else {
        formattedContents.push({ role, parts: [{ text }] });
      }
    }

    let responseText = null;
    let lastError = null;
    const shuffledKeys = [...apiKeys].sort(() => Math.random() - 0.5);

    for (const currentKey of shuffledKeys) {
      const genAI = new GoogleGenerativeAI(currentKey);
      for (const modelName of FALLBACK_MODELS) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent({
            contents: formattedContents,
            generationConfig: { temperature: 0.6 }
          });
          responseText = result.response.text();
          if (responseText) break;
        } catch (err) {
          lastError = err;
        }
      }
      if (responseText) break;
    }

    if (!responseText) throw lastError || new Error("모든 API 키 한도가 초과되었습니다.");

    if (isPhoneChat) {
      responseText = responseText.replace(/^\s*\([\s\S]*?\)\s*/g, "").replace(/^\s*\[[\s\S]*?\]\s*/g, "").trim();
    }

    return new Response(JSON.stringify({ text: responseText }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
