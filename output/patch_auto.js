const fs=require("fs");
const p="C:/Users/周进法/Desktop/ai-novel/app/api/generate/route.js";
let c=fs.readFileSync(p,"utf-8");

const insertMarker = "return Response.json({ error: `未知模式: ${mode}` }, { status: 400 });";
const autoWriteCode = `
  // 15. 自主写作引擎：自动生成+审核+修正+循环
  if (mode === "auto_write") {
    const startChapter = chapterIndex || 0;
    const maxChapters = body.maxAutoChapters || 5;
    const results = [];
    let currentIndex = startChapter;
    let currentPrevSummary = previousChapterSummary || "";

    for (let i = 0; i < maxChapters; i++) {
      // 1. 生成章节
      const chapterPrompt = buildChapterPrompt(currentIndex, currentPrevSummary, body);
      let chapterResult;
      try {
        chapterResult = await callAI([
          { role: "system", content: body.systemPrompt || "你是一个写小说的。你不是AI，你是一个有自己文风的人。" },
          { role: "user", content: chapterPrompt },
        ], 1800);
      } catch (err) { break; }

      const summaryMatch = chapterResult.match(/【本章摘要】：([\s\S]*)/);
      let chapSummary = summaryMatch ? summaryMatch[1].trim() : "";
      let chapContent = chapterResult.replace(/【本章摘要】：[\s\S]*/, "").trim();

      // 2. 兜底摘要
      if (!chapSummary && chapContent.length > 50) {
        chapSummary = chapContent.replace(/\n/g, "").slice(-100).trim();
      }

      // 3. 自动审核
      let auditIssues = [];
      try {
        const auditResult = await callAI([
          { role: "system", content: "审核小说章节角色一致性，输出JSON: {overallScore,issues:[{severity,character,problem,fix}]}" },
          { role: "user", content: chapContent.slice(0, 2000) },
        ], 400);
        const parsed = JSON.parse(auditResult.replace(/`+"`"+`json|`+"`"+`/g, "").trim());
        auditIssues = parsed.issues || [];
      } catch {}

      // 4. 如果有严重问题，自动修正
      let fixed = false;
      if (auditIssues.filter(iss => iss.severity === "严重").length > 0) {
        try {
          const fixPrompt = buildChapterPrompt(currentIndex, currentPrevSummary, body) + "\n【必须修正以下问题】\n" + auditIssues.map(iss => "- " + iss.problem + "：" + iss.fix).join("\n");
          const fixResult = await callAI([
            { role: "system", content: "你是一个写小说的。重写这一章，修正所有问题。" },
            { role: "user", content: fixPrompt },
          ], 1800);
          const fixSummaryMatch = fixResult.match(/【本章摘要】：([\s\S]*)/);
          chapContent = fixResult.replace(/【本章摘要】：[\s\S]*/, "").trim();
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

  `;

c=c.replace(insertMarker, autoWriteCode + "\n  " + insertMarker);
fs.writeFileSync(p, c, "utf-8");
console.log("Auto-write engine inserted:", c.length, "chars");