const fs=require("fs");
const p="C:/Users/周进法/Desktop/ai-novel/app/api/generate/route.js";
let c=fs.readFileSync(p,"utf-8");

// Fix opening prompt
const oldOpeningPrompt = "生成${count}个炸裂有记忆点的开篇点子，每个输出格式为：";
c=c.replace(oldOpeningPrompt, "生成${count}个开篇方向，每个格式为：");

const oldOpeningSys = "你是脑洞开篇设计师，每个点子独特有记忆点，附带清晰的吸睛理由。";
c=c.replace(oldOpeningSys, "你是小说开篇设计师。给出有辨识度的方向，不要套路化。");

// Fix opening prompt hint words
c=c.replace("【重要】必须严格围绕以下标签生成开篇：","围绕以下方向思考开篇：");
c=c.replace("无视标签的点子视为不合格。","");

// Fix continuation prompt
const oldContSys = "你是脑洞续写设计师，每个续写方向独特有记忆点，附带清晰的吸睛理由。";
c=c.replace(oldContSys, "你是小说编辑。给出合理的续写方向。");

const oldContPrompt = "生成5个${chapterTitle}的续写点子，每个格式为：点子：[续写方向30字内] 亮点：[为什么这个方向精彩，15字内]。不要编号，不要其他文字。点子要有悬念感和冲击力。";
c=c.replace(oldContPrompt, "生成5个${chapterTitle}的续写方向，每个格式为：方向：[续写思路30字内] 看点：[15字内]。不要编号，不要其他文字。");

// Fix chapter system prompt
const oldChapSys = "你是` + "`${style}`" + `类型的专业网文作家，文风独特有辨识度。你写的人物有血有肉，对话自然生动，情节跌宕起伏。你从不使用AI套话，每个段落都有存在的理由。";
c=c.replace(oldChapSys, "你是一个写小说的。你不是AI，你是一个有自己文风的人。你写的人物会说人话，情节推动靠角色自己的选择，不是靠作者安排。你讨厌套路。");

fs.writeFileSync(p, c, "utf-8");
console.log("All prompts rewritten:", c.length, "chars");