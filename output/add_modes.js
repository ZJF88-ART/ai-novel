const fs=require("fs");
const p="C:/Users/周进法/Desktop/ai-novel/app/api/generate/route.js";
let c=fs.readFileSync(p,"utf-8");

// Find the error response at end of POST handler  
const marker = 'return Response.json({ error: `未知模式: ${mode}` }, { status: 400 });';
const idx = c.indexOf(marker);
if(idx<0){console.log("Marker not found");process.exit(1);}

const before = c.substring(0, idx);
const after = c.substring(idx);

const modes = `
  // ===== 角色圣经 =====
  if (mode === "character_bible") {
    const allContent = body.chapterContents || [];
    const existing = body.existingBible || {};
    const prompt = "你是角色档案员。根据以下小说章节，为每个角色建立档案。JSON格式：{ characters: { 角色名: { personalitySnapshot, signatureLine, habits, secrets, relationships, recentChange, readerImpression } }, deathFlags, chemistryPairs }。章节：" + allContent.join("\\n---\\n") + " 现有：" + JSON.stringify(existing);
    const result = await callAI([{role:"system",content:"你是角色档案员。输出严格JSON。"},{role:"user",content:prompt}],2000);
    try { return Response.json(JSON.parse(result.replace(/` + "`" + `json|` + "`" + `/g,"").trim())); }
    catch { return Response.json({characters:{},deathFlags:[],chemistryPairs:[]}); }
  }

  // ===== 节奏分析 =====
  if (mode === "rhythm_analysis") {
    const contents = body.chapterContents || [];
    const prompt = "你是节奏分析师。分析以下章节。JSON：{ chapters:[{chapter,tension,type,oneLine,readerFeeling}], curve, problem, suggestion, fatigueIndex, nextChapterType }。内容：" + contents.map((t,i)=>"第"+(i+1)+"章："+t.substring(0,300)).join("\\n");
    const result = await callAI([{role:"system",content:"你是节奏分析师。输出严格JSON。"},{role:"user",content:prompt}],1200);
    try { return Response.json(JSON.parse(result.replace(/` + "`" + `json|` + "`" + `/g,"").trim())); }
    catch { return Response.json({chapters:[],curve:"unknown",suggestion:"无法分析"}); }
  }

  // ===== 惊喜连接 =====
  if (mode === "plot_connect") {
    const threads = body.plotThreads || [];
    const chars = body.characterInfo || {};
    const prompt = "你是小说结构师。发现伏笔之间的隐藏关联。JSON：{ connections:[{threadA,threadB,connection,surpriseLevel,mergeIdea,impactOnCharacters}], orphanThreads, masterKey, newDirection }。伏笔：" + JSON.stringify(threads) + " 角色：" + JSON.stringify(chars);
    const result = await callAI([{role:"system",content:"你是小说结构师。输出严格JSON。"},{role:"user",content:prompt}],1500);
    try { return Response.json(JSON.parse(result.replace(/` + "`" + `json|` + "`" + `/g,"").trim())); }
    catch { return Response.json({connections:[],masterKey:"分析失败"}); }
  }
`;

c = before + modes + "\n  " + after;
fs.writeFileSync(p, c, "utf-8");
console.log("API modes added:", c.length, "chars");