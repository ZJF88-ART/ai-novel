"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/* ===== 多语言 ===== */
const L = {
  zh: {
    title:"📖 AI Novel", export:"导出", import:"导入", applyFramework:"🔄 应用框架",
    worldSettings:"世界观设定", protagonist:"主角设定", allies:"正派 / 盟友", enemies:"反派 / 对手",
    styleTitle:"故事风格", novelLength:"📏 小说篇幅", storyTracker:"故事追踪", chapterAudit:"🔍 章节审核",
    economyLabel:"⚡ 省 Token 模式", aiPlatform:"🤖 AI 平台",
    randomProtagonist:"🎲 随机生成主角", randomTeam:"🎲 随机阵容", addChar:"+ 添加角色",
    generateOpening:"✨ 生成开篇点子", generating:"⏳ 生成中...",
    openingIdeas:"💡 开篇点子", genMore:"➕ 生成更多",
    select:"选择", selected:"✓ 已选", aiOptimize:"🤖 AI优化", adopt:"采用", aiSuggest:"🤖 AI优化推荐",
    genOutline:"📚 生成大纲 →", noOpening:"请先在右侧选择一个开篇点子",
    chapOutline:"📑 章节目录", chapters:"章", groups:"组",
    writeChap1:"✍️ 生成第一章", writeChap:"✍️ 生成本章", rewrite:"🔄 重写本章",
    saveOutline:"💾 保存到大纲", nextChapter:"➡️ 下一章", genNext:"⚡ 生成下一章",
    saved:"已保存正文", savedOk:"第{0}章已保存 ✓",
    importNovel:"📥 续写已有小说", marketResearch:"📊 网文市场深度调研",
    paste:"📝 粘贴文本", upload:"📂 上传文件", analyze:"🔍 AI 分析小说", analyzing:"⏳ AI 分析中...",
    syncFramework:"📋 同步到系统框架并开始续写",
    continuationIdeas:"✍️ 续写点子", genContinuation:"🔄 生成续写方向",
    refreshTracker:"🔄 刷新追踪", auditBtn:"🔍 审核当前章节角色一致性", auditing:"⏳ 审核中...",
    frameworkApplied:"✅ 系统框架已同步！",
    freeLimit:"免费额度", timesUsed:"今日已用", timesLeft:"剩余", limitReached:"今日免费次数用完，明天00:00重置。升级付费版无限使用。",
    upgradeSoon:"即将支持付费升级 →",
    copyDone:"已复制", dragHint:"可拖拽移动",
    collapse:"收起面板", expand:"展开面板",
    welcomeMsg1:"选择一个开篇点子后点击「生成大纲」，再点击「生成第一章」",
    welcomeMsg2:"选择续写方向后点击「生成本章」开始写作",
    welcomeMsg3:"请在左侧完成系统框架设定后，点击「生成开篇点子」",
    langSwitch:"English",
    shortLabel:"短篇", medLabel:"中篇", longLabel:"长篇", epicLabel:"超长篇",
    chShort:"~20章", chMed:"~40章", chLong:"~60章", chEpic:"~80章",
    volumeImpact:"（影响大纲章数）",
    frameworkTooltip:"根据当前框架重新生成开篇点子和大纲",
    importDesc:"粘贴或上传已有小说全文，AI 自动分析背景、角色、剧情并同步到左侧系统框架。",
    continuationHint:"点击「生成续写方向」获取本章续写灵感，AI 会结合上一章内容给出多个发展方向供你选择。",
    trackerHint:"生成几章后点击刷新，AI 会盘点角色状态、能力变化、关系走向和伏笔进度。不会写入正文，仅供防止角色串台。",
    marketHint:"点击按钮，AI 将从题材、平台、读者、变现等 8 个维度深度分析当前网文市场，并针对你的设定给出具体建议。",
    analysisResult:"📊 分析结果", worldTypeLabel:"世界观类型", styleLabel:"风格",
    protagonistLabel:"主角", estChapters:"估算章数", plotSummary:"剧情概要", currentSit:"当前情境",
    continuationPreview:"续写方向预览",
    savedChapter:"✅ 已保存正文",
    titlePlaceholder:"输入章节标题…", hookPlaceholder:"章节钩子/悬念…",
    refreshSuggest:"已写 {0} 章，建议刷新追踪",
    trackedChapters:"已追踪 {0} 章",
  },
  en: {
    title:"📖 AI Novel", export:"Export", import:"Import", applyFramework:"🔄 Apply Framework",
    worldSettings:"World Settings", protagonist:"Protagonist", allies:"Allies", enemies:"Enemies",
    styleTitle:"Story Style", novelLength:"📏 Novel Length", storyTracker:"Story Tracker", chapterAudit:"🔍 Chapter Audit",
    economyLabel:"⚡ Economy Mode", aiPlatform:"🤖 AI Platform",
    randomProtagonist:"🎲 Random Protagonist", randomTeam:"🎲 Random Team", addChar:"+ Add Character",
    generateOpening:"✨ Generate Opening Ideas", generating:"⏳ Generating...",
    openingIdeas:"💡 Opening Ideas", genMore:"➕ Generate More",
    select:"Select", selected:"✓ Selected", aiOptimize:"🤖 AI Optimize", adopt:"Adopt", aiSuggest:"🤖 AI Suggestions",
    genOutline:"📚 Generate Outline →", noOpening:"Please select an opening idea first",
    chapOutline:"📑 Chapter Outline", chapters:"chapters", groups:"groups",
    writeChap1:"✍️ Generate Chapter 1", writeChap:"✍️ Generate Chapter", rewrite:"🔄 Rewrite",
    saveOutline:"💾 Save to Outline", nextChapter:"➡️ Next Chapter", genNext:"⚡ Generate Next",
    saved:"Content saved", savedOk:"Chapter {0} saved ✓",
    importNovel:"📥 Continue Existing Novel", marketResearch:"📊 Web Novel Market Research",
    paste:"📝 Paste Text", upload:"📂 Upload File", analyze:"🔍 AI Analyze Novel", analyzing:"⏳ Analyzing...",
    syncFramework:"📋 Sync Framework & Start Writing",
    continuationIdeas:"✍️ Continuation Ideas", genContinuation:"🔄 Generate Ideas",
    refreshTracker:"🔄 Refresh Tracker", auditBtn:"🔍 Audit Character Consistency", auditing:"⏳ Auditing...",
    frameworkApplied:"✅ Framework synced!",
    freeLimit:"Free Quota", timesUsed:"Used today", timesLeft:"Remaining", limitReached:"Daily free limit reached. Resets at midnight. Upgrade to Premium for unlimited.",
    upgradeSoon:"Premium upgrade coming soon →",
    copyDone:"Copied", dragHint:"Drag to move",
    collapse:"Collapse Panel", expand:"Expand Panel",
    welcomeMsg1:"Select an opening idea, then click Generate Outline, then Generate Chapter 1",
    welcomeMsg2:"Pick a continuation direction, then click Generate Chapter",
    welcomeMsg3:"Set up your world on the left, then click Generate Opening Ideas",
    langSwitch:"中文",
    shortLabel:"Short", medLabel:"Medium", longLabel:"Long", epicLabel:"Epic",
    chShort:"~20 ch", chMed:"~40 ch", chLong:"~60 ch", chEpic:"~80 ch",
    volumeImpact:"(Affects outline chapter count)",
    frameworkTooltip:"Regenerate opening ideas and outline based on current framework settings",
    importDesc:"Paste or upload your existing novel. AI analyzes background, characters, and plot, then syncs to the framework.",
    continuationHint:"Click to generate ideas for this chapter. AI uses the previous chapter summary as context.",
    trackerHint:"After writing a few chapters, refresh to track character states, abilities, relationships, and plot threads. Not written into the novel.",
    marketHint:"Click to let AI analyze the current web novel market across 8 dimensions with recommendations tailored to your setting.",
    analysisResult:"📊 Analysis Results", worldTypeLabel:"World Type", styleLabel:"Style",
    protagonistLabel:"MC", estChapters:"Est. Chapters", plotSummary:"Plot Summary", currentSit:"Current Situation",
    continuationPreview:"Continuation Ideas",
    savedChapter:"✅ Chapter saved",
    titlePlaceholder:"Enter chapter title...", hookPlaceholder:"Chapter hook/suspense...",
    refreshSuggest:"{0} chapters written, suggest refreshing tracker",
    trackedChapters:"Tracked {0} chapters",
  },
};

function t(lang, key, ...args) {
  let text = (L[lang] && L[lang][key]) || L.zh[key] || key;
  args.forEach((a, i) => { text = text.replace(`{${i}}`, a); });
  return text;
}

/* ===== 免费额度管理 ===== */
function getUsageData() {
  try {
    const d = JSON.parse(localStorage.getItem("daily-usage") || "{}");
    const today = new Date().toDateString();
    if (d.date !== today) return { date: today, count: 0, maxFree: 3 };
    return { ...d, maxFree: d.maxFree || 3 };
  } catch { return { date: new Date().toDateString(), count: 0, maxFree: 3 }; }
}

function canGenerate() {
  const d = getUsageData();
  return d.count < d.maxFree;
}

function remainingGenerations() {
  const d = getUsageData();
  return Math.max(0, d.maxFree - d.count);
}

