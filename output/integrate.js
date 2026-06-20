const fs=require("fs");
const p="C:/Users/周进法/Desktop/ai-novel/app/page.js";
let c=fs.readFileSync(p,"utf-8");

// Add imports
const importLine = 'import CollapsibleCard from "./components/CollapsibleCard";';
c=c.replace(importLine, importLine+'\nimport CharacterBible from "./components/CharacterBible";\nimport RhythmDashboard from "./components/RhythmDashboard";\nimport SurpriseConnect from "./components/SurpriseConnect";');

// Find where to insert the components in the JSX - after the tracker section in the left panel
// Look for "故事追踪" or the tracker section end marker
// Let me insert them in the left panel, after the tracker
const trackerEndMarker = '{trackerData && (';
const tIdx = c.lastIndexOf(trackerEndMarker);
if(tIdx<0){console.log("Tracker not found, trying alt"); }

// Instead, find the closing of the left panel right before the main content
// Look for the closing div of left panel before "右边" or "main" section
const leftPanelEnd = '      </main>';
const lIdx = c.lastIndexOf(leftPanelEnd);
if(lIdx<0){console.log("Left panel end not found");process.exit(1);}

const before = c.substring(0, lIdx);

// Insert the three components before </main>
const insertBlock = `
        {/* 🔮 爆款神器三板斧 */}
        <CharacterBible lang={lang} t={T} apiFetch={apiFetch} outline={outline} />
        <RhythmDashboard lang={lang} t={T} apiFetch={apiFetch} outline={outline} />
        <SurpriseConnect lang={lang} t={T} apiFetch={apiFetch} trackerData={trackerData} protagonist={protagonist} allies={allies} enemies={enemies} />

      </main>`;

c = before + insertBlock;
fs.writeFileSync(p, c, "utf-8");
console.log("Page.js updated:", c.length, "chars");