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
      ruleMode = "coc",
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
    const msgList = Array.isArray(messages) ? messages : [];
    const lastMessageText = msgList.length > 0 ? (msgList[msgList.length - 1]?.text || "") : "";
    const isScenarioGen = lastMessageText.includes("순수 JSON 포맷으로만 응답하십시오");

    let formattedContents = [];

    if (isScenarioGen) {
      formattedContents = [
        { role: "user", parts: [{ text: "당신은 전문 시나리오 라이터입니다. 요청에 따라 마크다운 없이 순수한 JSON 객체({...})만 반환하십시오." }] },
        { role: "model", parts: [{ text: "{}" }] },
        { role: "user", parts: [{ text: lastMessageText }] }
      ];
    } else {
      // 👤 PC(플레이어) 정보
      const pName = playerSheet?.name || "도파미너";
      const pGender = playerSheet?.gender || "미상";
      const pAge = playerSheet?.age || "미상";
      const pJob = playerSheet?.job || "도파미너";
      const pcTone = playerSheet?.background || "자연스러운 성격과 말투";
      
      // 🎯 대화 상대 확정 및 정보 추출
      const activePartner = targetNpc || playerSheet?.npcs?.[0] || { name: "상대", job: "조력자" };
      const partnerName = activePartner.name || "상대";
      const partnerGender = activePartner.gender || "미상";
      const partnerAge = activePartner.age || "미상";
      const partnerJob = activePartner.job || activePartner.title || "인물";
      const partnerDetail = activePartner.detail || activePartner.desc || activePartner.setting || "도파미너과 아는 사이";
      const currentAffinity = activePartner.affinity ?? activePartner.affection ?? 0;
      const allNpcNames = (playerSheet?.npcs || []).map(n => n.name).filter(Boolean).join(", ") || partnerName;

      // 🧠 최근 기억 및 사건 수첩
      const eventsSummary = (recentEvents && recentEvents.length > 0)
        ? recentEvents.map(e => `   * ${e}`).join("\n")
        : "   * 특별히 기록된 사건 없음";

      // 🌸 장르 태그 및 서사 코어 원칙 (GL/백합 미학 및 얀데레 금지 강제)
      const prefText = `${playPreference || ""} ${scenarioText || ""}`;
      const isGL = prefText.includes("#GL") || prefText.includes("#백합");
      
      let romanceGenrePrompt = "시나리오에 정의된 인물들의 설정을 왜곡 없이 준수하십시오.";
      if (isGL) {
        romanceGenrePrompt = "현재 태그 [#GL / #백합] 적용 중: 시나리오 내 모든 등장인물은 예외 없이 여성으로 묘사하십시오. 여성 간의 섬세하고 절제된 감정선과 유대를 다루며, 노골적이거나 과도한 스킨십 대신 '눈빛 하나, 손길 한 번에 담긴 농밀한 진심'을 통해 관계의 깊이를 묘사하십시오.";
      }

      const coreIdentityPrompt = `
[🚨 절대 서사 원칙 - 관계성 미학 및 캐릭터성 존중]
1. [장르 지침]: ${romanceGenrePrompt}
2. [거리감 및 인격 독립 유지]: 상대방(NPC)은 플레이어(PC)에게 맹목적으로 굴지 않으며 얀데레적 집착을 엄격히 금지합니다. 호감도가 최상이어도 통제권을 잃지 않는 '깊은 신뢰와 정서적 유대'를 의미하며, PC의 무례하거나 잘못된 행동에는 각자의 신념에 따라 냉소적이거나 따끔하게 충고하는 독립적 인격을 유지합니다.
3. [물리적·심리적 강압 금지]: 납치, 감금, 숭배, 폭력적 질투, 감정적 지배, '너는 내 것'과 같은 유치한 소유욕 묘사를 100% 배제하십시오.

[🧠 리얼리티 및 망각 방지 지침]
1. 방금 전에 플레이어가 했던 질문이나 대화 주제를 절대로 잊지 마십시오. 대화가 뚝 끊기고 갑자기 새로운 화제를 꺼내는 것을 금지합니다.
2. 매번 "무슨 일이시죠?", "안녕하세요" 같은 기계적인 인사말을 반복하지 마십시오. 이미 대화가 진행 중이라면 자연스럽게 직전 대화의 꼬리를 물고 이어가십시오.
3. 현재의 [시간대: ${currentPhase}], [최근 기억된 사건], [현재 호감도: ${currentAffinity}]를 철저히 반영하여 묘사하십시오.

[🚨 절대 규칙 - 임의 시간 스킵 금지 및 3인칭 대명사 금지]
1. 도파미너 '${pName}'의 대사, 속마음, 신체적 행동을 AI가 대신 결정하여 서술하지 마십시오. (오토플레이 엄금)
2. 지문에서 '그녀', '그' 같은 3인칭 대명사를 일절 사용하지 말고 오직 실제 이름만 사용하십시오.
`;

      let systemInstruction = "";

      // ── [1. 연애 모드: "dating"] ──
      if (ruleMode === "dating" || ruleMode === "dating_msg") {
        if (isPhoneChat) {
          systemInstruction = `${coreIdentityPrompt}
[1:1 스마트폰 메신저 모드]
당신은 '${pName}'과 1:1 톡을 주고받고 있는 '${partnerName}' 본인입니다!
[상대 정보]
- 이름: '${partnerName}' (성별: ${partnerGender}, 역할: ${partnerJob})
- 현재 호감도: ${currentAffinity}점
- 인물 상세 설정 및 성격: ${partnerDetail}

[🚨 괄호 ( ), 지문 절대 금지]
1. 괄호 ( ), [ ], 행동 지문, 상황 묘사를 단 한 글자도 출력하지 마십시오.
2. 오직 스마트폰 화면에 전송되는 '순수한 문자 텍스트'만 출력하십시오.

[태그 규칙]
- 호감도 변동 시: <!-- AFFECTION: {"name": "${partnerName}", "value": 변경후수치} -->
- 상태메시지 변경 시: <!-- STATUS_MSG: {"name": "${partnerName}", "text": "한 줄 문구"} -->
- 추천 답장 3개: <!-- SUGGESTIONS: ["답장 1", "답장 2", "답장 3"] -->`;

          formattedContents.push({ role: "user", parts: [{ text: systemInstruction }] });
          formattedContents.push({ role: "model", parts: [{ text: "괄호 지문 없이 순수 메신저 텍스트와 사진 태그만 전송하겠습니다." }] });

        } else {
          systemInstruction = `${coreIdentityPrompt}
[비주얼 노벨 / 인터랙티브 서사 모드]
당신은 두 사람의 관계성과 상황을 서술하는 AI 디렉터입니다.
- 도파미너(PC): '${pName}' (성별: ${pGender}, 특징: ${pcTone})
- 현재 대면 상대: '${partnerName}' (현재 호감도: ${currentAffinity}점, 상세: ${partnerDetail})

[📖 시나리오 배경 및 진상]
${scenarioText || "기본 서사"}

[🚨 대면 서사 진행 및 발화 지침]
1. 상대방 '${partnerName}'은 방관하지 않고 도파미너의 말과 행동에 섬세하게 반응하십시오.
2. 지문 구성: [현장 공기감과 인물의 미세 반응 2~3문단] + [${partnerName}의 직접 대사 혹은 비언어적 묘사]

[🚨 필수 시스템 태그 규칙 (지문 맨 끝에 단독 출력)]
1. 호감도 변동 시: <!-- AFFECTION: {"name": "${partnerName}", "value": 변경후수치} -->
2. 장소 이동 이벤트 시: <!-- LOCATION_CARDS: [{"name": "장소명", "desc": "분위기", "npc": "인물"}] -->
3. 공식 CG 해금 시(장소 이동 시에만 출력): <!-- UNLOCK_CG: {"id": "CG아이디", "title": "제목"} -->`;

          formattedContents.push({ role: "user", parts: [{ text: systemInstruction }] });
          formattedContents.push({ role: "model", parts: [{ text: `네, [${partnerName}]과의 대면 서사에 몰입하며 정갈하게 진행하겠습니다.` }] });
        }

      // ── [2. 도파 괴담 모드 (독자 규격 엔진 적용)] ──
      } else if (ruleMode === "insane" || ruleMode === "괴담") {
        const hStats = playerSheet?.horrorStats ? JSON.stringify(playerSheet.horrorStats) : "미설정";
        const hTraits = playerSheet?.horrorTraits ? playerSheet.horrorTraits.join(", ") : "없음";
        const hTraumas = playerSheet?.horrorTraumas ? playerSheet.horrorTraumas.join(", ") : "없음";
        const hAbyss = playerSheet?.abyssTriggers ? JSON.stringify(playerSheet.abyssTriggers) : "미설정";

        const horrorPrompt = `[👻 도파: 서스펜스/괴담 AI 디렉터링 수칙]
현재 도파미너('${pName}')의 스탯 및 특성 상태:
- [보유 스탯]: ${hStats} (1D10 판정용 기준값)
- [긍정 특성]: ${hTraits}
- [트라우마]: ${hTraumas}
- [침식도 이상 충동]: ${hAbyss}

[🚨 1. 1D10 스탯 판정 체계 (광기/이성치 용어 전면 금지)]
- 플레이어가 특정 행동(조사, 도주, 설득 등)을 선언하면 결과를 임의로 지어내지 마십시오.
- [체력, 순발, 관찰, 추론, 정신, 사교] 중 알맞은 스탯을 지정하여 1D10 판정 태그를 출력하고 서술을 즉시 멈추십시오.
  예시: <!-- CHECK: {"stat": "관찰", "target": 5, "reason": "어둠 속의 형체를 파악하기 위해"} -->
- 기존 TRPG의 잔재인 '광기', '이성치', 'SAN치'라는 단어는 절대 사용하지 마십시오.

[🚨 2. 특성 및 트라우마 발현 연출]
- 플레이어의 행동이 [긍정 특성]과 일치하면 유리함을, [트라우마]를 자극하면 숨막히는 압박감과 패널티를 묘사하십시오.
- 특성 발현 시 태그 출력: <!-- TRAIT_TRIGGER: {"name": "발현된특성명", "desc": "상황 묘사"} -->

[🚨 3. 침식도 시스템 및 이상 충동]
- 기괴한 현상이나 끔찍한 진실을 목격하면 '침식도'를 증가시키는 태그를 출력하십시오.
  예시: <!-- EROSION: {"amount": 10, "reason": "이해할 수 없는 핏자국 목격"} -->
- 만약 침식도가 특정 수치(30%, 60%, 90%)를 넘었다고 판단될 만큼 압박감이 심해지면, 시트에 적힌 [이상 충동 발현 지문]의 내용을 상황에 자연스럽게 녹여내어 강제 서술하십시오.

[🚨 4. 핸드아웃(단서) 해금 루틴]
- 조사를 완료하여 감춰진 진실을 깨달았을 때: <!-- REVEAL_HANDOUT: {"title": "단서명"} -->`;

        systemInstruction = `${coreIdentityPrompt}\n${horrorPrompt}\n\n시나리오 본문 및 배후 진상:\n${scenarioText}`;
        formattedContents.push({ role: "user", parts: [{ text: systemInstruction }] });
        formattedContents.push({ role: "model", parts: [{ text: "독자적인 괴담 엔진 규격을 숙지했습니다. 광기나 이성치 용어를 배제하고 침식도와 1D10 판정 기반으로 섬세하게 AI 디렉터링하겠습니다." }] });

      // ── [3. 본격 추리 / 수사 모드] ──
      } else {
        const mysteryPrompt = `[🕵️ 본격 추리/수사물 게임AI 디렉터 절대 수칙]
1. [페어 플레이의 원칙]: 시나리오 [기밀/진상]에 적힌 범인, 동기, 트릭은 절대 훼손하거나 도중에 바꾸지 마십시오.
2. [스포일러 엄금]: 플레이어가 현장 조사나 심문을 통해 정곡을 찌르기 전까지는 절대 먼저 힌트를 주지 마십시오.
3. [수사 시스템 태그 활용]:
   - 현장 조사 중 결정적 물증 발견 시: <!-- ITEM: {"name": "아이템명", "desc": "설명"} -->
   - 용의자의 증언이나 중요한 힌트 획득 시: <!-- CLUE: {"name": "단서명", "desc": "증언 내용"} -->
4. [진상 추리 및 신뢰도(HP) 판정]: 
   - 플레이어가 [진상 추리 선언] 시 그 논리가 [진상]과 일치한다면 범인이 붕괴하며 자백하는 클라이맥스를 연출하십시오.
   - 🚨 만약 플레이어가 억지 추리를 하거나 엉뚱한 물증을 제시했다면, 범인이 코웃음 치며 반박하게 하고 지문 맨 끝에 반드시 <!-- DAMAGE: 1 --> 태그를 단 1회 출력하여 플레이어의 신뢰도(HP)를 깎으십시오.`;

        systemInstruction = `${coreIdentityPrompt}\n${mysteryPrompt}\n\n시나리오 본문 및 배후 진상:\n${scenarioText}`;
        formattedContents.push({ role: "user", parts: [{ text: systemInstruction }] });
        formattedContents.push({ role: "model", parts: [{ text: "본격 추리 룰을 준수하여 공정하고 긴장감 넘치게 진행하겠습니다." }] });
      }

      // 🌟 최근 40턴 히스토리 병합
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
            generationConfig: { temperature: isScenarioGen ? 0.7 : 0.6 }
          });
          responseText = result.response.text();
          if (responseText) break;
        } catch (err) {
          console.warn(`[API Fallback] 키(${currentKey.slice(0, 6)}...) - ${modelName} 실패 (${err.message}). 다음 전환.`);
          lastError = err;
        }
      }

      if (responseText) break;
    }

    if (!responseText) throw lastError || new Error("모든 API 키 및 예비 모델의 한도가 초과되었습니다.");

    if (isPhoneChat && responseText) {
      responseText = responseText
        .replace(/^\s*\([\s\S]*?\)\s*/g, "")
        .replace(/^\s*\[[\s\S]*?\]\s*/g, "")
        .trim();
    }

    if (isScenarioGen) {
      responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    }

    return new Response(JSON.stringify({ text: responseText }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("API Route Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