function incrementUsage() {
  const d = getUsageData();
  d.count++;
  localStorage.setItem("daily-usage", JSON.stringify(d));
}

/* ===== 预设数据 ===== */
const WORLD_TYPES = [
  { value: "fantasy", label: "西幻" },
  { value: "xianxia", label: "修仙" },
  { value: "modern", label: "现代" },
  { value: "apocalypse", label: "末世" },
];

const PERSONALITIES = ["热血", "冷酷", "腹黑", "天真", "温柔", "傲娇", "沉稳", "偏执", "洒脱", "阴郁", "狡黠", "正直", "善良", "懒散", "疯批", "懦弱", "毒舌", "忠犬"];
const STYLES = ["热血战斗", "轻松搞笑", "悬疑惊悚", "甜宠浪漫", "史诗奇幻", "暗黑反转", "治愈温馨", "智斗谋略"];

const ABILITIES = {
  fantasy:     ["剑术通神", "元素掌控", "龙骑士", "时间回溯", "治愈圣光", "暗影潜行", "读心术", "雷霆之体", "召唤亡灵", "变形术", "瞬间移动", "魔力吞噬"],
  xianxia:     ["御剑飞行", "丹道宗师", "阵法大师", "天眼通", "不死之身", "灵气操控", "剑意化形", "符箓精通", "雷劫淬体", "一气化三清", "元神出窍", "九转金身"],
  modern:      ["黑客技术", "格斗大师", "金融天才", "心理操控", "枪械精通", "易容术", "超忆症", "绝对音感", "极限体能", "社交女王"],
  apocalypse:  ["变异之力", "机械改造", "生存专家", "病毒免疫", "预知危险", "神速", "控火异能", "金属操控", "植物沟通", "空间折叠"],
};

const WEAKNESSES = {
  fantasy:     ["无法杀人", "月圆失控", "失忆", "诅咒束缚", "力量反噬", "怕水", "信任过度", "寿命有限", "魔力波动", "契约代价"],
  xianxia:     ["心魔缠身", "瓶颈难破", "正道追杀", "魔气侵蚀", "天劫将至", "寿元将尽", "道心不稳", "惧高", "灵根残缺", "血脉诅咒"],
  modern:      ["幽闭恐惧", "社交焦虑", "法律约束", "失眠", "信任障碍", "贫穷", "仇家太多", "依赖药物"],
  apocalypse:  ["变异失控", "能源依赖", "怕火", "旧伤复发", "辐射病", "幻觉", "饥饿", "机械故障"],
};

const MALE_NAMES = ["林夜", "苏寒", "陆星辰", "白墨", "叶枫", "秦长风", "萧尘", "顾青云", "沈浪", "云逸", "姬无命", "洛天", "慕白", "君无邪", "花千树", "百里屠苏"];
const FEMALE_NAMES = ["苏婉清", "叶灵儿", "柳如烟", "白浅浅", "云兮", "花千骨", "秦芷若", "林雪见", "沈清辞", "凤九歌", "唐若雪", "洛清尘", "顾倾城", "姬如月", "苏玖瑶", "慕晴"];

const ALLY_RELATIONS = ["朋友", "恋人", "部下", "上司", "青梅竹马", "师徒（主角为师）", "师徒（主角为徒）", "兄弟/姐妹", "护卫", "救命恩人", "暗恋对象", "未婚夫/妻"];
const ENEMY_RELATIONS = ["敌人", "宿敌", "背叛者", "情敌", "竞争对手", "灭族仇人", "昔日好友", "追杀者", "邪恶化身", "政敌", "情债"];

const NOVEL_LENGTHS = [
  { value: "short", label: "短篇", labelEn: "Short", hint: "~20章", hintEn: "~20 ch", chapters: 20 },
  { value: "medium", label: "中篇", labelEn: "Medium", hint: "~40章", hintEn: "~40 ch", chapters: 40 },
  { value: "long", label: "长篇", labelEn: "Long", hint: "~60章", hintEn: "~60 ch", chapters: 60 },
  { value: "epic", label: "超长篇", labelEn: "Epic", hint: "~80章", hintEn: "~80 ch", chapters: 80 },
];

const PROVIDER_OPTIONS = [
  { value: "deepseek", label: "DeepSeek (国内)" },
  { value: "zhipu", label: "智谱 GLM (国内)" },
  { value: "agnes", label: "Agnes AI (海外·免费)" },
];

const BASE_GROUP_SIZE = 20;
const MAX_OUTLINE_GROUPS = 20;

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function randomCharacter(worldType, gender) {
  const names = gender === "female" ? FEMALE_NAMES : MALE_NAMES;
  return { name: pick(names), personality: pick(PERSONALITIES), ability: pick(ABILITIES[worldType] || ABILITIES.fantasy), weakness: pick(WEAKNESSES[worldType] || WEAKNESSES.fantasy) };
}

function randomAlly(worldType) { return { ...randomCharacter(worldType, pick(["male", "female"])), relation: pick(ALLY_RELATIONS) }; }
function randomEnemy(worldType) { return { ...randomCharacter(worldType, pick(["male", "female"])), relation: pick(ENEMY_RELATIONS) }; }

function computeOutlineGroups(outline) {
  const total = outline.length;
  if (total === 0) return [];
  let groupSize = BASE_GROUP_SIZE;
  if (total > MAX_OUTLINE_GROUPS * BASE_GROUP_SIZE) groupSize = Math.ceil(total / MAX_OUTLINE_GROUPS);
  const groups = [];
  for (let i = 0; i < total; i += groupSize) groups.push({ start: i, end: Math.min(i + groupSize, total), chapters: outline.slice(i, i + groupSize) });
  return groups;
}

/* ===== 组件 ===== */
function CollapsibleCard({ title, icon, defaultOpen = true, children, badge }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50/60 transition-colors">
        <span className="flex items-center gap-2 font-semibold text-gray-800 text-[15px]">
          {icon} {title}
          {badge !== undefined && badge > 0 && <span className="ml-1 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{badge}</span>}
        </span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-5 pb-5 space-y-4">{children}</div>}
    </div>
  );
}

function SmartField({ value, onChange, presets, placeholder }) {
  const [showDropdown, setShowDropdown] = useState(false);
  return (
    <div className="relative flex gap-1.5 items-center">
      <input className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} onFocus={() => setShowDropdown(true)} onBlur={() => setTimeout(() => setShowDropdown(false), 150)} />
      <button type="button" title="随机" onClick={() => onChange(pick(presets))} className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-500 transition-colors text-sm">🎲</button>
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-40 overflow-auto grid grid-cols-2 gap-0.5 p-1">
          {presets.map((p) => (<button key={p} type="button" className="text-left px-2 py-1.5 text-xs rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors" onMouseDown={(e) => { e.preventDefault(); onChange(p); setShowDropdown(false); }}>{p}</button>))}
        </div>
      )}
    </div>
  );
}

