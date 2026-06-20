const fs=require("fs");
const p="C:/Users/周进法/Desktop/ai-novel/app/api/generate/route.js";
let c=fs.readFileSync(p,"utf-8");

// Fix 1: Strip GET endpoint info
c=c.replace(/export async function GET\(\) \{[\s\S]*?\n\}/, 'export async function GET() {\n  return Response.json({ status: "ok" });\n}');

// Fix 2: Remove apiKey from destructuring
c=c.replace(", apiKey ","");

// Fix 3: Remove apiKey || from provider configs
c=c.replace(/key: apiKey \|\| process\.env\.DEEPSEEK_API_KEY/g, "key: process.env.DEEPSEEK_API_KEY");
c=c.replace(/key: apiKey \|\| process\.env\.ZHIPU_API_KEY/g, "key: process.env.ZHIPU_API_KEY");
c=c.replace(/key: apiKey \|\| process\.env\.AGNES_API_KEY/g, "key: process.env.AGNES_API_KEY");

// Fix 4: Add server-side rate limit at top of POST
const rateLimitCode = `// IP限速: 每分钟30次
const rateMap = new Map();
function checkRate(ip) { const n=Date.now(); const e=rateMap.get(ip); if(e&&n-e.t<60000){if(e.c>=30)return false;e.c++}else{rateMap.set(ip,{t:n,c:1})}; if(rateMap.size>5000){for(const[k,v]of rateMap){if(n-v.t>120000)rateMap.delete(k)}} return true }

export async function POST(req) {
  const clientIp = req.headers.get("x-forwarded-for") || "unknown";
  if(!checkRate(clientIp)) return Response.json({error:"请求太频繁，每分钟30次限制"},{status:429});
`;
c=c.replace("export async function POST(req) {", rateLimitCode);

// Fix 5: Add timeout to callAI
c=c.replace("const res = await fetch(selected.url, {","const ctrl=new AbortController(); const to=setTimeout(()=>ctrl.abort(),45000);\n      const res = await fetch(selected.url, {signal:ctrl.signal,");
c=c.replace('throw new Error(`API ${res.status}: ${errText.slice(0, 200)}`);','clearTimeout(to);\n        throw new Error(`API ${res.status}: ${errText.slice(0, 200)}`);');

fs.writeFileSync(p, c, "utf-8");
console.log("Patched:",c.length,"chars");