/* ===== 预设数据 ===== */
export const WORLD_TYPES = [
  { value: "fantasy", label: "西幻", en: "Fantasy" },
  { value: "xianxia", label: "修仙", en: "Cultivation" },
  { value: "modern", label: "现代", en: "Modern" },
  { value: "apocalypse", label: "末世", en: "Apocalypse" },
];

export const PERSONALITIES = ["热血", "冷酷", "腹黑", "天真", "温柔", "傲娇", "沉稳", "偏执", "洒脱", "阴郁", "狡黠", "正直", "善良", "懒散", "疯批", "懦弱", "毒舌", "忠犬"];
export const STYLES = ["热血战斗", "轻松搞笑", "悬疑惊悚", "甜宠浪漫", "史诗奇幻", "暗黑反转", "治愈温馨", "智斗谋略"];

export const ABILITIES = {
  fantasy:     ["剑术通神", "元素掌控", "龙骑士", "时间回溯", "治愈圣光", "暗影潜行", "读心术", "雷霆之体", "召唤亡灵", "变形术", "瞬间移动", "魔力吞噬"],
  xianxia:     ["御剑飞行", "丹道宗师", "阵法大师", "天眼通", "不死之身", "灵气操控", "剑意化形", "符箓精通", "雷劫淬体", "一气化三清", "元神出窍", "九转金身"],
  modern:      ["黑客技术", "格斗大师", "金融天才", "心理操控", "枪械精通", "易容术", "超忆症", "绝对音感", "极限体能", "社交女王"],
  apocalypse:  ["变异之力", "机械改造", "生存专家", "病毒免疫", "预知危险", "神速", "控火异能", "金属操控", "植物沟通", "空间折叠"],
};

export const WEAKNESSES = {
  fantasy:     ["无法杀人", "月圆失控", "失忆", "诅咒束缚", "力量反噬", "怕水", "信任过度", "寿命有限", "魔力波动", "契约代价"],
  xianxia:     ["心魔缠身", "瓶颈难破", "正道追杀", "魔气侵蚀", "天劫将至", "寿元将尽", "道心不稳", "惧高", "灵根残缺", "血脉诅咒"],
  modern:      ["幽闭恐惧", "社交焦虑", "法律约束", "失眠", "信任障碍", "贫穷", "仇家太多", "依赖药物"],
  apocalypse:  ["变异失控", "能源依赖", "怕火", "旧伤复发", "辐射病", "幻觉", "饥饿", "机械故障"],
};

export const MALE_NAMES = ["林夜", "苏寒", "陆星辰", "白墨", "叶枫", "秦长风", "萧尘", "顾青云", "沈浪", "云逸", "姬无命", "洛天", "慕白", "君无邪", "花千树", "百里屠苏"];
export const FEMALE_NAMES = ["苏婉清", "叶灵儿", "柳如烟", "白浅浅", "云兮", "花千骨", "秦芷若", "林雪见", "沈清辞", "凤九歌", "唐若雪", "洛清尘", "顾倾城", "姬如月", "苏玖瑶", "慕晴"];

export const ALLY_RELATIONS = ["朋友", "恋人", "部下", "上司", "青梅竹马", "师徒（主角为师）", "师徒（主角为徒）", "兄弟/姐妹", "护卫", "救命恩人", "暗恋对象", "未婚夫/妻"];
export const ENEMY_RELATIONS = ["敌人", "宿敌", "背叛者", "情敌", "竞争对手", "灭族仇人", "昔日好友", "追杀者", "邪恶化身", "政敌", "情债"];

export const NOVEL_LENGTHS = [
  { value: "short", label: "短篇", labelEn: "Short", hint: "~20章", hintEn: "~20 ch", chapters: 20 },
  { value: "medium", label: "中篇", labelEn: "Medium", hint: "~40章", hintEn: "~40 ch", chapters: 40 },
  { value: "long", label: "长篇", labelEn: "Long", hint: "~60章", hintEn: "~60 ch", chapters: 60 },
  { value: "epic", label: "超长篇", labelEn: "Epic", hint: "~80章", hintEn: "~80 ch", chapters: 80 },
];

export const PROVIDER_OPTIONS = [
  { value: "deepseek", label: "DeepSeek (国内)" },
  { value: "zhipu", label: "智谱 GLM (国内)" },
  { value: "agnes", label: "Agnes AI (海外·免费)" },
];

export function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export function randomCharacter(worldType, gender) {
  const names = gender === "female" ? FEMALE_NAMES : MALE_NAMES;
  return { name: pick(names), personality: pick(PERSONALITIES), ability: pick(ABILITIES[worldType] || ABILITIES.fantasy), weakness: pick(WEAKNESSES[worldType] || WEAKNESSES.fantasy) };
}

export function randomAlly(worldType) { return { ...randomCharacter(worldType, pick(["male", "female"])), relation: pick(ALLY_RELATIONS) }; }
export function randomEnemy(worldType) { return { ...randomCharacter(worldType, pick(["male", "female"])), relation: pick(ENEMY_RELATIONS) }; }