function OutlineGroups({ outline, currentChapterIndex, onSelect, openGroups, toggleGroup, lang }) {
  const groups = computeOutlineGroups(outline);
  const copyOutlineEntry = (e, ch, idx) => { e.stopPropagation(); navigator.clipboard.writeText(`Ch${idx + 1}: ${ch.title}\nHook: ${ch.hook}${ch.summary ? `\nSummary: ${ch.summary}` : ""}`).then(() => {}); };
  return (
    <div className="space-y-2">
      {groups.map((g, gi) => {
        const groupKey = `group-${gi}`;
        const isOpen = openGroups[groupKey] !== false;
        const groupLabel = g.chapters.length === 1 ? `${t(lang, "chapters")} ${g.start + 1}` : `${t(lang, "chapters")} ${g.start + 1}-${g.end}`;
        return (
          <div key={groupKey} className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
            <button type="button" onClick={() => toggleGroup(groupKey)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100 transition-colors">
              <span className="text-sm font-semibold text-gray-700">{groupLabel} <span className="ml-2 text-xs text-gray-400 font-normal">{g.chapters.length} {lang === "en" ? "ch" : "章"}</span></span>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isOpen && (
              <div className="px-3 pb-3 flex flex-wrap gap-2">
                {g.chapters.map((ch, i) => {
                  const absIdx = g.start + i;
                  return (
                    <div key={absIdx} className="group relative inline-flex items-center gap-1">
                      <button onClick={() => onSelect(absIdx)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${currentChapterIndex === absIdx ? "bg-blue-600 text-white shadow-sm" : "bg-white text-gray-600 hover:bg-gray-200 border border-gray-200"}`}>{`${lang === "en" ? "Ch" : "第"}${absIdx + 1}${lang === "en" ? "" : "章"}：${ch.title}`}</button>
                      <button onClick={(e) => copyOutlineEntry(e, ch, absIdx)} title={t(lang, "copyDone")} className="opacity-0 group-hover:opacity-100 shrink-0 w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all text-[10px]">📋</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ===== 主组件 ===== */
export default function Home() {
  const [lang, setLang] = useState("zh");
  const T = useCallback((key, ...args) => t(lang, key, ...args), [lang]);

  const [worldType, setWorldType] = useState("fantasy");
  const [worldBackground, setWorldBackground] = useState("");
  const [protagonist, setProtagonist] = useState({ name: "", personality: "", ability: "", weakness: "" });
  const [allies, setAllies] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [style, setStyle] = useState("热血战斗");
  const [customStyle, setCustomStyle] = useState("");
  const [economyMode, setEconomyMode] = useState(false);
  const [provider, setProvider] = useState("deepseek");
  const [novelLength, setNovelLength] = useState("long");

  const [openingIdeas, setOpeningIdeas] = useState([]);
  const [selectedOpening, setSelectedOpening] = useState("");
  const [outline, setOutline] = useState([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [chapterContent, setChapterContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [refinedLoading, setRefinedLoading] = useState(false);
  const [refiningIndex, setRefiningIndex] = useState(null);
  const [applyFrameworkLoading, setApplyFrameworkLoading] = useState(false);

  const [continuationIdeas, setContinuationIdeas] = useState([]);
  const [continuationLoading, setContinuationLoading] = useState(false);
  const [selectedContinuation, setSelectedContinuation] = useState("");

  const [importPanelOpen, setImportPanelOpen] = useState(false);
  const [importNovelText, setImportNovelText] = useState("");
  const [importMode, setImportMode] = useState("paste");
  const [importAnalyzing, setImportAnalyzing] = useState(false);
  const [importAnalysis, setImportAnalysis] = useState(null);

  const [outlineOpenGroups, setOutlineOpenGroups] = useState({});
  const [marketData, setMarketData] = useState(null);
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketTab, setMarketTab] = useState(0);
  const [marketCollapsed, setMarketCollapsed] = useState(false);
  const [trackerData, setTrackerData] = useState(null);
  const [trackerLoading, setTrackerLoading] = useState(false);
  const [auditData, setAuditData] = useState(null);
  const [auditLoading, setAuditLoading] = useState(false);

  const [btnPos, setBtnPos] = useState({ x: 16, y: 16 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });
  const hasMoved = useRef(false);

  const [usage, setUsage] = useState(getUsageData());

  /* ===== 拖拽 ===== */
  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e) => {
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      if (Math.abs(cx - dragStart.current.x) > 3 || Math.abs(cy - dragStart.current.y) > 3) hasMoved.current = true;
      setBtnPos({ x: Math.max(0, Math.min(window.innerWidth - 48, cx - dragStart.current.offsetX)), y: Math.max(0, Math.min(window.innerHeight - 48, cy - dragStart.current.offsetY)) });
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: true }); window.addEventListener("touchend", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); window.removeEventListener("touchmove", onMove); window.removeEventListener("touchend", onUp); };
  }, [isDragging]);

  /* ===== 自动保存 ===== */
  useEffect(() => {
    const data = { worldType, worldBackground, protagonist, allies, enemies, style, customStyle, economyMode, provider, novelLength, trackerData, openingIdeas, selectedOpening, outline, currentChapterIndex, chapterContent, btnPos, lang };
    localStorage.setItem("ai-novel-autosave", JSON.stringify(data));
  }, [worldType, worldBackground, protagonist, allies, enemies, style, customStyle, economyMode, provider, novelLength, trackerData, openingIdeas, selectedOpening, outline, currentChapterIndex, chapterContent, btnPos, lang]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ai-novel-autosave");
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.worldType) setWorldType(d.worldType);
      if (d.worldBackground) setWorldBackground(d.worldBackground);
      if (d.protagonist) setProtagonist(d.protagonist);
      if (d.allies) setAllies(d.allies);
      if (d.enemies) setEnemies(d.enemies);
      if (d.style) setStyle(d.style);
      if (d.customStyle) setCustomStyle(d.customStyle);
      if (d.economyMode !== undefined) setEconomyMode(d.economyMode);
      if (d.provider) setProvider(d.provider);
      if (d.novelLength) setNovelLength(d.novelLength);
      if (d.trackerData) setTrackerData(d.trackerData);
      if (d.openingIdeas) setOpeningIdeas(d.openingIdeas);
      if (d.selectedOpening) setSelectedOpening(d.selectedOpening);
      if (d.outline) setOutline(d.outline);
      if (d.currentChapterIndex !== undefined) setCurrentChapterIndex(d.currentChapterIndex);
      if (d.chapterContent) setChapterContent(d.chapterContent);
      if (d.btnPos) setBtnPos(d.btnPos);
      if (d.lang) setLang(d.lang);
    } catch {}
  }, []);

  const exportProject = () => {
    const data = { worldType, worldBackground, protagonist, allies, enemies, style, customStyle, economyMode, provider, novelLength, trackerData, openingIdeas, selectedOpening, outline, currentChapterIndex, chapterContent, lang };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `novel_${Date.now()}.json`; a.click(); URL.revokeObjectURL(url);
  };

  const importProject = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const d = JSON.parse(ev.target.result);
        if (d.worldType) setWorldType(d.worldType);
        if (d.worldBackground) setWorldBackground(d.worldBackground);
        if (d.protagonist) setProtagonist(d.protagonist);
        if (d.allies) setAllies(d.allies);
        if (d.enemies) setEnemies(d.enemies);
        if (d.style) setStyle(d.style);
        if (d.customStyle) setCustomStyle(d.customStyle);
        if (d.economyMode !== undefined) setEconomyMode(d.economyMode);
        if (d.provider) setProvider(d.provider);
        if (d.novelLength) setNovelLength(d.novelLength);
        if (d.trackerData) setTrackerData(d.trackerData);
        if (d.openingIdeas) setOpeningIdeas(d.openingIdeas);
        if (d.selectedOpening) setSelectedOpening(d.selectedOpening);
        if (d.outline) setOutline(d.outline);
        if (d.currentChapterIndex !== undefined) setCurrentChapterIndex(d.currentChapterIndex);
        if (d.chapterContent) setChapterContent(d.chapterContent);
        if (d.lang) setLang(d.lang);
        alert(lang === "en" ? "Import successful!" : "项目导入成功！");
      } catch { alert(lang === "en" ? "Invalid file format" : "文件解析失败"); }
    };
    reader.readAsText(file);
  };

  /* ===== API 调用（含免费额度检查） ===== */
  const callAPI = async (body) => {
    if (!canGenerate()) { alert(T("limitReached")); return null; }
    setLoading(true);
    try {
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      incrementUsage();
      setUsage(getUsageData());
      return data;
    } catch (err) { alert("Error: " + err.message); return null; }
    finally { setLoading(false); }
  };

  const generateOpening = async () => {
    const data = await callAPI({ mode: "opening", worldType, worldBackground, protagonist, allies, enemies, style: customStyle || style, economyMode, provider });
    if (data?.ideas) setOpeningIdeas(data.ideas);
  };

  const generateMoreOpenings = async () => {
    setRefinedLoading(true);
    try {
      if (!canGenerate()) { alert(T("limitReached")); return; }
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "opening", worldType, worldBackground, protagonist, allies, enemies, style: customStyle || style, economyMode, provider, previousIdeas: openingIdeas.map(i => typeof i === "string" ? i : i.idea) }) });
      const data = await res.json();
      if (data?.ideas) { setOpeningIdeas([...openingIdeas, ...data.ideas]); incrementUsage(); setUsage(getUsageData()); }
    } catch (err) { alert("生成更多失败: " + err.message); }
    finally { setRefinedLoading(false); }
  };

  const refineOpeningIdea = async (index) => {
    setRefiningIndex(index); setRefinedLoading(true);
    try {
      if (!canGenerate()) { alert(T("limitReached")); return; }
      const ideaText = typeof openingIdeas[index] === "string" ? openingIdeas[index] : openingIdeas[index].idea;
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "opening", worldType, worldBackground, protagonist, allies, enemies, style: customStyle || style, economyMode, provider, previousIdeas: [{ idea: ideaText }], count: 3 }) });
      const data = await res.json();
      if (data?.ideas?.length > 0) { const ni = [...openingIdeas]; ni[index] = { ...ni[index], refined: data.ideas }; setOpeningIdeas(ni); incrementUsage(); setUsage(getUsageData()); }
    } catch (err) { alert("优化失败: " + err.message); }
    finally { setRefinedLoading(false); setRefiningIndex(null); }
  };

  const acceptRefinedIdea = (pi, ri) => { const ni = [...openingIdeas]; const r = ni[pi].refined[ri]; ni[pi] = { idea: r.idea || r, highlight: r.highlight || "" }; setOpeningIdeas(ni); };
  const updateOpeningIdea = (index, nt) => { const ni = [...openingIdeas]; ni[index] = { ...ni[index], idea: nt }; setOpeningIdeas(ni); };

  const applyFramework = async () => {
    setApplyFrameworkLoading(true); setOpeningIdeas([]); setSelectedOpening(""); setOutline([]); setCurrentChapterIndex(0); setChapterContent(""); setContinuationIdeas([]); setSelectedContinuation(""); setAuditData(null);
    try { const data = await callAPI({ mode: "opening", worldType, worldBackground, protagonist, allies, enemies, style: customStyle || style, economyMode, provider }); if (data?.ideas) setOpeningIdeas(data.ideas); }
    catch (err) { alert("应用框架失败: " + err.message); }
    finally { setApplyFrameworkLoading(false); }
  };

  const handleFileUploadForImport = (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = (ev) => setImportNovelText(ev.target.result); r.readAsText(f); };

  const analyzeImportedNovel = async () => {
    if (!importNovelText.trim()) { alert(lang === "en" ? "Please paste or upload novel content first" : "请先粘贴或上传小说内容"); return; }
    setImportAnalyzing(true); setImportAnalysis(null);
    try {
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "analyze_novel", novelText: importNovelText, provider }) });
      const data = await res.json(); if (data.error) throw new Error(data.error); if (data.parseError) alert(lang === "en" ? "Partial parse failure, please verify results" : "AI 分析部分失败，请检查结果"); setImportAnalysis(data);
    } catch (err) { alert((lang === "en" ? "Analysis failed: " : "分析失败: ") + err.message); }
    finally { setImportAnalyzing(false); }
  };

  const applyImportAnalysis = () => {
    if (!importAnalysis) return; const a = importAnalysis;
    if (a.worldType) setWorldType(a.worldType);
    if (a.worldBackground) setWorldBackground(a.worldBackground);
    if (a.protagonist?.name) setProtagonist({ name: a.protagonist.name || "", personality: a.protagonist.personality || "", ability: a.protagonist.ability || "", weakness: a.protagonist.weakness || "" });
    if (a.allies?.length > 0) setAllies(a.allies.slice(0, 6));
    if (a.enemies?.length > 0) setEnemies(a.enemies.slice(0, 6));
    if (a.style) { if (STYLES.includes(a.style)) { setStyle(a.style); setCustomStyle(""); } else setCustomStyle(a.style); }
    if (a.novelLength) setNovelLength(a.novelLength);
    const ideas = (a.continuationIdeas || []).length > 0 ? a.continuationIdeas.map(idea => ({ idea, highlight: "AI推荐" })) : [{ idea: "Continue from analysis", highlight: "" }];
    setOpeningIdeas(ideas); setSelectedOpening(ideas[0]?.idea || ""); setCurrentChapterIndex(0); setChapterContent("");
    const estCh = Math.min(a.estimatedChapters || 20, 80);
    setOutline(Array.from({ length: estCh }, (_, i) => ({ title: `${lang === "en" ? "Ch" : "第"}${i + 1}${lang === "en" ? "" : "章"}`, hook: i === estCh - 1 ? (a.currentSituation || "") : "", summary: "" })));
    setOutlineOpenGroups({});
    setTrackerData({ _updatedAt: Date.now(), _updatedChapter: a.estimatedChapters || estCh, characters: [
      { role: lang === "en" ? "MC" : "主角", name: a.protagonist?.name || "MC", currentStatus: a.currentSituation || "", abilityProgression: a.protagonist?.ability, personalityArc: a.protagonist?.personality },
      ...(a.allies || []).map(al => ({ role: lang === "en" ? "Ally" : "正派", name: al.name, currentStatus: "Active", abilityProgression: al.ability, keyRelationships: [{ with: a.protagonist?.name || "MC", status: al.relation }] })),
      ...(a.enemies || []).map(en => ({ role: lang === "en" ? "Enemy" : "反派", name: en.name, currentStatus: "Active", abilityProgression: en.ability, keyRelationships: [{ with: a.protagonist?.name || "MC", status: en.relation }] })),
    ], plotThreads: [], worldChanges: [a.worldBackground || ""], nextChapterTips: a.nextDirection || "" });
    setImportAnalysis(null); setImportNovelText(""); setImportMode("paste"); setImportPanelOpen(false);
    alert(T("frameworkApplied") + "\n\n" + (a.plotSummary || "").slice(0, 80) + "...");
  };

  const generateOutline = async () => { if (!selectedOpening) { alert(T("noOpening")); return; } const data = await callAPI({ mode: "outline", worldType, worldBackground, protagonist, allies, enemies, style: customStyle || style, openingHook: selectedOpening, economyMode, provider, novelLength }); if (data?.outline) { setOutline(data.outline); setCurrentChapterIndex(0); setChapterContent(""); setOutlineOpenGroups({}); } };

  const generateChapter = async (idx) => {
    let o = [...outline]; while (idx >= o.length) o.push({ title: `${lang === "en" ? "Ch " : "第"}${o.length + 1}${lang === "en" ? "" : "章"}`, hook: lang === "en" ? "New chapter" : "新篇章开启", summary: "" });
    const prev = idx > 0 ? (o[idx - 1]?.summary || "") : "";
    const data = await callAPI({ mode: "chapter", worldType, worldBackground, protagonist, allies, enemies, style: customStyle || style, outline: o, chapterIndex: idx, previousChapterSummary: prev, economyMode, provider, continuationHook: selectedContinuation || "" });
    if (data?.content) { setChapterContent(data.content); setCurrentChapterIndex(idx); o[idx] = { ...o[idx], summary: data.summary || "" }; setOutline(o); setContinuationIdeas([]); setSelectedContinuation(""); const sd = { worldType, worldBackground, protagonist, allies, enemies, style, customStyle, economyMode, provider, novelLength, openingIdeas, selectedOpening, outline: o, currentChapterIndex: idx, chapterContent: data.content }; localStorage.setItem("ai-novel-autosave", JSON.stringify(sd)); }
  };

  const saveChapter = () => {
    if (!chapterContent) return; const o = [...outline];
    if (!o[currentChapterIndex]) o[currentChapterIndex] = { title: `${lang === "en" ? "Ch " : "第"}${currentChapterIndex + 1}${lang === "en" ? "" : "章"}`, hook: "", summary: "" };
    o[currentChapterIndex] = { ...o[currentChapterIndex], content: chapterContent, summary: o[currentChapterIndex].summary || chapterContent.slice(0, 80) }; setOutline(o);
    localStorage.setItem("ai-novel-autosave", JSON.stringify({ worldType, worldBackground, protagonist, allies, enemies, style, customStyle, economyMode, provider, novelLength, openingIdeas, selectedOpening, outline: o, currentChapterIndex, chapterContent }));
    alert(T("savedOk", currentChapterIndex + 1));
  };

  const fetchContinuationIdeas = async (chapterIdx) => {
    const idx = chapterIdx !== undefined ? chapterIdx : currentChapterIndex;
    setContinuationLoading(true); setContinuationIdeas([]); setSelectedContinuation("");
    try {
      if (!canGenerate()) { alert(T("limitReached")); setContinuationLoading(false); return; }
      const prevSummary = idx > 0 ? (outline[idx - 1]?.summary || "") : "";
      const chapterTitle = outline[idx]?.title || `${lang === "en" ? "Ch " : "第"}${idx + 1}${lang === "en" ? "" : "章"}`;
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "continuation", worldType, worldBackground, protagonist, allies, enemies, style: customStyle || style, economyMode, provider, chapterIndex: idx, chapterTitle, previousSummary: prevSummary, novelLength }) });
      const data = await res.json(); if (data?.ideas) { setContinuationIdeas(data.ideas); incrementUsage(); setUsage(getUsageData()); }
    } catch (err) {}
    finally { setContinuationLoading(false); }
  };

  const goToNextChapter = () => { const n = currentChapterIndex + 1; setCurrentChapterIndex(n); setChapterContent(""); setAuditData(null); fetchContinuationIdeas(n); };

  const addAlly = () => setAllies([...allies, { name: "", personality: "", ability: "", weakness: "", relation: "朋友" }]);
  const addEnemy = () => setEnemies([...enemies, { name: "", personality: "", ability: "", weakness: "", relation: "敌人" }]);
  const updateChar = (list, setList, idx, field, val) => { const n = [...list]; n[idx][field] = val; setList(n); };
  const removeChar = (list, setList, idx) => setList(list.filter((_, i) => i !== idx));
  const randomAllyTeam = () => setAllies(Array.from({ length: 3 }, () => randomAlly(worldType)));
  const randomEnemyTeam = () => setEnemies(Array.from({ length: 3 }, () => randomEnemy(worldType)));
  const randomProtagonist = () => setProtagonist(randomCharacter(worldType, pick(["male", "female"])));

  const fetchMarketResearch = async () => { setMarketLoading(true); try { const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "market_research", worldType, style: customStyle || style, worldBackground, provider }) }); const data = await res.json(); if (data.error) throw new Error(data.error); setMarketData(data); setMarketCollapsed(false); } catch (err) { alert("调研失败: " + err.message); } finally { setMarketLoading(false); } };

  const fetchStoryTracker = async () => { setTrackerLoading(true); try { const chapterSummaries = outline.map((ch) => ch.summary || "").filter(Boolean); const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "story_tracker", worldType, worldBackground, protagonist, allies, enemies, outline, chapterSummaries, provider }) }); const data = await res.json(); if (data.error) throw new Error(data.error); data._updatedAt = Date.now(); data._updatedChapter = chapterSummaries.length; setTrackerData(data); } catch (err) { alert("追踪失败: " + err.message); } finally { setTrackerLoading(false); } };

  const auditChapter = async () => { if (!chapterContent) { alert(lang === "en" ? "Generate chapter content first" : "请先生成章节内容"); return; } setAuditLoading(true); try { const chars = [{ name: protagonist.name, role: lang === "en" ? "MC" : "主角", personality: protagonist.personality, ability: protagonist.ability, weakness: protagonist.weakness }, ...allies.map(a => ({ name: a.name, role: lang === "en" ? "Ally" : "正派/盟友", personality: a.personality, ability: a.ability, weakness: a.weakness })), ...enemies.map(e => ({ name: e.name, role: lang === "en" ? "Enemy" : "反派/对手", personality: e.personality, ability: e.ability, weakness: e.weakness }))].filter(c => c.name); const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "audit_chapter", chapterContent, characters: chars, provider }) }); const data = await res.json(); if (data.error) throw new Error(data.error); data._auditChapter = currentChapterIndex; setAuditData(data); } catch (err) { alert("审核失败: " + err.message); } finally { setAuditLoading(false); } };

  const chaptersWithContent = outline.filter((ch) => ch.summary).length;
  const shouldRefreshTracker = chaptersWithContent > 0 && chaptersWithContent % 3 === 0 && (!trackerData || trackerData._updatedChapter !== chaptersWithContent);
  const activeStyle = customStyle || style;
  const showOpeningIdeas = openingIdeas.length > 0 && currentChapterIndex === 0 && !chapterContent;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 可拖拽面板切换按钮 */}
      <button
        style={{ left: btnPos.x, top: btnPos.y }}
        onMouseDown={(e) => { dragStart.current = { x: e.clientX, y: e.clientY, offsetX: e.clientX - btnPos.x, offsetY: e.clientY - btnPos.y }; hasMoved.current = false; setIsDragging(true); }}
        onTouchStart={(e) => { dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, offsetX: e.touches[0].clientX - btnPos.x, offsetY: e.touches[0].clientY - btnPos.y }; hasMoved.current = false; setIsDragging(true); }}
        onClick={() => { if (!hasMoved.current) setLeftPanelOpen(!leftPanelOpen); }}
        className="fixed z-50 w-10 h-10 rounded-xl bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-grab active:cursor-grabbing select-none"
        title={leftPanelOpen ? T("collapse") : T("expand")}
      >
        {leftPanelOpen ? "◀" : "☰"}
      </button>

      {leftPanelOpen && <div onClick={() => setLeftPanelOpen(false)} className="fixed inset-0 bg-black/30 z-30 lg:hidden" />}

      {/* ========== 左侧系统框架 ========== */}
      <aside className={`fixed inset-y-0 left-0 z-40 bg-gray-50 transform transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none ${leftPanelOpen ? "translate-x-0" : "-translate-x-full"} w-[420px] max-w-[85vw]`}>
        <div className="h-full overflow-y-auto p-5 pt-16 space-y-1">
          {/* 头部 + 语言切换 + 额度 */}
          <div className="flex items-center justify-between mb-1 px-1 flex-wrap gap-2">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">{T("title")}</h1>
            <div className="flex gap-1 items-center">
              <button onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="text-xs px-2 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 transition-colors text-gray-600" title={T("langSwitch")}>
                🌐 {T("langSwitch")}
              </button>
              <button onClick={applyFramework} disabled={applyFrameworkLoading} className="text-xs px-2 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 transition-all font-medium" title={T("frameworkTooltip")}>
                {applyFrameworkLoading ? "⏳" : T("applyFramework")}
              </button>
              <button onClick={exportProject} className="text-xs px-2 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 transition-colors text-gray-600">{T("export")}</button>
              <label className="text-xs px-2 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 transition-colors text-gray-600 cursor-pointer">{T("import")}<input type="file" accept=".json" onChange={importProject} className="hidden" /></label>
            </div>
          </div>

          {/* 免费额度显示 */}
          <div className={`px-1 py-1.5 rounded-lg text-xs flex items-center justify-between ${remainingGenerations() > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
            <span>🎯 {T("freeLimit")}：{T("timesUsed")} {usage.count}/{usage.maxFree}，{T("timesLeft")} {remainingGenerations()}</span>
            <span className="text-gray-400">{T("upgradeSoon")}</span>
          </div>

          {/* 世界观 */}
          <CollapsibleCard title={T("worldSettings")} icon="🌍">
            <div className="flex flex-wrap gap-2">
              {WORLD_TYPES.map((t) => (<button key={t.value} type="button" onClick={() => setWorldType(t.value)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${worldType === t.value ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{t.label}</button>))}
            </div>
            <textarea className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none" rows={3} placeholder={lang === "en" ? "Describe your world (best under 100 words)..." : "描述你的世界观（100字以内最佳）…"} value={worldBackground} onChange={(e) => setWorldBackground(e.target.value)} />
          </CollapsibleCard>

          {/* 主角 */}
          <CollapsibleCard title={T("protagonist")} icon="🎭">
            <button type="button" onClick={randomProtagonist} className="w-full mb-3 text-xs py-2 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 text-blue-700 hover:from-blue-100 hover:to-purple-100 transition-all font-medium">{T("randomProtagonist")}</button>
            <div className="grid grid-cols-2 gap-3">
              {["name","personality","ability","weakness"].map((k) => (
                <div key={k}><label className="text-xs text-gray-400 font-medium mb-1 block">{k === "name" ? (lang === "en" ? "Name" : "姓名") : k === "personality" ? (lang === "en" ? "Personality" : "性格") : k === "ability" ? (lang === "en" ? "Ability" : "能力") : (lang === "en" ? "Weakness" : "弱点")}</label>
                {k === "name" ? <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all" placeholder={lang === "en" ? "Name" : "主角姓名"} value={protagonist.name} onChange={(e) => setProtagonist({ ...protagonist, name: e.target.value })} />
                : <SmartField value={protagonist[k]} onChange={(v) => setProtagonist({ ...protagonist, [k]: v })} presets={k === "personality" ? PERSONALITIES : k === "ability" ? (ABILITIES[worldType] || ABILITIES.fantasy) : (WEAKNESSES[worldType] || WEAKNESSES.fantasy)} placeholder={k === "personality" ? (lang === "en" ? "Personality" : "性格") : k === "ability" ? (lang === "en" ? "Ability" : "能力") : (lang === "en" ? "Weakness" : "弱点")} />}
                </div>
              ))}
            </div>
          </CollapsibleCard>

          {/* 正派 */}
          <CollapsibleCard title={T("allies")} icon="🛡️" badge={allies.length}>
            <div className="flex gap-2 mb-3">
              <button type="button" onClick={addAlly} className="flex-1 text-xs py-2 rounded-xl bg-white border border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all">{T("addChar")}</button>
              <button type="button" onClick={randomAllyTeam} className="flex-1 text-xs py-2 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 hover:from-green-100 hover:to-emerald-100 transition-all font-medium">{T("randomTeam")}</button>
            </div>
            <div className="space-y-3">
              {allies.map((a, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100 relative">
                  <button type="button" onClick={() => removeChar(allies, setAllies, i)} className="absolute top-2 right-3 text-gray-300 hover:text-red-400 text-sm transition-colors">✕</button>
                  <div className="grid grid-cols-2 gap-2">
                    <input className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm bg-white focus:border-blue-400 outline-none transition-all" placeholder={lang === "en" ? "Name" : "名字"} value={a.name} onChange={(e) => updateChar(allies, setAllies, i, "name", e.target.value)} />
                    <select className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm bg-white focus:border-blue-400 outline-none transition-all text-gray-600" value={a.relation} onChange={(e) => updateChar(allies, setAllies, i, "relation", e.target.value)}>{ALLY_RELATIONS.map((r) => <option key={r} value={r}>{r}</option>)}</select>
                    <SmartField value={a.personality || ""} onChange={(v) => updateChar(allies, setAllies, i, "personality", v)} presets={PERSONALITIES} placeholder={lang === "en" ? "Personality" : "性格"} />
                    <SmartField value={a.ability || ""} onChange={(v) => updateChar(allies, setAllies, i, "ability", v)} presets={ABILITIES[worldType] || ABILITIES.fantasy} placeholder={lang === "en" ? "Ability" : "能力"} />
                    <SmartField value={a.weakness || ""} onChange={(v) => updateChar(allies, setAllies, i, "weakness", v)} presets={WEAKNESSES[worldType] || WEAKNESSES.fantasy} placeholder={lang === "en" ? "Weakness" : "弱点"} />
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleCard>

          {/* 反派 */}
          <CollapsibleCard title={T("enemies")} icon="👹" badge={enemies.length}>
            <div className="flex gap-2 mb-3">
              <button type="button" onClick={addEnemy} className="flex-1 text-xs py-2 rounded-xl bg-white border border-dashed border-gray-300 text-gray-500 hover:border-red-400 hover:text-red-600 transition-all">{T("addChar")}</button>
              <button type="button" onClick={randomEnemyTeam} className="flex-1 text-xs py-2 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 text-red-700 hover:from-red-100 hover:to-orange-100 transition-all font-medium">{T("randomTeam")}</button>
            </div>
            <div className="space-y-3">
              {enemies.map((e, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100 relative">
                  <button type="button" onClick={() => removeChar(enemies, setEnemies, i)} className="absolute top-2 right-3 text-gray-300 hover:text-red-400 text-sm transition-colors">✕</button>
                  <div className="grid grid-cols-2 gap-2">
                    <input className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm bg-white focus:border-blue-400 outline-none transition-all" placeholder={lang === "en" ? "Name" : "名字"} value={e.name} onChange={(ev) => updateChar(enemies, setEnemies, i, "name", ev.target.value)} />
                    <select className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm bg-white focus:border-blue-400 outline-none transition-all text-gray-600" value={e.relation} onChange={(ev) => updateChar(enemies, setEnemies, i, "relation", ev.target.value)}>{ENEMY_RELATIONS.map((r) => <option key={r} value={r}>{r}</option>)}</select>
                    <SmartField value={e.personality || ""} onChange={(v) => updateChar(enemies, setEnemies, i, "personality", v)} presets={PERSONALITIES} placeholder={lang === "en" ? "Personality" : "性格"} />
                    <SmartField value={e.ability || ""} onChange={(v) => updateChar(enemies, setEnemies, i, "ability", v)} presets={ABILITIES[worldType] || ABILITIES.fantasy} placeholder={lang === "en" ? "Ability" : "能力"} />
                    <SmartField value={e.weakness || ""} onChange={(v) => updateChar(enemies, setEnemies, i, "weakness", v)} presets={WEAKNESSES[worldType] || WEAKNESSES.fantasy} placeholder={lang === "en" ? "Weakness" : "弱点"} />
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleCard>

          {/* 风格 + 篇幅 */}
          <CollapsibleCard title={T("styleTitle")} icon="🎨">
            <div className="flex flex-wrap gap-2 mb-3">
              {STYLES.map((s) => (<button key={s} type="button" onClick={() => { setStyle(s); setCustomStyle(""); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeStyle === s ? "bg-purple-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{s}</button>))}
            </div>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all" placeholder={lang === "en" ? "Or enter custom style..." : "或输入自定义风格..."} value={customStyle} onChange={(e) => setCustomStyle(e.target.value)} />
            <div className="mt-3">
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">{T("novelLength")} {T("volumeImpact")}</label>
              <div className="flex flex-wrap gap-2">
                {NOVEL_LENGTHS.map((l) => (<button key={l.value} type="button" onClick={() => setNovelLength(l.value)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${novelLength === l.value ? "bg-indigo-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{lang === "en" ? l.labelEn : l.label} <span className="ml-1 opacity-70">{lang === "en" ? l.hintEn : l.hint}</span></button>))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-500 mt-3 cursor-pointer"><input type="checkbox" checked={economyMode} onChange={(e) => setEconomyMode(e.target.checked)} className="rounded" /> {T("economyLabel")}</label>
            <div className="flex items-center gap-2 mt-3 text-sm">
              <span className="text-gray-500">{T("aiPlatform")}</span>
              <select value={provider} onChange={(e) => setProvider(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:border-blue-400 outline-none transition-all flex-1">
                {PROVIDER_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </CollapsibleCard>

          {/* 故事追踪 */}
          <CollapsibleCard title={T("storyTracker")} icon="🧠" defaultOpen={!!trackerData} badge={trackerData?._updatedChapter || 0}>
            {!trackerData && <p className="text-sm text-gray-400">{T("trackerHint")}</p>}
            {shouldRefreshTracker && <div className="text-xs text-amber-600 bg-amber-100 px-3 py-2 rounded-lg">{T("refreshSuggest", chaptersWithContent)}</div>}
            <div className="flex gap-2">
              <button onClick={fetchStoryTracker} disabled={trackerLoading || outline.length === 0} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-semibold hover:from-indigo-600 hover:to-violet-600 disabled:opacity-50 transition-all shadow-sm">{trackerLoading ? "⏳" : T("refreshTracker")}</button>
            </div>
            {trackerData && (
              <div className="space-y-3">
                {trackerData.consistencyWarnings?.length > 0 && <div className="bg-red-50 border border-red-200 rounded-xl p-3"><h3 className="text-sm font-semibold text-red-700 mb-1">⚠️ {lang === "en" ? "Consistency Issues" : "一致性问题"}</h3>{trackerData.consistencyWarnings.map((w, i) => <p key={i} className="text-xs text-red-600">{w}</p>)}</div>}
                {trackerData.characters?.length > 0 && <div><h3 className="text-sm font-semibold text-gray-600 mb-2">👥 {lang === "en" ? "Character Status" : "角色状态"}</h3><div className="space-y-2">{trackerData.characters.map((c, i) => (<div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100"><div className="flex items-center gap-2 mb-1"><span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${c.role === "主角" || c.role === "MC" ? "bg-yellow-200 text-yellow-800" : c.role === "正派" || c.role === "Ally" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>{c.role}</span><span className="font-semibold text-sm text-gray-800">{c.name}</span><span className="text-xs text-gray-400">{c.currentStatus}</span></div>{c.abilityProgression && <p className="text-xs text-gray-500">📈 {lang === "en" ? "Ability: " : "能力："}{c.abilityProgression}</p>}{c.personalityArc && <p className="text-xs text-gray-500">🎭 {lang === "en" ? "Arc: " : "性格："}{c.personalityArc}</p>}{c.keyRelationships?.length > 0 && <div className="flex flex-wrap gap-1 mt-1">{c.keyRelationships.map((r, j) => (<span key={j} className="text-xs bg-gray-200 rounded-full px-2 py-0.5 text-gray-600">{r.with}：{r.status}</span>))}</div>}{c.endingDirection && <p className="text-xs text-violet-500 mt-1">🔮 {lang === "en" ? "Direction: " : "走向："}{c.endingDirection}</p>}</div>))}</div></div>}
                {trackerData.plotThreads?.length > 0 && <div><h3 className="text-sm font-semibold text-gray-600 mb-2">🧵 {lang === "en" ? "Plot Threads" : "伏笔&支线"}</h3><div className="space-y-1.5">{trackerData.plotThreads.map((pt, i) => (<div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100"><span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${pt.status === "已回收" ? "bg-green-200 text-green-700" : pt.status === "遗忘" ? "bg-red-200 text-red-700" : "bg-blue-200 text-blue-700"}`}>{pt.status}</span><span className="text-sm text-gray-700 flex-1">{pt.name}</span><span className="text-xs text-gray-400">Ch{pt.firstAppeared} → Ch{pt.shouldResolveBy}</span></div>))}</div></div>}
                {trackerData.worldChanges?.length > 0 && <div><h3 className="text-sm font-semibold text-gray-600 mb-2">🌍 {lang === "en" ? "World Changes" : "世界变化"}</h3><div className="flex flex-wrap gap-1.5">{trackerData.worldChanges.map((wc, i) => (<span key={i} className="text-xs bg-purple-100 text-purple-700 rounded-full px-2.5 py-1">{wc}</span>))}</div></div>}
                {trackerData.nextChapterTips && <div className="bg-indigo-100/50 rounded-xl p-3 border border-indigo-200"><h3 className="text-xs font-semibold text-indigo-700 mb-1">💡 {lang === "en" ? "Next Chapter Tips" : "下一章注意事项"}</h3><p className="text-sm text-gray-700">{trackerData.nextChapterTips}</p></div>}
              </div>
            )}
            {chapterContent && (
              <div className="mt-2 pt-3 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">{T("chapterAudit")}</h3>
                <button onClick={auditChapter} disabled={auditLoading} className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 transition-all">{auditLoading ? T("auditing") : T("auditBtn")}</button>
                {auditData && auditData._auditChapter === currentChapterIndex && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{lang === "en" ? "Score: " : "评分："}</span>
                      <span className={`text-sm px-2 py-0.5 rounded-full font-medium ${auditData.overallScore === "一致" ? "bg-green-100 text-green-700" : auditData.overallScore === "基本一致" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{auditData.overallScore}</span>
                    </div>
                    {auditData.issues?.length > 0 && <div className="space-y-1"><p className="text-xs text-gray-500 font-medium">{lang === "en" ? "Issues:" : "问题列表："}</p>{auditData.issues.map((iss, i) => (<div key={i} className="bg-red-50 rounded-lg p-2 text-xs"><span className={`font-medium ${iss.severity === "严重" ? "text-red-700" : iss.severity === "一般" ? "text-amber-700" : "text-gray-600"}`}>[{iss.severity}] {iss.character}：{iss.problem}</span><p className="text-gray-600 mt-0.5">{lang === "en" ? "Fix: " : "修复："}{iss.fix}</p></div>))}</div>}
                    {auditData.suggestions && <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2">💡 {auditData.suggestions}</p>}
                  </div>
                )}
              </div>
            )}
          </CollapsibleCard>

          <button onClick={generateOpening} disabled={loading || !canGenerate()} className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold text-[15px] hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-200">
            {loading ? T("generating") : T("generateOpening")}
          </button>
        </div>
      </aside>

      {/* ========== 右侧内容面板 ========== */}
      <main className={`flex-1 transition-all duration-300 ease-in-out p-6 pt-16 overflow-auto bg-white min-h-screen ${leftPanelOpen ? "lg:ml-[420px]" : ""}`}>
        {/* 续写已有小说 */}
        <div className={`mb-6 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl border border-teal-200 overflow-hidden transition-all ${importPanelOpen ? "shadow-md" : ""}`}>
          <button type="button" onClick={() => setImportPanelOpen(!importPanelOpen)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-teal-100/30 transition-colors">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">{T("importNovel")}</h2>
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${importPanelOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          {importPanelOpen && (
            <div className="px-5 pb-5 space-y-4">
              <p className="text-sm text-gray-500">{T("importDesc")}</p>
              <div className="flex gap-2">
                {[{ key: "paste", label: T("paste") }, { key: "file", label: T("upload") }].map((tab) => (<button key={tab.key} onClick={() => { setImportMode(tab.key); setImportNovelText(""); }} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${importMode === tab.key ? "bg-teal-500 text-white shadow-sm" : "bg-white/60 text-gray-600 hover:bg-white"}`}>{tab.label}</button>))}
              </div>
              {importMode === "paste" && <textarea className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all resize-y" rows={8} placeholder={lang === "en" ? "Paste your novel text here..." : "在此粘贴小说全文内容…"} value={importNovelText} onChange={(e) => setImportNovelText(e.target.value)} />}
              {importMode === "file" && (<div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 text-center"><p className="text-gray-400 text-sm mb-3">{lang === "en" ? "Select .txt novel file" : "选择 .txt 小说文件"}</p><input type="file" accept=".txt,.text" onChange={handleFileUploadForImport} className="text-sm" />{importNovelText && <p className="text-xs text-green-500 mt-2">✅ {importNovelText.length} {lang === "en" ? "chars read" : "字已读取"}</p>}</div>)}
              <button onClick={analyzeImportedNovel} disabled={!importNovelText.trim() || importAnalyzing} className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold text-sm hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 transition-all shadow-sm">{importAnalyzing ? T("analyzing") : T("analyze")}</button>
              {importAnalysis && (
                <div className="bg-white rounded-xl p-4 border border-teal-100 space-y-3">
                  <h3 className="font-semibold text-gray-800 text-sm">{T("analysisResult")}</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-400">{T("worldTypeLabel")}</span><p className="font-semibold text-gray-700">{importAnalysis.worldType || "-"}</p></div>
                    <div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-400">{T("styleLabel")}</span><p className="font-semibold text-gray-700">{importAnalysis.style || "-"}</p></div>
                    <div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-400">{T("protagonistLabel")}</span><p className="font-semibold text-gray-700">{importAnalysis.protagonist?.name || "-"}</p></div>
                    <div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-400">{T("estChapters")}</span><p className="font-semibold text-gray-700">{importAnalysis.estimatedChapters || "-"}</p></div>
                  </div>
                  {importAnalysis.plotSummary && <div className="text-xs"><span className="text-gray-400">{T("plotSummary")}：</span><span className="text-gray-700">{importAnalysis.plotSummary}</span></div>}
                  {importAnalysis.currentSituation && <div className="text-xs"><span className="text-gray-400">{T("currentSit")}：</span><span className="text-gray-700 font-medium">{importAnalysis.currentSituation}</span></div>}
                  {importAnalysis.allies?.length > 0 && <div className="flex flex-wrap gap-1">{importAnalysis.allies.map((a, i) => (<span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{a.name}({a.relation})</span>))}</div>}
                  {importAnalysis.enemies?.length > 0 && <div className="flex flex-wrap gap-1">{importAnalysis.enemies.map((e, i) => (<span key={i} className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{e.name}({e.relation})</span>))}</div>}
                  {importAnalysis.continuationIdeas?.length > 0 && <div><p className="text-xs text-gray-400 mb-1">{T("continuationPreview")}：</p>{importAnalysis.continuationIdeas.slice(0, 3).map((idea, i) => (<p key={i} className="text-xs text-teal-600">· {idea}</p>))}</div>}
                  <button onClick={applyImportAnalysis} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all">{T("syncFramework")}</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 市场调研 */}
        <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 overflow-hidden">
          <button type="button" onClick={() => setMarketCollapsed(!marketCollapsed)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-amber-100/30 transition-colors">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">{T("marketResearch")}</h2>
            <div className="flex items-center gap-2">
              <button onClick={(e) => { e.stopPropagation(); fetchMarketResearch(); }} disabled={marketLoading} className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 transition-all shadow-sm">{marketLoading ? "⏳" : "🔍 " + (lang === "en" ? "Start Research" : "开始深度调研")}</button>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${!marketCollapsed ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </button>
          {!marketCollapsed && (
            <div className="px-5 pb-5">
              {!marketData && <p className="text-sm text-gray-400">{T("marketHint")}</p>}
              {marketData && (
                <div>
                  {marketData.marketOverview && <div className="bg-white/80 rounded-xl p-3 mb-3 border border-amber-100"><p className="text-sm text-gray-700 leading-relaxed">{marketData.marketOverview}</p></div>}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {[{ label: lang === "en" ? "🔥 Genres" : "🔥 题材分析", key: "genreAnalysis" }, { label: lang === "en" ? "📱 Platforms" : "📱 平台趋势", key: "platformTrends" }, { label: lang === "en" ? "👁️ Readers" : "👁️ 读者洞察", key: "readerInsights" }, { label: lang === "en" ? "✍️ Trends" : "✍️ 创作趋势", key: "writingTrends" }, { label: lang === "en" ? "🌊 Blue Ocean" : "🌊 蓝海机会", key: "blueOcean" }, { label: lang === "en" ? "💡 Tips" : "💡 定制建议", key: "recommendations" }].map((tab, i) => (<button key={tab.key} onClick={() => setMarketTab(i)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${marketTab === i ? "bg-amber-500 text-white shadow-sm" : "bg-white/60 text-gray-600 hover:bg-white"}`}>{tab.label}</button>))}
                  </div>
                  {/* Market content tabs same as before, conditionally rendered */}
                  {marketTab === 0 && marketData.genreAnalysis?.length > 0 && (<div className="grid grid-cols-1 lg:grid-cols-2 gap-2">{marketData.genreAnalysis.map((g, i) => (<div key={i} className="bg-white/80 rounded-xl p-3 border border-amber-100"><div className="flex items-center gap-2 mb-1"><span className={`text-xs px-1.5 py-0.5 rounded font-bold ${g.heat === "S" ? "bg-red-500 text-white" : g.heat === "A" ? "bg-orange-500 text-white" : g.heat === "B" ? "bg-yellow-400 text-white" : "bg-gray-300"}`}>{g.heat || "?"}</span><span className="font-semibold text-sm">{g.genre}</span></div><div className="text-xs text-gray-500 space-y-0.5"><p>📂 {g.subGenres || "-"}</p><p>👥 {g.readers || "-"}</p><p>💰 {g.money || "-"}</p><p className="text-gray-700">✅ {g.success || "-"}</p><p className="text-red-500">⚠️ {g.pitfall || "-"}</p></div></div>))}</div>)}
                  {marketTab === 1 && marketData.platformTrends?.length > 0 && (<div className="grid grid-cols-1 lg:grid-cols-2 gap-2">{marketData.platformTrends.map((p, i) => (<div key={i} className="bg-white/80 rounded-xl p-3 border border-amber-100"><span className="font-semibold text-sm">{p.platform}</span><p className="text-xs text-gray-500 mt-1">🔥 {p.hot}</p><p className="text-xs text-gray-500">👥 {p.readers}</p><p className="text-xs text-gray-500">💳 {p.pay}</p></div>))}</div>)}
                  {marketTab === 2 && marketData.readerInsights && (<div className="bg-white/80 rounded-xl p-4 space-y-3"><div className="grid grid-cols-3 gap-3 text-center"><div className="bg-amber-50 rounded-lg p-2"><p className="text-xs text-gray-400">{lang === "en" ? "Peak Time" : "活跃时段"}</p><p className="text-sm font-semibold">{marketData.readerInsights.peakTime || "-"}</p></div><div className="bg-amber-50 rounded-lg p-2"><p className="text-xs text-gray-400">{lang === "en" ? "Chapter Len" : "偏好单章"}</p><p className="text-sm font-semibold">{marketData.readerInsights.chapterLen || "-"}</p></div><div className="bg-amber-50 rounded-lg p-2"><p className="text-xs text-gray-400">{lang === "en" ? "Update Freq" : "更新频率"}</p><p className="text-sm font-semibold">{marketData.readerInsights.updateFreq || "-"}</p></div></div></div>)}
                  {marketTab === 3 && marketData.writingTrends && (<div className="bg-white/80 rounded-xl p-4 space-y-3">{[["👁️ " + (lang === "en" ? "Perspective" : "流行视角"), "perspectives"], ["🚪 " + (lang === "en" ? "Opening" : "开篇手法"), "opening"], ["⏱️ " + (lang === "en" ? "Pacing" : "节奏趋势"), "pacing"], ["📏 " + (lang === "en" ? "Short vs Long" : "短篇vs长篇"), "shortVsLong"]].map(([label, key]) => (<div key={key}><p className="text-xs text-gray-400 mb-1">{label}</p><p className="text-sm text-gray-700">{marketData.writingTrends[key] || "-"}</p></div>))}</div>)}
                  {marketTab === 4 && marketData.blueOcean?.length > 0 && (<div className="space-y-2">{marketData.blueOcean.map((b, i) => (<div key={i} className="bg-white/80 rounded-xl p-3 border border-green-100"><div className="flex items-center gap-2"><span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded font-bold">{(lang === "en" ? "Blue Ocean " : "蓝海 ")}{i + 1}</span><span className="font-semibold text-sm">{b.niche}</span></div><p className="text-xs text-gray-500 mt-1">🎯 {b.why}</p><p className="text-xs text-gray-500">👥 {b.audience}</p></div>))}</div>)}
                  {marketTab === 5 && (<div className="space-y-3">
                    {marketData.monetization && <div className="bg-white/80 rounded-xl p-3 border border-amber-100"><p className="text-xs text-gray-400 mb-1">💰 {lang === "en" ? "Monetization" : "变现与新人路径"}</p><p className="text-sm text-gray-700">{marketData.monetization}</p></div>}
                    {marketData.recommendations?.length > 0 && (<div className="space-y-2"><p className="text-xs text-gray-400">🎯 {lang === "en" ? "Personalized Tips" : "个性化题材建议"}</p>{marketData.recommendations.map((r, i) => (<div key={i} className="bg-white/80 rounded-xl p-3 border border-green-100"><div className="flex items-center gap-2 mb-1"><span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded font-bold">{i + 1}</span><span className="font-semibold text-sm">{r.idea}</span></div><div className="text-xs text-gray-500 space-y-0.5"><p>✅ {r.fit} | {r.platform} | {r.words}</p><p>{r.advantage}</p><p>{r.risk}</p><p className="text-green-600">{r.angle}</p><p className="text-amber-600">{r.hook}</p></div></div>))}</div>)}
                  </div>)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 开篇点子 */}
        {showOpeningIdeas && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3"><h2 className="text-lg font-bold text-gray-800">{T("openingIdeas")} ({openingIdeas.length})</h2><button onClick={generateMoreOpenings} disabled={refinedLoading || !canGenerate()} className="px-4 py-2 rounded-xl bg-indigo-100 text-indigo-700 text-sm font-semibold hover:bg-indigo-200 disabled:opacity-50 transition-all">{refinedLoading ? T("generating") : T("genMore")}</button></div>
            <div className="space-y-3">
              {openingIdeas.map((item, i) => {
                const ideaText = typeof item === "string" ? item : item.idea; const highlight = typeof item === "string" ? "" : item.highlight;
                return (<div key={i} className={`rounded-xl border-2 p-4 transition-all ${selectedOpening === ideaText ? "border-blue-500 bg-blue-50 shadow-sm" : "border-gray-100 bg-gray-50"}`}><div className="flex items-start gap-3"><div className="flex-1"><textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none" rows={2} value={ideaText} onChange={(e) => updateOpeningIdea(i, e.target.value)} />{highlight && <p className="text-xs text-amber-600 mt-1">✨ {highlight}</p>}{item.refined?.length > 0 && <div className="mt-2 space-y-1.5 border-t border-gray-200 pt-2"><p className="text-xs text-gray-400 font-medium">{T("aiSuggest")}：</p>{item.refined.map((r, ri) => { const rText = typeof r === "string" ? r : r.idea; return (<div key={ri} className="flex items-start gap-2 bg-white rounded-lg p-2 border border-purple-100"><div className="flex-1"><p className="text-xs text-gray-700">{rText}</p></div><button onClick={() => acceptRefinedIdea(i, ri)} className="shrink-0 text-xs px-2 py-1 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors">{T("adopt")}</button></div>); })}</div>}</div><div className="flex flex-col gap-1.5 shrink-0"><button onClick={() => setSelectedOpening(ideaText)} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${isSelected ? "bg-blue-600 text-white" : "bg-white border border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600"}`}>{isSelected ? T("selected") : T("select")}</button><button onClick={() => refineOpeningIdea(i)} disabled={refiningIndex === i || !canGenerate()} className="text-xs px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 disabled:opacity-50 transition-colors font-medium">{refiningIndex === i ? "⏳" : T("aiOptimize")}</button></div></div></div>);
              })}
            </div>
            <button onClick={generateOutline} disabled={loading || !selectedOpening || !canGenerate()} className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold text-sm hover:from-purple-700 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm">{loading ? T("generating") : T("genOutline")}</button>
          </div>
        )}

        {/* 续写点子 */}
        {currentChapterIndex > 0 && !chapterContent && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-5">
            <div className="flex items-center justify-between mb-3"><h2 className="text-lg font-bold text-gray-800">{T("continuationIdeas")} — {lang === "en" ? "Ch " : "第"}{currentChapterIndex + 1}{lang === "en" ? "" : "章"}</h2><button onClick={() => fetchContinuationIdeas()} disabled={continuationLoading || !canGenerate()} className="px-4 py-2 rounded-xl bg-green-100 text-green-700 text-sm font-semibold hover:bg-green-200 disabled:opacity-50 transition-all">{continuationLoading ? T("generating") : T("genContinuation")}</button></div>
            {!continuationIdeas.length && !continuationLoading && <p className="text-sm text-gray-500 mb-3">{T("continuationHint")}</p>}
            {continuationIdeas.length > 0 && (<div className="space-y-2">{continuationIdeas.map((item, i) => { const ideaText = typeof item === "string" ? item : item.idea; const highlight = typeof item === "string" ? "" : item.highlight; return (<label key={i} className={`block p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedContinuation === ideaText ? "border-green-500 bg-green-50 shadow-sm" : "border-gray-100 bg-white hover:border-gray-300"}`}><div className="flex items-start gap-3"><input type="radio" name="continuation" value={ideaText} checked={selectedContinuation === ideaText} onChange={(e) => setSelectedContinuation(e.target.value)} className="mt-1" /><div className="flex-1"><p className="text-sm text-gray-800">{ideaText}</p>{highlight && <p className="text-xs text-green-600 mt-1">✨ {highlight}</p>}</div></div></label>); })}</div>)}
          </div>
        )}

        {/* 大纲 */}
        {outline.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">{T("chapOutline")} ({outline.length} {lang === "en" ? "ch" : "章"} · {computeOutlineGroups(outline).length} {T("groups")})</h2>
            <OutlineGroups outline={outline} currentChapterIndex={currentChapterIndex} onSelect={(idx) => { setCurrentChapterIndex(idx); setChapterContent(outline[idx]?.content || ""); setAuditData(null); setContinuationIdeas([]); }} openGroups={outlineOpenGroups} toggleGroup={(key) => setOutlineOpenGroups(prev => ({ ...prev, [key]: prev[key] === false ? true : false }))} lang={lang} />
            {outline[currentChapterIndex] && (
              <div className="bg-gray-50 rounded-xl p-4 my-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 shrink-0">{lang === "en" ? "Ch " : "第"}{currentChapterIndex + 1}{lang === "en" ? "" : "章"}</span>
                  <input className="flex-1 font-semibold text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-400 focus:outline-none px-1 py-0.5 text-sm transition-colors" value={outline[currentChapterIndex].title} onChange={(e) => { const o = [...outline]; o[currentChapterIndex] = { ...o[currentChapterIndex], title: e.target.value }; setOutline(o); }} placeholder={T("titlePlaceholder")} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 shrink-0">🪝</span>
                  <input className="flex-1 text-sm text-gray-500 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-400 focus:outline-none px-1 py-0.5 transition-colors" value={outline[currentChapterIndex].hook || ""} onChange={(e) => { const o = [...outline]; o[currentChapterIndex] = { ...o[currentChapterIndex], hook: e.target.value }; setOutline(o); }} placeholder={T("hookPlaceholder")} />
                </div>
                {outline[currentChapterIndex].content && <p className="text-xs text-green-500">{T("savedChapter")} · {outline[currentChapterIndex].content.length}{lang === "en" ? " chars" : "字"}</p>}
              </div>
            )}
            <div className="flex flex-wrap gap-3 mb-6">
              <button onClick={() => generateChapter(currentChapterIndex)} disabled={loading || !canGenerate()} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold text-sm hover:from-green-700 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm">{loading ? T("generating") : currentChapterIndex === 0 ? T("writeChap1") : T("writeChap")}</button>
              {chapterContent && currentChapterIndex > 0 && <button onClick={() => generateChapter(currentChapterIndex)} disabled={loading || !canGenerate()} className="px-6 py-2.5 rounded-xl bg-yellow-500 text-white font-semibold text-sm hover:bg-yellow-600 disabled:opacity-50 transition-all">{T("rewrite")}</button>}
              {chapterContent && <button onClick={saveChapter} className="px-6 py-2.5 rounded-xl bg-purple-500 text-white font-semibold text-sm hover:bg-purple-600 transition-all">{T("saveOutline")}</button>}
              <button onClick={goToNextChapter} className="px-6 py-2.5 rounded-xl bg-blue-500 text-white font-semibold text-sm hover:bg-blue-600 transition-all">{T("nextChapter")}</button>
              <button onClick={() => generateChapter(currentChapterIndex + 1)} disabled={loading || !canGenerate()} className="px-6 py-2.5 rounded-xl bg-indigo-500 text-white font-semibold text-sm hover:bg-indigo-600 disabled:opacity-50 transition-all">{T("genNext")}</button>
            </div>
          </div>
        )}

        {/* 正文 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 min-h-[300px]">
          {chapterContent ? <div className="whitespace-pre-wrap leading-8 text-[15px] text-gray-800">{chapterContent}</div> : <div className="text-gray-300 text-center mt-24 text-sm">{outline.length ? (currentChapterIndex === 0 ? T("welcomeMsg1") : T("welcomeMsg2")) : T("welcomeMsg3")}</div>}
        </div>
      </main>
    </div>
  );
}
