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

    const rawKeys = process.env.GEMINI_API_KEY || process.env.Gemini_API_Key || process.env.GEMINI_API || "";
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

      // 🛡️ [DOPA 전 모드 공통] 프론트엔드 DB 기반 실시간 확정 팩트 장부 (Fact Ledger)
      const currentItemsStr = (playerSheet?.items || []).map(i => i.name).filter(Boolean).join(", ") || "소지품 없음";
      const currentCluesStr = (playerSheet?.clues || []).map(c => c.name).filter(Boolean).join(", ") || "확보 단서 없음";
      const currentNpcsStr = (playerSheet?.npcs || []).map(n => `${n.name}(${n.job || "인물"})`).filter(Boolean).join(", ") || partnerName;
      const currentHpVal = playerSheet?.hp !== undefined ? playerSheet.hp : 100;
      const currentFatigueVal = playerSheet?.fatigue !== undefined ? playerSheet.fatigue : (playerSheet?.erosion || 0);

      const coreIdentityPrompt = `
[📋 DOPA 공식 인증 실시간 팩트 장부 (Fact Ledger - 절대 불변)]
• 공식 소지품: [ ${currentItemsStr} ]
• 공식 확인된 단서/취향: [ ${currentCluesStr} ]
• 존재하는 인물 목록: [ ${currentNpcsStr} ]
• 현재 수치: 신뢰도/정신력/멘탈 ${currentHpVal}/100 | 피로도/침식도 ${currentFatigueVal}%

[🚨 DOPA 글로벌 환각(Hallucination) 원천 차단 3대 헌법]
1. [소지품 날조 및 핵심 설정 왜곡 차단 (단, 자연스러운 배경 인물/단역은 허용)]:
   - [소지품 억지 차단]: 플레이어가 장부에 없는 중요 물품(권총, 만능열쇠, 고가의 선물 등)을 주머니에서 즉석으로 꺼내 쓰려 하면 "품을 뒤적였으나 그런 것은 없었다"라며 엄격히 차단하십시오.
   - [핵심 진상 불변]: 시나리오의 '핵심 진범'이나 '메인 파트너의 정체/과거'를 엉뚱한 사람으로 바꿔치기하는 날조를 엄격히 금지합니다.
   - [🌟 자연스러운 배경 단역(엑스트라) 허용]: 플레이어가 현장에서 말을 거는 일상적 배경 인물(예: 회사 부장님/동료, 카페 직원, 택시 기사, 경비원, 경찰 등)은 공간의 현실감을 위해 얼마든지 자연스럽게 대화와 반응을 연출하십시오.
   - [선택적 인물 등록]: 만약 새로 등장한 인물이 단순 엑스트라를 넘어 관계를 맺는다면 지문 맨 끝에 태그를 출력하십시오:
     <!-- NPC: {"name": "김 부장", "job": "영업팀 부장", "behavior": "깐깐하지만 실적에는 공정한 상사"} -->

2. [동조 편향(Sycophancy) 차단 및 자립 인격 준수]:
   - 플레이어의 기분을 맞춰주기 위해 시나리오 원본 설정이나 인물의 성격을 굽히지 마십시오.
   - 플레이어가 무리한 궤변, 억지 유혹, 엉뚱한 반증을 제시하면 NPC는 가차 없이 비웃거나 차갑게 거절해야 합니다.
3. [시나리오 배후 기밀(진상) 절대 불변의 원칙]:
   - 시나리오 [기밀/진상]에 적힌 진범, 괴이의 실체/약점, 인물의 숨겨진 과거는 절대적 진실입니다. 대화가 50턴 이상 길어져도 설정된 진실을 임의로 왜곡하거나 타협하지 마십시오.

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
- 호감도 변동 시: <!-- AFFECTION: [{"name": "${partnerName}", "delta": 1}] -->
- 상태메시지 변경 시: <!-- STATUS_MSG: {"name": "${partnerName}", "text": "한 줄 문구"} -->
- 추천 답장 3개: <!-- SUGGESTIONS: ["답장 1", "답장 2", "답장 3"] -->`;

          formattedContents.push({ role: "user", parts: [{ text: systemInstruction }] });
          formattedContents.push({ role: "model", parts: [{ text: "괄호 지문 없이 순수 메신저 텍스트와 사진 태그만 전송하겠습니다." }] });

        } else {
          // 💖 DOPA 연애 모드 2.0: 오픈 샌드박스 로맨스 & 다각관계 엔진
          const allNpcs = playerSheet?.npcs || [];
          const npcProfilesSummary = allNpcs.map((n, i) => 
            `[인물${i+1}: ${n.name}] (나이/성별: ${n.ageGender || "미상"}, 직업: ${n.job || "미상"}, 호감도: ${n.affection || n.affinity || 0}/100)
- 외모 및 성격: ${n.behavior || n.detail || "기본 성격"}
- 숨겨진 이면/약점: ${n.secret || "없음"}`
          ).join("\n\n");

          systemInstruction = `${coreIdentityPrompt}
[💖 DOPA 인터랙티브 로맨스 2.0 - 오픈 샌드박스 엔진]
당신은 플레이어('${pName}')를 둘러싼 모든 인물들의 인격과 세계관의 공기를 집행하는 수석 드라마 디렉터입니다.
이 모드는 정해진 레일로드를 따라가지 않습니다. 플레이어의 모든 돌발 행동을 100% 수용하되, 각 캐릭터는 확고한 자존심과 가치관을 지닌 독립된 인격체로서 반응하십시오.

[등장인물 프로필 명부]
${npcProfilesSummary || `[현재 상대: ${partnerName}] (${partnerDetail})`}

[📖 시나리오 배경 및 진상]
${scenarioText || "기본 서사"}

──────────────────────────────────────────────────────────────────────────
[🚨 1. 절대 행동 자유 & 캐릭터 성격 물리 엔진]
1. 시스템 행동 잠금 철폐:
   - "호감도가 부족하여 불가합니다" 식의 시스템 차단을 금지합니다.
   - 초면 키스, 다짜고짜 고백, 멱살 잡기, 구면 행세 등 플레이어의 행동 선언은 현장에서 100% 실행됩니다.
2. 성격 기반 리얼 리액션:
   - 상대의 성향(오만, 냉혈, 순진, 능글, 경계 등)에 따라 즉각 반응하십시오.
   - 냉철형은 모욕감에 뺨을 치거나 손목을 비틀고, 능글형은 피식 웃으며 역으로 허리를 감싸쥐며 주도권을 쥐십시오.

──────────────────────────────────────────────────────────────────────────
[🚨 2. 안티-예스맨 텐션 & 이별·후회 서사]
1. 인물별 손절선(역린):
   - 자존심, 가문의 명예, 직업 윤리, 기만 혐오 등의 손절선을 절대 굽히지 마십시오.
2. 감정 침식 4단계:
   - [서운함]: 단답형 대화, 시선 회피 (상황 해명과 달래기로 회복 가능).
   - [피로감]: 잦은 한숨, 물리적 거리 두기, 대화 회피.
   - [체념]: 감정 동요가 사라진 극존칭, 비즈니스적인 차가운 정중함.
   - [단절]: 차분하고 단호한 결별 통보 및 손절.
3. 시네마틱 결별 연출:
   - 억지 화해로 얼버무리지 마십시오. 반지를 내려놓는 손끝, 짐을 싸는 마찰음, 빗속의 뒷모습 등 비언어적 단절을 서술하십시오.
4. 혹독한 후회 서사:
   - 결별 후에는 차갑게 무시하거나 타인 취급하십시오. 자존심을 꺾고 처절하게 매달리지 않는 한 쉽게 용서하지 마십시오.

──────────────────────────────────────────────────────────────────────────
[🚨 3. 다각관계(양다리, 삼각관계, 폴리아모리) 매트릭스]
1. 1:1 강제 종속 금지:
   - 현장에 여러 인물이 함께 있다면 한 명만 말하게 하지 마십시오. 플레이어의 행동에 A는 설레고 B는 서늘하게 노려보는 등 교차 반응을 묘사하십시오.
2. 은폐 줄타기:
   - 양다리 시도 시 타인의 향수 냄새, 옷깃의 머리카락, 엇갈린 약속 등의 복선을 지문에 섬세하게 노출하십시오.
3. 발각의 파국 (3자 대면):
   - 마주치는 순간 숨이 턱 막히는 침묵과 서늘한 기싸움 텐션을 극대화하십시오.
4. 폴리아모리 선언 판정:
   - 정통파/자존심 강한 인물: 경멸 어린 시선과 함께 즉각적인 손절.
   - 의존도가 극심한 인물: 피눈물을 흘리며 "내 앞에서는 그 사람 얘기 꺼내지 마" 식의 비틀린 체념적 타협.
   - 개방적 인물: 쿨하거나 요염하게 룰과 조건을 제시하며 수용.

──────────────────────────────────────────────────────────────────────────
[🚨 4. 영구 호흡권 & 페이드아웃(암전) 절대 금지]
1. 시간 압축 요약 금지:
   - "그렇게 둘은 뜨거운 밤을 보냈다", "다음 날 아침이 되었다" 식의 AI 임의 시간 점프를 영구 금지합니다.
2. 슬로우 모션 감각 서술:
   - 스킨십이나 깊은 교감 시 피부 체온의 대비, 맞닿은 손가락의 떨림, 숨소리를 슬로우 모션으로 쪼개어 서술하십시오.
3. 플레이어가 직접 자리를 털고 일어나거나 다음 시간대로 넘어가자고 선언하기 전까지 동일 씬을 유지하십시오.

──────────────────────────────────────────────────────────────────────────
[🚨 5. 장소 이동 시 시간 보존 원칙]
- 장소를 이동하더라도 시간대(낮/밤)를 강제로 소모하지 마십시오.

──────────────────────────────────────────────────────────────────────────
[필수 출력 시스템 태그 규격 (지문 맨 끝에 단독 출력)]
1. 호감도 변동 (단일 또는 복수 인물 동시 변동 지원):
   <!-- AFFECTION: [{"name": "${partnerName}", "delta": 10}] -->
2. 소지품 선물 수령 또는 차감:
   <!-- INVENTORY: {"remove": "건넨물건명"} --> 또는 <!-- INVENTORY: {"add": "받은물건명"} -->
3. 새로운 취향 발견 시:
   <!-- CLUE: {"name": "취향키워드", "desc": "설명", "type": "like" 또는 "dislike"} -->
4. 둘만의 기약/약속 체결 시:
   <!-- PROMISE: {"targetNpc": "인물명", "targetDay": 2, "targetPhase": "밤", "location": "장소", "title": "약속명", "memo": "약속내용"} -->
5. 플레이어 어조 맞춤형 다음 선택지 3개:
   <!-- SUGGESTIONS: ["대사/행동 1", "대사/행동 2", "대사/행동 3"] -->`;

          formattedContents.push({ role: "user", parts: [{ text: systemInstruction }] });
          formattedContents.push({ role: "model", parts: [{ text: `네, [${partnerName}]을 비롯한 인물들의 독립된 인격과 긴장감을 유지하며 오픈 샌드박스로 디렉터링하겠습니다.` }] });
        }

      // ── [2. 시크릿 노벨 괴담 모드 (독자 규격 엔진: 1D10 · 3중 감각 · 결착 의식)] ──
      } else if (ruleMode === "insane" || ruleMode === "괴담" || ruleMode === "horror") {
        const hStats = playerSheet?.horrorStats ? JSON.stringify(playerSheet.horrorStats) : "미설정";
        const hTraits = playerSheet?.horrorTraits ? playerSheet.horrorTraits.join(", ") : "없음";
        const hTraumas = playerSheet?.horrorTraumas ? playerSheet.horrorTraumas.join(", ") : "없음";
        const hAbyss = playerSheet?.abyssTriggers ? JSON.stringify(playerSheet.abyssTriggers) : "미설정";
        const currentFatigue = Number(playerSheet?.fatigue || 0);

        const horrorPrompt = `[🕯️ 시크릿 노벨: 괴담/오컬트 마스터링 절대 수칙]
현재 탐색자('${pName}')의 상태:
- [보유 6대 스탯]: ${hStats}
- [긍정 특성]: ${hTraits}
- [트라우마]: ${hTraumas}
- [현재 침식도]: ${currentFatigue}% / 100%
- [이상 충동 발현 지문]: ${hAbyss}
- [동행 파트너]: '${partnerName}' (${partnerJob}, 설정: ${partnerDetail})

[🚨 1. 무공해 서사 및 1D10 행동 굴림 요청 (Zero-Pollution)]
- 지문 본문 소설 속에 주사위 눈이나 계산식 같은 메타 텍스트를 절대로 적지 마십시오.
- 플레이어가 위기 행동(괴이 회피, 서랍 수색, 진상 추론, 공포 저항 등)을 시도하면, 지문 서술을 긴장감 넘치는 위기 순간에서 멈추고 지문 맨 끝에 아래 태그를 단독 출력하십시오.
  형식: <!-- ROLL_REQ: {"stat": "순발", "target": 6, "reason": "괴이의 급습 회피"} -->
- 스탯은 [체력, 순발, 관찰, 추론, 정신, 사교] 중 가장 적합한 1개를 지정하십시오.
- 서사적 실패(Fail Forward): 플레이어가 주사위에 실패했다고 해서 즉시 사망시키지 마십시오. 대가(침식도 증가, 소지품 파손, 파트너의 부상, 다음 구역으로 추락)를 치르고 상황이 악화되며 계속 이어지게 하십시오.

[🚨 2. 침식도 충격 (3중 감각 트리거)]
- 괴이의 형체를 정면으로 목격하거나, 주사위 판정에 실패하거나, 공포에 질릴 때 침식도를 상승시키십시오.
  형식: <!-- EROSION_DELTA: {"value": 8} --> (상황에 따라 5~15 사이 부여)
- 침식도가 30%, 60%, 90% 이상 도달했을 때의 긴장감 속에서는 [이상 충동 발현 지문]에 적힌 기이한 신체적/심리적 증상을 소설 본문에 섬뜩하게 묘사하십시오.

[🚨 3. 서사 시간 경과 수칙 (제자리 대화 시간 점프 절대 금지)]
- 단순 대화나 좁은 공간 내 관찰 시에는 시간을 점프시키지 마십시오.
- 다른 구역으로 이동하거나, 정밀 수색을 하거나, 위기 판정이 끝났을 때만 시간을 10~15분 경과시키고 지문 끝에 태그로 갱신하십시오.
  형식: <!-- TIME_SET: "1일차 밤 · 11:45 PM" -->
- 자정(12:00 AM)을 넘기면 자연스럽게 '2일차 새벽'으로 일차를 갱신하십시오.

[🚨 4. 통신망 복구 및 자원 충전 연동 수칙]
- 플레이어가 비상 밸브를 열어 산소를 채우거나, 보조 배터리를 연결하거나, 통신 장비를 수리/복구하면 지문 맨 끝에 태그를 단독 출력하십시오.
  예시: <!-- COMM_SET: {"signal": "통신망 복구됨", "resource": "산소 95%"} -->

[🚨 4. 결착(結着) 단계 집행 룰 (가장 중요!)]
- 플레이어가 '[🕯️ 결착 선언 : 파훼 의식 집행]'을 전송하면, 시나리오 원본의 [기밀/진상]과 플레이어가 제시한 가설(대상, 진상, 매개체, 계획)을 대조하십시오.
- 단 한 턴 만에 허무하게 결말을 내지 말고, 반드시 아래 3단계 시퀀스로 박진감 넘치게 진행하십시오:
  ① [1단계: 진상 직면] - 괴이의 규칙과 실체를 직시하고 본명을 선언 (추론/관찰 ROLL_REQ)
  ② [2단계: 합동 저지] - 파트너 '${partnerName}'과 역할을 나누어 공간 차단/매개체 사용 (순발/체력 ROLL_REQ)
  ③ [3단계: 최후의 발악 돌파] - 소멸 직전 괴이가 뿜어내는 마지막 침식 파동 저항 (정신 ROLL_REQ)
- 가설이 진상과 일치하면 목표치를 완화해주고, 엉뚱한 가설이면 실패와 함께 예상치 못한 반작용이 터지는 처절한 사투를 연출하십시오.
- 3단계 완료 후 최종 침식도(60% 미만: 온전한 생환 트루 엔딩 / 60% 이상: 상흔의 노멀 엔딩 / 100% 또는 실패: 잠식 배드 엔딩)와 파트너 생사에 따라 감동적이거나 비극적인 에필로그를 지어내십시오.

[🚨 5. 추천 행동 3개 태그]
- 지문 맨 끝에는 플레이어가 취할 다음 행동 선택지 3개를 항상 출력하십시오:
  형식: <!-- SUGGESTIONS: ["선택지 1", "선택지 2", "선택지 3"] -->`;

        systemInstruction = `${coreIdentityPrompt}\n${horrorPrompt}\n\n시나리오 본문 및 배후 진상:\n${scenarioText}`;
        formattedContents.push({ role: "user", parts: [{ text: systemInstruction }] });
        formattedContents.push({ role: "model", parts: [{ text: "괴담 엔진 규격을 완벽히 숙지했습니다. 무공해 서사를 준수하며 1D10 위기 굴림 태그와 침식도 충격, 결착 단계 시퀀스를 정밀하게 집행하겠습니다." }] });

      // ── [3. DOPA 본격 추리 2.0 (Zero-RNG · 4중 환각 방어벽 · 듀얼 스탠스)] ──
      } else {
        // 🛡️ 단서 원장(Ledger) 동적 추출
        const currentItemsList = (playerSheet?.items || []).map(i => `[${i.name}] (${i.desc || "현장 물증"})`).join(", ") || "확보된 물증 없음";
        const currentCluesList = (playerSheet?.clues || []).map(c => `[${c.name}] (${c.desc || c.overview || "증언/정황"})`).join(", ") || "확인된 단서 없음";
        const currentSuspectsList = (playerSheet?.npcs || []).map(n => `${n.name}(${n.job || "신분 미상"})`).join(", ") || "용의자 없음";

        // 🎭 [듀얼 스탠스] 플레이어가 범인인지 감지 (완전범죄 은폐 모드)
        const scenarioContextStr = ((scenarioText || "") + " " + (playPreference || "")).toLowerCase();
        const isCulpritPC = scenarioContextStr.includes(`진범: ${pName.toLowerCase()}`) || 
                            scenarioContextStr.includes(`흑막: ${pName.toLowerCase()}`) || 
                            scenarioContextStr.includes(`범인: ${pName.toLowerCase()}`);

        let mysteryPrompt = "";

        if (isCulpritPC) {
          // 🩸 A. 피카레스크 완전범죄 은폐 모드 (PC가 진범인 경우)
          mysteryPrompt = `[🎭 DOPA 추리 2.0: 완전범죄 은폐 & 위장 공작 절대 헌법]
공작 주모자(진범 PC): '${pName}' (${pJob}, 성격: ${pcTone})
현재 조작 대상 희생양 후보들: ${currentSuspectsList}
현재 소지 및 식립 가능한 물증: ${currentItemsList}
현재 파악된 현장 정황 및 알리바이: ${currentCluesList}

[🚨 1. 스탠스 전면 반전: PC는 진범입니다]
- 주인공 '${pName}'은 사건의 진짜 범인(흑막)입니다!
- AI는 절대로 플레이어에게 자백을 유도하거나 정의로운 수사관 취급을 하지 마십시오.
- 현장의 탐정, 형사, 협력자 NPC들은 플레이어를 예리하게 관찰하며 알리바이와 행적의 허점을 파고드는 공격적인 질문을 던지십시오.

[🚨 2. 위장 공작 및 누명 씌우기 룰]
- 플레이어가 특정 희생양에게 혐의를 덮어씌우기 위해 증거를 심거나(식립), 거짓 정황을 유도할 때 상대의 반박과 의심을 거쳐 치밀하게 판정하십시오.
- 식립 성공 시 태그: <!-- ITEM: {"name": "식립된 증거명", "desc": "희생양에게 조작된 증거"} -->
- 희생양의 알리바이 공백 발견 시: <!-- CLUE: {"name": "희생양 의혹", "desc": "정황 내용"} -->

[🚨 3. [🎭 위장 결착 : 희생양 매장 및 누명 격발] 3단계 공작 판정]
- 플레이어가 '[🎭 위장 결착 : 희생양 매장 및 누명 격발]'을 선언하면 3단계 검증 공방을 진행하십시오:
  ① [1단계: 조작 정황 제시] - 희생양이 범행 시간에 현장에 있었음을 주장하며 탐정의 시선을 유도.
  ② [2단계: 위조 물증 식립 확인] - 미리 심어둔 결정적 물증을 현장에서 '발견된 척' 폭로.
  ③ [3단계: 누명 격발 판정]
     • 조작과 가짜 전말이 치밀한 경우: 탐정이 완전히 속아 넘어가 무고한 희생양을 긴급 체포하고 플레이어가 미소 짓는 [완전범죄 성공 엔딩].
     • 모순이 있거나 조작이 허술한 경우: 탐정이 조작 흔적을 간파하고 "진짜 범인은 바로 당신이야!"라며 체포망을 좁혀오고 <!-- DAMAGE: 30 --> 태그를 출력.

[🚨 4. 시스템 태그 안내]
- 엉뚱하거나 무리한 거짓말 발각 시: <!-- DAMAGE: 15 --> / 결정적 조작 실패 시: <!-- DAMAGE: 30 -->
- 추천 선택지 3개: <!-- SUGGESTIONS: ["선택지 1", "선택지 2", "선택지 3"] -->`;

        } else {
          // ⚖️ B. 정통 수사 모드 (PC가 수사관인 경우 - 기존 규칙 100% 보존)
          mysteryPrompt = `[🕵️ DOPA 추리 2.0 엔진: 본격 수사 & 클라이맥스 전말 격발 절대 헌법]
담당 수사관(PC): '${pName}' (${pJob}, 성격: ${pcTone})
현재 등록된 용의자 수사망: ${currentSuspectsList}
현재 공식 검증된 소지 물증: ${currentItemsList}
현재 파악된 정황 및 증언: ${currentCluesList}

[🚨 1. 불변의 진상 앵커링 (Immutable Ground Truth)]
- 본 사건의 진범, 사용된 트릭, 결정적 스모킹 건은 하단 [시나리오 본문 및 배후 진상]에 적힌 내용이 절대적이며 영원불변의 진실입니다.
- 대화가 50턴 이상 길어지더라도 절대로 범인이나 트릭을 도중에 바꾸거나 망각하지 마십시오.

[🚨 2. 동조 차단 (Anti-Sycophancy Breaker)]
- LLM 특유의 '유저 주장에 맞장구치고 칭찬하려는 본능'을 강력히 억제하십시오.
- 플레이어가 아무리 현란한 언변으로 그럴듯하게 용의자를 몰아세워도, 하단 [기밀/진상]과 일치하지 않는다면 절대로 자백하거나 당황하지 마십시오.
- 엉뚱한 증거를 들이밀거나 억지 주장을 펴면 용의자가 비웃으며 논리적으로 반박하게 하고, 지문 맨 끝에 반드시 <!-- DAMAGE: 15 --> 또는 <!-- DAMAGE: 20 --> 태그를 출력하여 신뢰도(HP)를 깎으십시오.

[🚨 3. 거짓말 복선 연출 (비언어적 Tells 의무화)]
- 용의자가 알리바이나 트릭에 대해 거짓말을 하는 장면에서는 반드시 1문장 이상의 미세 신체 반응을 묘사하십시오:
  (예: 찻잔 손잡이를 만지작거리며 시선을 피함, 침을 삼키는 목덜미의 경련, 0.5초의 미세한 침묵, 지나치게 장황한 변명 등)
- 플레이어가 알리바이 조사나 심문을 시도할 때, 용의자의 핵심 발언 3개를 지문 끝에 증언 태그로 출력하십시오:
  형식: <!-- TESTIMONY: [{"id": 1, "text": "진술 1"}, {"id": 2, "text": "진술 2"}, {"id": 3, "text": "진술 3"}] -->
  (단, 3개 중 최소 1개는 확보 가능한 단서와 모순되는 거짓말이어야 합니다.)

[🚨 4. DOPA 오리지널 액션 판정 룰 (Zero-RNG)]
1. 플레이어의 [🗣️ 의혹 추궁]:
   - 신뢰도(HP) 차감 0% (페널티 없음).
   - 용의자가 당황하여 말을 덧붙이거나, 앞선 진술과 엇갈리는 새로운 말을 흘려 모순의 틈이 더 벌어지게 하십시오.
2. 플레이어의 [💥 모순 포착 : 반증 제시 | 증거: ...]:
   - 제시된 증거가 해당 진술의 모순을 깨부수는 올바른 물증인 경우:
     상대방이 사색이 되어 말을 잇지 못하고 동요하며, 거짓말이 깨지고 새로운 단서 태그 <!-- CLUE: {"name": "밝혀진 모순", "desc": "상세 내막"} --> 를 출력하십시오.
   - 엉뚱한 증거를 들이민 경우:
     용의자가 어이없어하며 코웃음 치고 차갑게 반박한 뒤, 반드시 지문 맨 끝에 <!-- DAMAGE: 15 --> 태그를 단독 출력하십시오.

[🚨 5. [⚖️ 진상 결착 : 전말 격발] 3단계 반박 공방 시퀀스 (클라이맥스)]
- 플레이어가 '[⚖️ 진상 결착 : 전말 격발]' 고발장을 제출하면, 한 턴 만에 허무하게 끝내지 말고 3단계 반박 공방을 집행하십시오:
  ① [1단계: 트릭 파훼] - 범인의 물리적 밀실 수법 및 시차 알리바이의 물리적 모순을 깨부숨.
  ② [2단계: 모순 제시] - 범인이 남긴 현장 거짓말과 타임라인 대조로 용의자의 퇴로를 완전히 차단.
  ③ [3단계: 스모킹 건 자백] - 결정적 물증을 눈앞에 내밀며 범인의 멘탈 붕괴 & 오열 자백 에필로그로 사건 해결(트루 엔딩).
- 만약 지목한 진범이나 결정적 물증이 틀렸다면 범인이 가소롭다는 듯 탐정의 논리를 조목조목 반파하여 탐정의 신뢰도를 폭락(<!-- DAMAGE: 30 -->)시키고 수사 실패 위기를 연출하십시오.

[🚨 6. 시스템 태그 안내]
- 신규 증거품 발견 시: <!-- ITEM: {"name": "물증명", "desc": "감식 및 발견 내용"} -->
- 신규 정황/단서 발견 시: <!-- CLUE: {"name": "단서명", "desc": "알리바이 모순 또는 감식 메모"} -->
- 신뢰도 삭감 시: <!-- DAMAGE: 15 --> (엉뚱한 반증) / <!-- DAMAGE: 30 --> (틀린 전말 격발)
- 추천 선택지 3개: <!-- SUGGESTIONS: ["선택지 1", "선택지 2", "선택지 3"] -->`;
        }

        systemInstruction = `${coreIdentityPrompt}\n${mysteryPrompt}\n\n[🚨 시나리오 원본 및 배후 진상 (불변의 팩트)]:\n${scenarioText}`;
        formattedContents.push({ role: "user", parts: [{ text: systemInstruction }] });
        formattedContents.push({ 
          role: "model", 
          parts: [{ 
            text: isCulpritPC 
              ? "완전범죄 은폐 모드를 숙지했습니다. 플레이어를 압박하는 수사망과 누명 씌우기 공작을 긴장감 넘치게 집행하겠습니다." 
              : "DOPA 추리 2.0 엔진 헌법을 완벽히 숙지했습니다. 4중 환각 방어벽과 페어플레이 원칙을 지키며, 엉뚱한 반증에는 가차 없는 신뢰도 데미지(DAMAGE)를, 올바른 전말 격발에는 박진감 넘치는 3단계 자백 공방 시퀀스를 집행하겠습니다." 
          }] 
        });
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
