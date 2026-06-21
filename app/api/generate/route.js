export async function GET() {
  return Response.json({ status: "ok" });
}

// IP限速: 每分钟30次
const rateMap = new Map();
function checkRate(ip) { const n=Date.now(); const e=rateMap.get(ip); if(e&&n-e.t<60000){if(e.c>=30)return false;e.c++}else{rateMap.set(ip,{t:n,c:1})}; if(rateMap.size>5000){for(const[k,v]of rateMap){if(n-v.t>120000)rateMap.delete(k)}} return true }

export async function POST(req) {
  const clientIp = req.headers.get("x-forwarded-for") || "unknown";
  if(!checkRate(clientIp)) return Response.json({error:"请求太频繁，每分钟30次限制"},{status:429});

  let body;
  try { body = await req.json(); } catch { return Response.json({ error: "请求格式错误，请检查 JSON 格式" }, { status: 400 }); }
  const { mode, worldType, worldBackground, protagonist, allies, enemies, style, openingHook, outline, chapterIndex, previousChapterSummary, economyMode, provider, novelLength, continuationHook} = body;

  // AI 平台配置
  const PROVIDERS = {
    deepseek: { url: "https://api.deepseek.com/v1/chat/completions", key: process.env.DEEPSEEK_API_KEY, model: "deepseek-chat" },
    zhipu: { url: "https://open.bigmodel.cn/api/paas/v4/chat/completions", key: process.env.ZHIPU_API_KEY, model: "glm-4-flash" },
    agnes: { url: "https://apihub.agnes-ai.com/v1/chat/completions", key: process.env.AGNES_API_KEY, model: "agnes-2.0-flash" },
  };

  const selected = PROVIDERS[provider] || PROVIDERS.deepseek;
  if (!selected.key) {
    const names = { deepseek: "DEEPSEEK_API_KEY", zhipu: "ZHIPU_API_KEY", agnes: "AGNES_API_KEY" };
    return Response.json({ error: `缺少 API 密钥。请在网站左侧面板输入自定义 Key，或在 Vercel 环境变量中设置 ${names[provider]}` }, { status: 500 });
  }

  async function callAI(messages, defaultMax = 1200) {
    let maxTokens = defaultMax;
    if (economyMode) maxTokens = Math.floor(defaultMax * 0.6);
    try {
      const ctrl=new AbortController(); const to=setTimeout(()=>ctrl.abort(),45000);
      const res = await fetch(selected.url, {signal:ctrl.signal,
        method: "POST",
        headers: { "Authorization": `Bearer ${selected.key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: selected.model, messages, temperature: 0.8, max_tokens: maxTokens }),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => "Unknown");
        clearTimeout(to);
        throw new Error(`API ${res.status}: ${errText.slice(0, 200)}`);
      }
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("AI 返回空内容，请重试");
      return content;
    } catch (err) {
      console.error("AI call failed:", err.message);
      throw err;
    }
  }

  function safeJsonParse(text, fallback) {
    try { return JSON.parse(text.replace(/```json\s*|```/g, "").trim()); }
    catch { return fallback; }
  }

  const buildContext = () => {
    const p = protagonist || {};
    let ctx = "";
    ctx += "┌ [世界观权威设定 - 生成时必须严格遵守，不得违反] ┐\n";
    ctx += "世界观类型：" + (worldType || "未设定") + "\n";
    ctx += "世界观详情：" + (worldBackground || "未设定") + "\n";
    ctx += "风格：" + (style || "热血") + "\n";
    ctx += "\n=== 主角权威设定 ===\n";
    ctx += "姓名：" + (p.name || "主角") + "  性格：" + (p.personality || "未设定") + "  能力：" + (p.ability || "未设定") + "  弱点：" + (p.weakness || "未设定") + "\n";
    ctx += "【规则】主角能力/性格/说话方式不可偏离设定。不可突然拥有未设定的新能力。\n";
    if (allies?.length) {
      ctx += "\n=== 盟友权威设定 ===\n";
      for (const a of allies) {
        ctx += "◆ " + a.name + "：性格" + (a.personality || "?") + " 能力" + (a.ability || "?") + " 弱点" + (a.weakness || "?") + " 关系" + (a.relation || "?") + "\n";
        ctx += "  【装备规则】" + a.name + "的战斗方式必须与其能力一致。" + (a.ability?.includes("剑") ? "只用剑，绝不出现枪炮、机械义肢、科技武器" : a.ability?.includes("枪") ? "用枪，不用冷兵器" : a.ability?.includes("雷") ? "雷电近身，不用外部武器" : "按其能力特性战斗") + "\n";
      }
    }
    if (enemies?.length) {
      ctx += "\n=== 反派权威设定 ===\n";
      for (const e of enemies) {
        ctx += "◆ " + e.name + "：性格" + (e.personality || "?") + " 能力" + (e.ability || "?") + " 弱点" + (e.weakness || "?") + " 关系" + (e.relation || "?") + "\n";
        ctx += "  【装备规则】" + e.name + "的战斗方式必须与其能力一致。" + (e.ability?.includes("剑") ? "只用剑，绝不出现枪炮、机械义肢、科技武器" : e.ability?.includes("枪") ? "用枪，不用冷兵器" : e.ability?.includes("雷") ? "雷电近身，不用外部武器" : "按其能力特性战斗") + "\n";
      }
    }
    ctx += "\n=== 全局铁律 ===\n";
    ctx += "1. 世界观统一性：" + (worldType || "修仙") + "世界观下，不可出现与世界观矛盾的元素。修仙世界不出现现代科技、ICU、手机、电脑。\n";
    ctx += "2. 道具一致性：所有道具、武器、法器必须符合世界观设定。修仙世界用灵器、法宝、剑、丹药，不用科技装备。\n";
    ctx += "3. 能力体系：所有角色能力必须在世界观框架内，不可跨世界观使用能力。\n";
    ctx += "4. 时代一致性：背景设定为古代/修仙时代，不可出现现代元素。\n";
    ctx += "\n└ [以上为权威设定，生成内容不得违反] ┘\n";
    return ctx;
  };

  // 清理章节正文中的结构标签
  function cleanContent(text) {
    return text
      .replace(/^[1-5][.、]\s*(承上|起波|高潮|铺垫|钩子)[：:]\s*(.*?)(?=\n|$)/gmu, "$2")
      .replace(/^(承上|起波|高潮|铺垫|钩子)[：:]\s*/gmu, "")
      .replace(/^（(承上|起波|高潮|铺垫|钩子).*?）/gmu, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  try {
  // 1. 生成开篇点子（带吸睛亮点说明）
  if (mode === "opening") {
    const ctx = buildContext();
    const satisfactionPoints = body.satisfactionPoints || [];
    const tagInfo = body.tagInfo || {};
    const coreTags = tagInfo.coreTags || [];
    const previousIdeas = body.previousIdeas || [];
    const count = previousIdeas.length > 0 ? 5 : 5; // 无上限支持多次调用
    const tagsHint = coreTags.length > 0 ? `\n【重要】必须严格围绕以下标签生成开篇：${coreTags.join("、")}。每个点子必须体现至少2个标签。无视标签的点子视为不合格。` : "";
    const spHint = satisfactionPoints.length > 0 ? `\n融入爽点：${satisfactionPoints.join("、")}。` : "";
    const continueHint = previousIdeas.length > 0 ? `\n已有开篇：${previousIdeas.map(i => i.idea || i).join("|")}。生成与已有不同的新开篇。` : "";

    const prompt = `生成${count}个炸裂有记忆点的开篇点子，每个输出格式为：
方向：[开篇梗概30字内]
看点：[为什么这个开篇能抓住读者，15字内]
不要编号，不要其他文字。${tagsHint}${spHint}${continueHint}\n${ctx}`;

    const result = await callAI([
      { role: "system", content: "你是脑洞开篇设计师，每个点子独特有记忆点，附带清晰的吸睛理由。" },
      { role: "user", content: prompt },
    ], 1200);

    const lines = result.split("\n").filter(l => l.trim());
    const ideas = [];
    let current = {};
    for (const line of lines) {
      if (line.startsWith("方向：") || line.startsWith("点子:")) {
        if (current.idea) ideas.push(current);
        current = { idea: line.replace(/^点子[：:]\s*/, "").trim() };
      } else if (line.startsWith("看点：") || line.startsWith("亮点:")) {
        current.highlight = line.replace(/^亮点[：:]\s*/, "").trim();
      }
    }
    if (current.idea) ideas.push(current);
    if (ideas.length === 0) {
      ideas.push(...result.split("\n").filter(l => l.trim().length > 3).slice(0, count).map(l => ({ idea: l.replace(/^[\d\.\s、]+/, "").trim().slice(0, 40), highlight: "引人入胜" })));
    }
    return Response.json({ ideas: ideas.slice(0, count) });
  }

  // 2. 生成大纲（根据篇幅生成对应章数）
  if (mode === "outline") {
    const chapterCounts = { short: 20, medium: 40, long: 60, epic: 80 };
    const targetCount = chapterCounts[novelLength] || 40;
    const ctx = buildContext();
    const prompt = `设定：${ctx}\n开篇钩子：${openingHook}\n请严格按以下格式生成${targetCount}章大纲，每章一行：\n第X章 标题：具体标题 钩子：一句话悬念\n不要写正文，不要写摘要，只写标题和钩子。按顺序从第1章到第${targetCount}章。标题要有辨识度。`;
    const maxTokens = economyMode ? Math.max(800, targetCount * 30) : Math.max(2000, targetCount * 60);
    const result = await callAI([
      { role: "system", content: "你是小说结构师。严格按格式输出每章一行。不要省略任何章节。" },
      { role: "user", content: prompt },
    ], maxTokens);
    const lines = result.split("\n").filter(l => l.trim());
    const outline = [];
    // Try multiple parse strategies
    for (const line of lines) {
      // Strategy 1: "第X章 标题：xxx 钩子：xxx" on same line
      let titleMatch = line.match(/第\d+章\s*[：:.\s]\s*(.+?)(?:\s*钩子[：:]|$)/);
      let hookMatch = line.match(/钩子[：:]\s*(.+?)$/);
      // Strategy 2: "标题：xxx" on its own line
      if (!titleMatch) titleMatch = line.match(/标题[：:]\s*(.+)/);
      if (titleMatch) {
        let title = titleMatch[1].trim();
        title = title.replace(/^[：:\s]+/, "").trim();
        if (title) {
          outline.push({
            title: title,
            hook: (hookMatch ? hookMatch[1].trim() : "悬念继续"),
            summary: "",
          });
        }
      }
    }
    // Fallback: multi-line format (title line, hook line)
    if (outline.length === 0) {
      let current = {};
      for (const line of lines) {
        if (line.includes("标题：") || line.includes("标题:")) {
          if (current.title) outline.push({ ...current, summary: "" });
          current = { title: line.replace(/.*标题[：:]\s*/, "").trim() };
        } else if (line.includes("钩子：") || line.includes("钩子:")) {
          current.hook = line.replace(/.*钩子[：:]\s*/, "").trim();
          if (current.title) { outline.push({ ...current, summary: "" }); current = {}; }
        }
      }
      if (current.title) outline.push({ ...current, summary: "" });
    }
    if (outline.length === 0) outline.push({ title: "第一章", hook: "故事开始了", summary: "" });
    return Response.json({ outline: outline.slice(0, targetCount) });
  }

  // 3. 生成具体章节（强化版：承接上文→起伏→意外→悬念钩子）
  if (mode === "chapter") {
    const ctx = buildContext();
    const chapter = outline[chapterIndex];
    const previousSummary = previousChapterSummary || "无";
    const feedback = body.feedback || "";
    let targetLength = economyMode ? "500-700字" : "900-1200字";

    const prompt = `你是一位网文作家。你的任务是严格按照下面的世界观权威设定写作。任何偏离设定的内容都是不合格的。请根据以下信息写出第${chapterIndex + 1}章正文。

【世界观与设定】
${worldBackground || worldType}
主角：${protagonist.name}（性格${protagonist.personality || "复杂立体"}，能力${protagonist.ability || "在成长中"}，弱点${protagonist.weakness || "人性"}）
${allies?.length ? "盟友：" + allies.map(a => `${a.name}(${a.relation})`).join("、") : ""}
${enemies?.length ? "对手：" + enemies.map(e => `${e.name}(${e.relation})`).join("、") : ""}
风格：${style}
时间线：故事发生在"三年前"那场深渊裂缝任务之后的现在。顾青云和林夜三年前还是战友，现在变成敌人。不要出现"六年"、"十年前"等矛盾时间表述。

【本章】标题《${chapter.title}》，钩子：${chapter.hook}
【上章摘要】${previousSummary}

【角色约束——请严格遵循，但以下面自然的方式融入写作，不要生硬说明】
- 林夜：不是圣人。有脾气但压着，有恐惧但不逃。说话短，有时候太短让人误会。对自己狠，对敌人更狠。但面对苏婉清不一样——那是他唯一不设防的人。战斗方式：雷电淬体近身搏斗，不用外部武器，靠赤雷和拳头。战斗方式：雷电淬体近身搏斗，不用外部武器，靠赤雷和拳头。战斗方式：雷电淬体近身搏斗，不用外部武器，靠赤雷和拳头
- 苏婉清：看起来温柔但所有人都怕她生气。做事周到到令人发指。说话直接，林夜犯傻她会讽刺。她的温柔不是柔弱——是能力太强不用凶。战斗方式：灵能辅助，不主攻，以灵器和符箓为主。战斗方式：灵能辅助，不主攻，以灵器和符箓为主。战斗方式：灵能辅助，不主攻，以灵器和符箓为主
- 顾青云：不是疯批反派。穿白西装喝红酒，说话有礼貌，做事有原则——只是他的原则和别人不一样。三年前的事他认为是对的。他和林夜之间不是单纯仇恨，是都回不去了。他独处时会看一张旧照片。\n【装备铁律】顾青云只用剑（天赋剑意化形），绝不使用枪炮、机械义肢、科技武器。他的战斗场景必须出现剑或剑意，不能出现炮管、子弹、机械臂等科技装备。\n【装备铁律】顾青云只用剑（天赋剑意化形），绝不使用枪炮、机械义肢、科技武器。他的战斗场景必须出现剑或剑意，不能出现炮管、子弹、机械臂等科技装备。\n【装备铁律】顾青云只用剑（天赋剑意化形），绝不使用枪炮、机械义肢、科技武器。他的战斗场景必须出现剑或剑意，不能出现炮管、子弹、机械臂等科技装备

【写作要求】
- 从上章结尾自然开始，像翻书翻到下一页
- 情节发展由角色的选择和性格推动，不要让“剧情需要”凌驾于角色之上
- 结尾停在角色面临选择的时刻，而不是刻意制造悬念
- 对话要贴合角色：林夜话少但到位，苏婉清直接不绕弯，顾青云话里有话
- 描写具体的东西：物品的质感、光线的方向、声音的远近——而不是抽象的感受
- 【硬性禁止】以下现代元素一律不出现：手机、电脑、电话、短信、微信、ICU、医院、救护车、手术、注射、电梯、电灯、电网、WiFi、网络、屏幕。取代方案：传讯=传音符/灵鸽/飞剑传书，治疗=丹药/灵气疗伤，照明=夜明珠/灵灯，记录=玉简/卷轴。
            禁止使用的AI套路词和句式：
  “空气中弥漫着” “他的眼中闪过” “嘴角勾起一抹” “就在这时” “突然”后面紧跟“然而”
  “在XX的世界里” “随着XX的发展” “不仅仅” “仿佛在说” “似乎”
- 不要解释角色动机。让读者通过角色的行为自己理解
- 节奏要有呼吸：紧张场景后给一两段日常——林夜怎么吃饭、苏婉清怎么整理装备、顾青云独处时在想什么
${continuationHook ? `【写作方向引导——请围绕以下方向展开本章，自然融入不要生硬】${continuationHook}
` : ""}
字数：${targetLength}。输出正文后另起一行"【本章摘要】："加100字内摘要。`;

    const result = await callAI([
      { role: "system", content: `你是一个写小说的。你不是AI，你是一个有自己文风的人。你写的人物会说人话，情节推动靠角色自己的选择，不是靠作者安排。你讨厌套路。` },
      { role: "user", content: prompt },
    ], economyMode ? 1200 : 1800);

    const summaryMatch = result.match(/【本章摘要】：([\s\S]*)/);
    const summary = summaryMatch ? summaryMatch[1].trim() : "";
    let content = result.replace(/【本章摘要】：[\s\S]*/, "").trim();
    content = cleanContent(content);

    return Response.json({ content, summary });
  }

  // 4. 网文市场调研（深度版）
  if (mode === "market_research") {
    const prompt = `你是网文市场分析师。输出严格JSON，不要其他文字：

{
  "marketOverview": "200字市场全景总结",
  "genreAnalysis": [
    {"genre":"题材名","subGenres":"细分","heat":"S/A/B/C","competition":"红海/蓝海","readers":"读者画像","money":"变现力","words":"典型篇幅","platform":"适合平台","trend":"上升/下降","success":"核心要素","works":"代表作","pitfall":"常见坑"}
  ],
  "platformTrends": [
    {"platform":"平台","hot":"当下火什么","readers":"读者特征","pay":"付费模式","newbie":"对新人的友好度"}
  ],
  "readerInsights": {
    "peakTime":"读者活跃时段",
    "chapterLen":"偏好单章字数",
    "updateFreq":"期望更新频率",
    "retention":["留存因素"],
    "abandon":["弃书原因"]
  },
  "writingTrends": {
    "perspectives":"流行视角",
    "opening":"有效开篇手法",
    "pacing":"节奏趋势",
    "shortVsLong":"短篇vs长篇市场对比"
  },
  "blueOcean": [
    {"niche":"蓝海方向","why":"为什么是蓝海","audience":"潜在读者","difficulty":"创作难度"}
  ],
  "monetization": "变现与新人起步建议",
  "recommendations": [
    {"idea":"题材建议","fit":"匹配度","advantage":"市场优势","risk":"风险","angle":"差异化切入点","words":"建议篇幅","platform":"推荐平台","hook":"第一章钩子方向"}
  ]
}

用户偏好：世界类型 ${worldType}，风格 ${style}，背景 ${worldBackground || "未填"}。
genreAnalysis 必须覆盖8个题材：爽文无敌流、短篇中短篇、系统流、穿越重生、甜宠虐恋、悬疑惊悚、末世废土、修仙玄幻。
每个字段都要有内容，不要留空。recommendations给3个。`;

    const result = await callAI([
      { role: "system", content: "你是网文市场分析师。输出严格JSON，不要markdown代码块，不要省略任何字段。" },
      { role: "user", content: prompt },
    ], 4000);

    // 尝试修复常见 JSON 问题
    let jsonStr = result.replace(/```json|```/g, "").trim();
    // 如果 JSON 不完整，尝试补全
    try {
      JSON.parse(jsonStr);
    } catch (e) {
      // 截断修复：补全未闭合的括号
      let fixed = jsonStr;
      let openBraces = (fixed.match(/\{/g) || []).length;
      let closeBraces = (fixed.match(/\}/g) || []).length;
      let openBrackets = (fixed.match(/\[/g) || []).length;
      let closeBrackets = (fixed.match(/\]/g) || []).length;
      // 去掉可能被截断的最后一段
      const lastComma = fixed.lastIndexOf(',"');
      if (lastComma > fixed.length * 0.7) {
        fixed = fixed.substring(0, lastComma);
      }
      // 补全
      while (closeBrackets < openBrackets) { fixed += "]"; closeBrackets++; }
      while (closeBraces < openBraces) { fixed += "}"; closeBraces++; }
      // 补引号
      if ((fixed.match(/"/g) || []).length % 2 !== 0) {
        fixed += '"';
      }
      try {
        JSON.parse(fixed);
        jsonStr = fixed;
      } catch {}
    }

    try {
      const parsed = JSON.parse(jsonStr);
      return Response.json(parsed);
    } catch {
      return Response.json({
        marketOverview: "AI 返回过长导致截断，请重试（已优化）",
        genreAnalysis: [],
        platformTrends: [],
        readerInsights: {},
        writingTrends: {},
        blueOcean: [],
        monetization: "重试一次即可",
        recommendations: [],
      });
    }
  }

  // 5. 故事追踪器 —— 盘点角色状态、能力走向、伏笔、关系变化
  if (mode === "story_tracker") {
    const chapterSummaries = (body.chapterSummaries || []).map((s, i) => `第${i + 1}章摘要：${s}`).join("\n");
    const prompt = `你是小说编辑。请根据以下信息输出一份角色与剧情追踪报告。严格按 JSON 输出，不要其他文字：

{
  "characters": [
    {
      "name": "角色名",
      "role": "主角/正派/反派",
      "currentStatus": "当前状态（存活/重伤/失踪/已死/新觉醒等）",
      "abilityProgression": "能力变化轨迹（从什么变成了什么）",
      "personalityArc": "性格变化（如从懦弱变坚强）",
      "keyRelationships": [{"with": "另一个角色", "status": "当前关系状态"}],
      "pendingConflicts": ["未解决的冲突或伏笔"],
      "endingDirection": "当前剧情暗示的结局走向"
    }
  ],
  "plotThreads": [
    {"name": "伏笔/支线名称", "status": "进行中/已回收/遗忘", "firstAppeared": 1, "shouldResolveBy": 5, "note": "当前进展"}
  ],
  "worldChanges": ["世界/势力格局的变化"],
  "consistencyWarnings": ["前后矛盾或设定冲突的地方"],
  "nextChapterTips": "基于以上分析，下一章应该注意什么"
}

材料：
- 主角设定：${JSON.stringify(body.protagonist || {})}
- 正派：${JSON.stringify(body.allies || [])}
- 反派：${JSON.stringify(body.enemies || [])}
- 世界观：${body.worldBackground || body.worldType}
- 大纲：${JSON.stringify(body.outline || [])}
- 已写章节摘要：
${chapterSummaries || "尚无章节"}

请认真分析，确保角色不串台、能力不丢失、伏笔不遗忘。`;

    const result = await callAI([
      { role: "system", content: "你是专业小说编辑，擅长追踪角色弧线和伏笔管理。输出严格JSON。" },
      { role: "user", content: prompt },
    ], 1200);

    try {
      const parsed = JSON.parse(result.replace(/```json|```/g, "").trim());
      return Response.json(parsed);
    } catch {
      return Response.json({
        characters: [],
        plotThreads: [],
        worldChanges: [],
        consistencyWarnings: ["解析失败"],
        nextChapterTips: "请重试",
        raw: result,
      });
    }
  }

  // 6. 随机世界观生成
  if (mode === "world_random") {
    const prompt = `随机生成一个小说世界观设定。输出严格JSON，不要其他文字：
{
  "type": "世界观类型（如修仙/科幻/末世/都市异能/古风武侠等）",
  "era": "时代背景（具体年代特征）",
  "geography": "地理环境（3-5句描述地形、城市、气候）",
  "powerSystem": "力量/能力体系（等级、修炼方式、资源，2-3句说明）",
  "socialStructure": "社会结构（阶层、势力分布、政治格局）",
  "history": "世界历史重大事件（2-3个影响当前格局的事件）",
  "rules": "世界核心规则（3-5条不可违背的铁则）",
  "specialFeatures": "这个世界最独特的3个亮点",
  "atmosphere": "整体氛围（如：黑暗压抑/热血燃燃/诡谲悬疑/轻松治愈）"
}
要求：要有创意但内部逻辑自洽，不要套模板。每个字段内容具体真实，不要空泛。`;

    const result = await callAI([
      { role: "system", content: "你是世界观架构师，擅长创造逻辑自洽、有深度的虚构世界。输出严格JSON。" },
      { role: "user", content: prompt },
    ], 1500);

    try {
      const parsed = JSON.parse(result.replace(/```json|```/g, "").trim());
      return Response.json(parsed);
    } catch {
      return Response.json({ type: "修仙", era: "灵气复苏百年后", geography: "废土浮空城", powerSystem: "灵根→筑基→金丹→元婴→化神", socialStructure: "宗门与散修对立", history: "天裂之变", rules: "灵力守恒、因果报应", specialFeatures: "浮空城、灵脉战争", atmosphere: "热血中带悲壮" });
    }
  }

  // 7. 详细角色生成（含穿搭/气质/装备/天赋/排行）
  if (mode === "character_detail") {
    const worldCtx = body.worldBackground || body.worldType || "修仙世界";
    const roleType = body.roleType || "主角"; // 主角/正派/反派/中立
    const prompt = `为${worldCtx}世界观下的一个${roleType}角色生成详细设定。输出严格JSON：
{
  "name": "角色名（符合世界观风格）",
  "gender": "男/女",
  "age": "年龄（具体数字）",
  "role": "${roleType}",
  "personality": "性格特点（3-5个关键词+详细描述）",
  "appearance": "外貌描写（2-3句，有辨识度）",
  "clothing": "穿搭风格（具体描述常穿的衣服、配饰、代表色）",
  "temperament": "气质描述（举手投足给人的感觉）",
  "ability": "核心能力/技能（名称+效果说明）",
  "equipment": "装备/法宝（名称+外观+功能，1-3件）",
  "talent": "天赋/特长（与生俱来的优势）",
  "weakness": "弱点/缺陷（性格或能力上的致命短板）",
  "ranking": "实力排行（在已知角色中处于什么水平，用描述不用数字）",
  "backstory": "背景故事（3-4句，含关键转折事件）",
  "motivation": "核心动机/目标",
  "speechStyle": "说话风格（口头禅、语气特点）",
  "relationships": "与其他角色的关系预设"
}
要求：角色要有血有肉有缺点，不要完美人设。穿搭和气质要匹配世界观。名字要有特色不烂大街。`;

    const result = await callAI([
      { role: "system", content: "你是角色设计师，擅长创造立体、有记忆点、不脸谱化的人物。输出严格JSON。" },
      { role: "user", content: prompt },
    ], 1500);

    try {
      const parsed = JSON.parse(result.replace(/```json|```/g, "").trim());
      return Response.json(parsed);
    } catch {
      return Response.json({ name: roleType + "·未命名", gender: "男", age: "25", role: roleType, personality: "复杂多面", appearance: "", clothing: "", temperament: "", ability: "", equipment: "", talent: "", weakness: "", ranking: "", backstory: "", motivation: "", speechStyle: "", relationships: "" });
    }
  }

  // 8. 深度市场分析（热门书籍+爽点分析+排行）
  if (mode === "market_deep") {
    const prompt = `你是网文市场分析师。输出严格JSON：

{
  "hotBooks": [
    {"title":"近期热书","author":"作者","genre":"类型","heat":"热度","whyHot":"为什么火（3点核心原因）","satisfactionPoints":["读者最爽的点"],"learnFrom":"值得学习的技巧"}
  ],
  "satisfactionAnalysis": {
    "definition": "什么是爽点",
    "categories": [{"type":"爽点类型","desc":"描述","example":"例子","frequency":"使用频率建议"}],
    "howToBuild":"如何在不同章节铺设爽点",
    "commonMistakes":["爽点设计的常见错误"]
  },
  "hotRanking": [
    {"rank":1,"genre":"类型","trend":"趋势","readerBase":"读者基础","newAuthorChance":"新人机会评估","keyWords":["热门标签"]}
  ],
  "plotPatterns": [
    {"pattern":"剧情模式名称","desc":"描述","whyWorks":"为什么有效","risk":"潜在风险"}
  ]
}

hotRanking列出当前最热的6个类型排行。
satisfactionAnalysis的categories至少5种爽点类型。
hotBooks至少4本。`;

    const result = await callAI([
      { role: "system", content: "你是网文市场研究专家。输出严格JSON，每个字段都要有实质内容。" },
      { role: "user", content: prompt },
    ], 4000);

    let jsonStr = result.replace(/```json|```/g, "").trim();
    try { JSON.parse(jsonStr); } catch {
      let fixed = jsonStr;
      let ob = (fixed.match(/\{/g)||[]).length, cb = (fixed.match(/\}/g)||[]).length;
      let obr = (fixed.match(/\[/g)||[]).length, cbr = (fixed.match(/\]/g)||[]).length;
      const lastComma = fixed.lastIndexOf(',"');
      if (lastComma > fixed.length * 0.7) fixed = fixed.substring(0, lastComma);
      while (cbr < obr) { fixed += "]"; cbr++; }
      while (cb < ob) { fixed += "}"; cb++; }
      try { JSON.parse(fixed); jsonStr = fixed; } catch {}
    }
    try {
      return Response.json(JSON.parse(jsonStr));
    } catch {
      return Response.json({ hotBooks: [], satisfactionAnalysis: { definition:"", categories:[], howToBuild:"", commonMistakes:[] }, hotRanking: [], plotPatterns: [] });
    }
  }

  // 9. 趋势数据库（供数据库页面+随机生成参考）
  if (mode === "trend_database") {
    const prompt = `你是网文市场数据库。输出严格JSON，覆盖以下全部维度，每个字段都要详实：

{
  "meta": {"updatedAt": "当前日期", "dataSource": "基于各平台公开数据与行业观察"},
  "hotBooks": [
    {"rank":1,"title":"书名","author":"作者","genre":"类型","readers":"读者量级","whyHot":"为什么火（5点）","keySatisfactionPoints":["爽点1","爽点2"],"innovations":["创新点"],"worldType":"世界观类型"}
  ],
  "satisfactionPoints": [
    {"name":"爽点名称","desc":"描述","effect":"读者心理效果","usage":"如何使用","frequency":"建议频率","worksWellWith":["搭配的题材"],"example":"经典例子"}
  ],
  "trendingWorldTypes": [
    {"type":"世界观类型","heat":95,"reason":"为什么火","readerGroup":"受众","competition":80,"newcomerFriendly":true,"keyElements":["必备元素"]}
  ],
  "trendingCharacterTypes": [
    {"archetype":"角色原型","heat":90,"traits":["特征1","特征2"],"whyPopular":"为什么受欢迎","fitWorldTypes":["适配世界观"]}
  ],
  "trendingGenres": [
    {"genre":"大类","subGenres":["细分"],"heat":95,"trend":"上升/平稳/下降","avgReaders":"平均读者量","tags":["标签"]}
  ],
  "plotPatterns": [
    {"name":"模式名","desc":"描述","effectiveness":"有效性","bestGenre":"最适合类型","risk":"风险"}
  ]
}

hotBooks 至少8本，satisfactionPoints 至少8种，trendingWorldTypes 至少6种，trendingCharacterTypes 至少6种，trendingGenres 至少8个`;

    const result = await callAI([
      { role: "system", content: "你是网文市场数据库分析师，输出详实、有数据支撑的市场情报。严格JSON格式。" },
      { role: "user", content: prompt },
    ], 4000);

    let jsonStr = result.replace(/```json|```/g, "").trim();
    try { JSON.parse(jsonStr); } catch {
      let fixed = jsonStr;
      let ob = (fixed.match(/\{/g)||[]).length, cb = (fixed.match(/\}/g)||[]).length;
      let obr = (fixed.match(/\[/g)||[]).length, cbr = (fixed.match(/\]/g)||[]).length;
      const lc = fixed.lastIndexOf(',"');
      if (lc > fixed.length * 0.7) fixed = fixed.substring(0, lc);
      while (cbr < obr) { fixed += "]"; cbr++; }
      while (cb < ob) { fixed += "}"; cb++; }
      try { JSON.parse(fixed); jsonStr = fixed; } catch {}
    }
    try { return Response.json(JSON.parse(jsonStr)); }
    catch { return Response.json({ meta: {updatedAt: "获取失败"}, hotBooks: [], satisfactionPoints: [], trendingWorldTypes: [], trendingCharacterTypes: [], trendingGenres: [], plotPatterns: [] }); }
  }

  // 10. 预测模式：对比热书+当前热点+预估读者
  if (mode === "predict") {
    const bookInfo = body.bookInfo || {};
    const trendDB = body.trendDB || {};
    const prompt = `你是网文市场预测分析师。根据以下信息做一份发布预测报告，输出严格JSON：

{
  "comparison": [
    {"aspect":"对比维度","currentBook":"本书情况","hotBook":"热书对比","gap":"差距分析","suggestion":"改进建议"}
  ],
  "hotEventConnections": [
    {"event":"当前热点事件/话题","relevance":"与本书的关联度","howToLeverage":"如何借势"}
  ],
  "readershipPrediction": {
    "lowEstimate":"保守估计读者数",
    "midEstimate":"中等估计读者数",
    "highEstimate":"乐观估计读者数",
    "factors":["影响预估的关键因素"],
    "firstWeekPrediction":"首周表现预测",
    "longTailPotential":"长尾潜力评估"
  },
  "strengthsWeaknesses": {
    "strengths":["本书优势"],
    "weaknesses":["本书劣势"],
    "opportunities":["市场机会"],
    "threats":["竞争威胁"]
  },
  "score": {"overall":75,"story":70,"characters":80,"marketFit":75,"innovation":70},
  "verdict": "一句话总结预测"
}

本书信息：世界观${bookInfo.worldType || "未知"}，风格${bookInfo.style || "未知"}，主角${bookInfo.protagonist || "未知"}，章节数${bookInfo.chapterCount || 0}
热书参考：${JSON.stringify(trendDB.hotBooks?.slice(0,3) || [])}
当前热点方向：${JSON.stringify(trendDB.trendingGenres?.slice(0,3) || [])}`;

    const result = await callAI([
      { role: "system", content: "你是网文市场预测分析师，给出有数据依据的预测。输出严格JSON。" },
      { role: "user", content: prompt },
    ], 2000);

    try {
      return Response.json(JSON.parse(result.replace(/```json|```/g, "").trim()));
    } catch {
      return Response.json({ comparison:[], hotEventConnections:[], readershipPrediction:{lowEstimate:"",midEstimate:"",highEstimate:"",factors:[],firstWeekPrediction:"",longTailPotential:""}, strengthsWeaknesses:{strengths:[],weaknesses:[],opportunities:[],threats:[]}, score:{overall:50,story:50,characters:50,marketFit:50,innovation:50}, verdict:"预测失败，请重试" });
    }
  }

  // 11. 审核模式：检查角色一致性（性格/装备/天赋/成长）
  if (mode === "audit_chapter") {
    const chapterContent = body.chapterContent || "";
    const characters = body.characters || [];
    const prompt = `你是小说角色一致性审核员。检查以下章节内容中的角色表现是否与设定一致。输出严格JSON：

{
  "overallScore": "一致/基本一致/有偏差/严重不符",
  "checks": [
    {"character":"角色名","aspect":"性格/装备/天赋/成长/关系","expected":"设定要求","actual":"文中表现","match":"✓/⚠/✗","detail":"具体说明"}
  ],
  "issues": [
    {"severity":"严重/一般/轻微","character":"角色名","problem":"问题描述","fix":"修改建议"}
  ],
  "missingElements": ["文中缺失但设定中有的元素"],
  "contradictions": ["前后矛盾的地方"],
  "suggestions": "整体修改建议"
}

角色设定：${JSON.stringify(characters)}
章节内容：${chapterContent.slice(0, 3000)}

【特别要求】重点检查以下一致性：
1. 装备/武器是否与角色设定一致（例：顾青云设定用剑，文中不能用炮管或义肢）
2. 能力/天赋是否被替换为不相关的能力（例：雷劫淬体不能变成火系能力）
3. 性格表现是否与设定矛盾（例：沉稳角色不应有冲动暴躁行为）
4. 角色间关系是否与设定一致`;

    const result = await callAI([
      { role: "system", content: "你是小说编辑，严格审核角色一致性。输出严格JSON。" },
      { role: "user", content: prompt },
    ], 1500);

    try {
      return Response.json(JSON.parse(result.replace(/```json|```/g, "").trim()));
    } catch {
      return Response.json({ overallScore:"审核失败", checks:[], issues:[], missingElements:[], contradictions:[], suggestions:"请重试" });
    }
  }

  // 12. 精炼开篇生成（五步交互+爆款书融合）
  if (mode === "opening_v2") {
    const { selectedBooks, selectedTags, customElements, worldType, worldBackground, protagonist, style, selectedSatisfactions, marketContext } = body;
    const booksDesc = (selectedBooks || []).map(b => b.title).join("、");
    const tagsDesc = (selectedTags || []).join("、");
    // 拼入市场调研上下文
    const hotBookCtx = marketContext?.hotBooks?.length ? `\n热书参考：${marketContext.hotBooks.map(b => `${b.title}(${b.reason||""})`).join("；")}` : "";
    const satCtx = marketContext?.satisfactionCategories?.length ? `\n爽点类型参考：${marketContext.satisfactionCategories.map(c => c.type || c).join("、")}` : "";
    const genreCtx = marketContext?.trendingGenres?.length ? `\n热门题材参考：${marketContext.trendingGenres.map(g => g.genre).join("、")}` : "";

    const prompt = `你是网文爆款标签提炼师。根据以下信息提炼核心创作标签。输出严格JSON：

{
  "coreTags": ["标签1","标签2","标签3","标签4","标签5"],
  "openingDirection": "开篇方向概括（15字内）",
  "highlightElements": ["亮点1","亮点2","亮点3"],
  "characterKeywords": {"主角":"主角特征","冲突":"核心冲突","氛围":"气氛"},
  "suggestedHooks": ["钩子方向1","钩子方向2","钩子方向3"]
}

融合基底：${booksDesc || "随机"}
选中标签：${tagsDesc || "无"}
自定义元素：${customElements || "无"}
世界观：${worldBackground || worldType || "修仙"}  风格：${style || "热血"}
主角：${protagonist?.name || "主角"}  额外爽点：${(selectedSatisfactions || []).join("、") || "无"}
${hotBookCtx}${satCtx}${genreCtx}
标签要精准有辨识度，必须参考上述市场调研数据。`;

    const result = await callAI([
      { role: "system", content: "你是网文标签提炼师，输出精准关键词。严格JSON。" },
      { role: "user", content: prompt },
    ], 600);

    try {
      return Response.json(JSON.parse(result.replace(/```json|```/g, "").trim()));
    } catch {
      return Response.json({ coreTags: selectedTags?.slice(0, 5) || [], openingDirection: `${worldType}开篇`, highlightElements: [], characterKeywords: {}, suggestedHooks: [] });
    }
  }

  // 13. 续写点子生成
  if (mode === "continuation") {
    const ctx = buildContext();
    const chapterIndex = body.chapterIndex || 1;
    const chapterTitle = body.chapterTitle || `第${chapterIndex + 1}章`;
    const previousSummary = body.previousSummary || "";
    const prompt = `设定：${ctx}\n当前进度：即将写${chapterTitle}。上一章摘要：${previousSummary || "无（这是第一章）"}\n请生成5个${chapterTitle}的续写点子，每个格式为：方向：[续写方向30字内] 看点：[为什么这个方向精彩，15字内]。不要编号，不要其他文字。点子要有悬念感和冲击力。`;
    const result = await callAI([
      { role: "system", content: "你是脑洞续写设计师，每个续写方向独特有记忆点，附带清晰的吸睛理由。" },
      { role: "user", content: prompt },
    ], 1200);
    const lines = result.split("\n").filter(l => l.trim());
    const ideas = [];
    let current = {};
    for (const line of lines) {
      if (line.startsWith("方向：") || line.startsWith("点子:")) {
        if (current.idea) ideas.push(current);
        current = { idea: line.replace(/^点子[：:]\s*/, "").trim() };
      } else if (line.startsWith("看点：") || line.startsWith("亮点:")) {
        current.highlight = line.replace(/^亮点[：:]\s*/, "").trim();
      }
    }
    if (current.idea) ideas.push(current);
    if (ideas.length === 0) {
      ideas.push(...result.split("\n").filter(l => l.trim().length > 3).slice(0, 5).map(l => ({ idea: l.replace(/^[\d\.\s、]+/, "").trim().slice(0, 40), highlight: "精彩续写" })));
    }
    return Response.json({ ideas: ideas.slice(0, 5) });
  }

  // 14. 分析已有小说——提取框架信息用于续写
  if (mode === "analyze_novel") {
    const novelText = body.novelText || "";
    const firstPart = novelText.slice(0, 3000);
    const lastPart = novelText.slice(-5000);
    const textToAnalyze = novelText.length > 8000
      ? `【小说开头部分】\n${firstPart}\n\n...（中间省略）...\n\n【小说最近部分】\n${lastPart}`
      : novelText;

    const prompt = `你是一位专业的小说编辑和分析师。请仔细阅读以下小说内容，提取关键信息。输出严格JSON（不要markdown代码块）：

{
  "worldType": "从[西幻/修仙/现代/末世]中选择最接近的世界观类型",
  "worldBackground": "世界观背景描述（80字内）",
  "protagonist": {
    "name": "主角姓名",
    "personality": "从[热血/冷酷/腹黑/天真/温柔/傲娇/沉稳/偏执/洒脱/阴郁/狡黠/正直/善良/懒散/疯批/懦弱/毒舌/忠犬]中选择最接近的性格",
    "ability": "主角核心能力",
    "weakness": "主角弱点或缺陷"
  },
  "allies": [{"name":"角色名","personality":"性格","ability":"能力","weakness":"弱点","relation":"与主角关系（朋友/恋人/部下/师徒等）"}],
  "enemies": [{"name":"角色名","personality":"性格","ability":"能力","weakness":"弱点","relation":"与主角关系（敌人/宿敌/背叛者等）"}],
  "style": "从[热血战斗/轻松搞笑/悬疑惊悚/甜宠浪漫/史诗奇幻/暗黑反转/治愈温馨/智斗谋略]中选择最接近的风格",
  "novelLength": "从[short/medium/long/epic]中估计对应篇幅",
  "plotSummary": "已发生的主要剧情摘要（150字内）",
  "currentSituation": "当前最新章节末尾的情境——主角在哪、在做什么、面临什么（80字内）",
  "nextDirection": "接下来最合理的剧情走向（50字内）",
  "estimatedChapters": "估算小说当前已有的大概章节数（数字）",
  "continuationIdeas": ["续写方向1（30字内）","续写方向2","续写方向3","续写方向4","续写方向5"]
}

只输出JSON，不要额外说明。盟友和反派各最多提取3个最重要的角色。

小说内容：
${textToAnalyze.slice(0, 12000)}`;

    const result = await callAI([
      { role: "system", content: "你是小说分析专家，善于从文本中提取结构化信息。严格输出JSON格式。" },
      { role: "user", content: prompt },
    ], 2000);

    try {
      const parsed = JSON.parse(result.replace(/```json\s*|```/g, "").trim());
      return Response.json(parsed);
    } catch {
      return Response.json({
        worldType: "fantasy",
        worldBackground: "未能解析，请手动填写",
        protagonist: { name: "未知", personality: "沉稳", ability: "未知", weakness: "未知" },
        allies: [],
        enemies: [],
        style: "热血战斗",
        novelLength: "long",
        plotSummary: "分析失败，请重试",
        currentSituation: "",
        nextDirection: "",
        estimatedChapters: 0,
        continuationIdeas: [],
        parseError: true,
      });
    }
  }

  
  // 15. 自主写作引擎：自动生成+审核+修正+循环
  if (mode === "auto_write") {
    const startChapter = chapterIndex || 0;
    const maxChapters = body.maxAutoChapters || 5;
    const results = [];
    let currentIndex = startChapter;
    let currentPrevSummary = previousChapterSummary || "";

    for (let i = 0; i < maxChapters; i++) {
      // 1. 生成章节
      const chapterPrompt = `你是一位网文作家。你的任务是严格按照下面的世界观权威设定写作。任何偏离设定的内容都是不合格的。请根据以下信息写出第${currentIndex+1}章正文。\n\n【世界观与设定】\n${worldBackground || worldType}\n主角：${protagonist.name}（性格${protagonist.personality || "复杂立体"}，能力${protagonist.ability || "在成长中"}，弱点${protagonist.weakness || "人性"}）\n${allies?.length ? "盟友：" + allies.map(a => `${a.name}(${a.relation}, 能力${a.ability})`).join("、") : ""}\n${enemies?.length ? "对手：" + enemies.map(e => `${e.name}(${e.relation}, 能力${e.ability})`).join("、") : ""}\n风格：${style}\n\n【本章】续写方向：${continuationHook || "顺承上文"}\n【上章摘要】${currentPrevSummary}\n\n【装备铁律】能力中含"剑"的角色用剑（绝不出现枪炮机械义肢），能力中含"枪"的角色用枪，能力中含"雷"的角色以雷电近身为主\n\n【写作要求】\n- 从上章结尾自然开始\n- 情节由角色性格推动\n- 对话贴合角色\n- 禁止AI套路词："空气中弥漫着" "他的眼中闪过" "嘴角勾起一抹" "就在这时"\n字数：900-1200字。输出正文后另起一行"【本章摘要】："加100字内摘要。`
      let chapterResult;
      try {
        chapterResult = await callAI([
          { role: "system", content: body.systemPrompt || "你是一个写小说的。你不是AI，你是一个有自己文风的人。" },
          { role: "user", content: chapterPrompt },
        ], 1800);
      } catch (err) { break; }

      const summaryMatch = chapterResult.match(/【本章摘要】：([sS]*)/);
      let chapSummary = summaryMatch ? summaryMatch[1].trim() : "";
      let chapContent = chapterResult.replace(/【本章摘要】：[sS]*/, "").trim();

      // 2. 兜底摘要
      if (!chapSummary && chapContent.length > 50) {
        chapSummary = chapContent.replace(/\\n/g, "").slice(-100).trim();
      }

      // 3. 自动审核
      let auditIssues = [];
      try {
        const auditResult = await callAI([
          { role: "system", content: "审核小说章节角色一致性，输出JSON: {overallScore,issues:[{severity,character,problem,fix}]}" },
          { role: "user", content: chapContent.slice(0, 2000) },
        ], 400);
        const parsed = JSON.parse(auditResult.replace(/`json|`/g, "").trim());
        auditIssues = parsed.issues || [];
      } catch {}

      // 4. 如果有严重问题，自动修正
      let fixed = false;
      if (auditIssues.filter(iss => iss.severity === "严重").length > 0) {
        try {
          const fixPrompt = `你是一位网文作家。请重写第${currentIndex+1}章正文，必须修正以下审核发现的问题：\n${auditIssues.filter(iss => iss.severity === "严重").map(iss => `- ${iss.character}：${iss.problem} → ${iss.fix}`).join("\\n")}\n\n【设定参考】世界观：${worldBackground || worldType} 主角：${protagonist.name}（能力${protagonist.ability}）风格：${style}\n【装备铁律】能力中含"剑"的角色用剑（绝不出现枪炮机械义肢），能力中含"枪"的角色用枪\n【上章摘要】${currentPrevSummary}\n\n请输出修正后的正文，另起一行"【本章摘要】："加摘要。`
          const fixResult = await callAI([
            { role: "system", content: "你是一个写小说的。严格按修正要求重写这一章，特别注意装备与武器一致性，能力中含\"剑\"的角色绝不出现枪炮机械义肢。" },
            { role: "user", content: fixPrompt },
          ], 1800);
          const fixSummaryMatch = fixResult.match(/【本章摘要】：([sS]*)/);
          chapContent = fixResult.replace(/【本章摘要】：[sS]*/, "").trim();
          if (fixSummaryMatch) chapSummary = fixSummaryMatch[1].trim();
          fixed = true;
        } catch {}
      }

      // 5. 保存结果
      currentPrevSummary = chapSummary || currentPrevSummary;
      results.push({ chapterIndex: currentIndex, content: chapContent, summary: chapSummary, fixed, auditIssues });
      currentIndex++;
    }

    return Response.json({ chapters: results, totalGenerated: results.length, nextChapterIndex: currentIndex });
  }

  
  
  // ===== 角色圣经 =====
  if (mode === "character_bible") {
    const allContent = body.chapterContents || [];
    const existing = body.existingBible || {};
    const prompt = "你是角色档案员。根据以下小说章节，为每个角色建立档案。JSON格式：{ characters: { 角色名: { personalitySnapshot, signatureLine, habits, secrets, relationships, recentChange, readerImpression } }, deathFlags, chemistryPairs }。章节：" + allContent.join("\n---\n") + " 现有：" + JSON.stringify(existing);
    const result = await callAI([{role:"system",content:"你是角色档案员。输出严格JSON。"},{role:"user",content:prompt}],2000);
    try { return Response.json(JSON.parse(result.replace(/`json|`/g,"").trim())); }
    catch { return Response.json({characters:{},deathFlags:[],chemistryPairs:[]}); }
  }

  // ===== 节奏分析 =====
  if (mode === "rhythm_analysis") {
    const contents = body.chapterContents || [];
    const prompt = "你是节奏分析师。分析以下章节。JSON：{ chapters:[{chapter,tension,type,oneLine,readerFeeling}], curve, problem, suggestion, fatigueIndex, nextChapterType }。内容：" + contents.map((t,i)=>"第"+(i+1)+"章："+t.substring(0,300)).join("\n");
    const result = await callAI([{role:"system",content:"你是节奏分析师。输出严格JSON。"},{role:"user",content:prompt}],1200);
    try { return Response.json(JSON.parse(result.replace(/`json|`/g,"").trim())); }
    catch { return Response.json({chapters:[],curve:"unknown",suggestion:"无法分析"}); }
  }

  // ===== 惊喜连接 =====
  if (mode === "plot_connect") {
    const threads = body.plotThreads || [];
    const chars = body.characterInfo || {};
    const prompt = "你是小说结构师。发现伏笔之间的隐藏关联。JSON：{ connections:[{threadA,threadB,connection,surpriseLevel,mergeIdea,impactOnCharacters}], orphanThreads, masterKey, newDirection }。伏笔：" + JSON.stringify(threads) + " 角色：" + JSON.stringify(chars);
    const result = await callAI([{role:"system",content:"你是小说结构师。输出严格JSON。"},{role:"user",content:prompt}],1500);
    try { return Response.json(JSON.parse(result.replace(/`json|`/g,"").trim())); }
    catch { return Response.json({connections:[],masterKey:"分析失败"}); }
  }


  // 16. 提取设定模式：AI分析已生成内容，返回更新后的设定
  if (mode === "extract_settings") {
    const chapterContent = body.chapterContent || "";
    const existingSettings = body.existingSettings || {};
    const prompt = `你是小说设定分析师。请从下面小说内容中提取新元素，输出严格JSON：
{
  "newCharacters": [{"name":"名字","personality":"性格","ability":"能力","weakness":"弱点","relation":"与主角关系"}],
  "newItems": [{"name":"道具/武器名","type":"类型","owner":"属于谁","effect":"效果"}],
  "newLocations": [{"name":"地点名","type":"类型","description":"描述"}],
  "powerSystemUpdates": "能力体系新发现",
  "worldRuleUpdates": "世界观新发现",
  "consistencyIssues": ["发现的不一致问题"]
}
已有设定：${JSON.stringify(existingSettings)}
内容：${chapterContent.slice(0, 4000)}`;
    const result = await callAI([
      { role: "system", content: "你是小说设定分析师。输出严格JSON。" },
      { role: "user", content: prompt },
    ], 1200);
    try {
      return Response.json(JSON.parse(result.replace(/```json|```/g, "").trim()));
    } catch {
      return Response.json({ newCharacters:[], newItems:[], newLocations:[], powerSystemUpdates:"", worldRuleUpdates:"", consistencyIssues:["解析失败"] });
    }
  }

  return Response.json({ error: `未知模式: ${mode}` }, { status: 400 });
} catch (err) {
  console.error("API route error:", err.message);
  return Response.json({ error: `AI 调用失败：${err.message}。请检查 API 密钥是否正确配置，或稍后重试。` }, { status: 500 });
}
}
