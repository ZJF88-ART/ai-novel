const fs=require("fs");
const p="C:/Users/周进法/Desktop/ai-novel/app/page.js";
let c=fs.readFileSync(p,"utf-8");

// Fix: Remove duplicate incrementUsage from functions that call callAPI (which already increments)
// generateMoreOpenings: remove the duplicate incrementUsage
c=c.replace(/if \(data\?\.ideas\) \{ setOpeningIdeas\(\[\.\.\.openingIdeas, \.\.\.data\.ideas\]\); incrementUsage\(\); setUsage\(getUsageData\(\)\); \}/,
  "if (data?.ideas) { setOpeningIdeas([...openingIdeas, ...data.ideas]); setUsage(getUsageData()); }");

// refineOpeningIdea: remove duplicate incrementUsage  
c=c.replace(/if \(data\?\.ideas\?\.length > 0\) \{ const ni = \[\.\.\.openingIdeas\]; ni\[index\] = \{ \.\.\.ni\[index\], refined: data\.ideas \}; setOpeningIdeas\(ni\); incrementUsage\(\); setUsage\(getUsageData\(\)\); \}/,
  "if (data?.ideas?.length > 0) { const ni = [...openingIdeas]; ni[index] = { ...ni[index], refined: data.ideas }; setOpeningIdeas(ni); setUsage(getUsageData()); }");

// fetchContinuationIdeas: remove duplicate incrementUsage
c=c.replace(/if \(data\?\.ideas\) \{ setContinuationIdeas\(data\.ideas\); incrementUsage\(\); setUsage\(getUsageData\(\)\); \}/,
  "if (data?.ideas) { setContinuationIdeas(data.ideas); setUsage(getUsageData()); }");

fs.writeFileSync(p, c, "utf-8");
console.log("Frontend patch applied:",c.length,"chars");