const fs=require("fs");
const p="C:/Users/周进法/Desktop/ai-novel/app/api/generate/route.js";
let c=fs.readFileSync(p,"utf-8");

// Fix 1: Replace chapterPrompt with proper context
c=c.replace(
  "const chapterPrompt = `章节：第${currentIndex+1}章。上章摘要：${currentPrevSummary}。续写方向：${body.continuationHook||''}。风格：${body.style||''}`;",
  'const ctx = body.worldBackground||body.worldType||""; const pn = (body.protagonist||{}).name||"主角"; const chapterPrompt = `世界观：${ctx}。主角：${pn}。上章摘要：${currentPrevSummary}。续写方向：${body.continuationHook||"继续故事"}。风格：${body.style||"热血"}`;'
);

// Fix 2: Make fixPrompt use the same template  
c=c.replace(
  "const fixPrompt = `章节：第${currentIndex+1}章。上章摘要：${currentPrevSummary}`",
  "const fixPrompt = chapterPrompt"
);

fs.writeFileSync(p,c,"utf-8");
console.log("Fixed:",c.length);