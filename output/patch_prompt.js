const fs=require("fs");
const p="C:/Users/周进法/Desktop/ai-novel/app/api/generate/route.js";
let c=fs.readFileSync(p,"utf-8");

// 1. Replace character lock block
const oldLock = "【角色锁定——严禁改变以下设定】";
const idx1 = c.indexOf(oldLock);
if(idx1>=0){
  const endIdx = c.indexOf("【写作要求】", idx1);
  if(endIdx>=0){
    const before = c.substring(0, idx1);
    const after = c.substring(endIdx);
    const newLock = "【角色约束——请严格遵循，但以下面自然的方式融入写作，不要生硬说明】\n- 林夜：能力“雷劫淬体/赤雷”，性格内敛不张扬（不是懦弱），心魔是他内心真正的对手\n- 苏婉清：能力“治愈圣光/雷灵封印”，温柔但有主见，信任别人但不傻\n- 顾青云：能力“剑意化形”（剑气、剑招，绝对不要写成机械义肢、炮管、枪械），表面彬彬有礼实际步步为营\n\n";
    c = before + newLock + after;
    console.log("Lock block replaced");
  }
}

// 2. Replace writing rules
const oldRulesStart = "1. 自然承接上章结尾，不要突兀跳转";
const idx2 = c.indexOf(oldRulesStart);
if(idx2>=0){
  const endIdx2 = c.indexOf("字数", idx2);
  if(endIdx2>=0){
    const before2 = c.substring(0, idx2);
    const after2 = c.substring(endIdx2);
    const newRules = `- 从上章结尾自然开始，像翻书翻到下一页
- 情节发展由角色的选择和性格推动，不要让“剧情需要”凌驾于角色之上
- 结尾停在角色面临选择的时刻，而不是刻意制造悬念
- 对话要贴合角色：林夜话少但到位，苏婉清直接不绕弯，顾青云话里有话
- 描写具体的东西：物品的质感、光线的方向、声音的远近——而不是抽象的感受
- 禁止使用的AI套路词和句式：
  “空气中弥漫着” “他的眼中闪过” “嘴角勾起一抹” “就在这时” “突然”后面紧跟“然而”
  “在XX的世界里” “随着XX的发展” “不仅仅” “仿佛在说” “似乎”
- 不要解释角色动机。让读者通过角色的行为自己理解
- 每段必须有推进：要么推进剧情，要么揭示角色，要么改变关系。不写“过渡段落”
`;
    c = before2 + newRules + after2;
    console.log("Rules replaced");
  }
}

fs.writeFileSync(p, c, "utf-8");
console.log("Done:", c.length, "chars");