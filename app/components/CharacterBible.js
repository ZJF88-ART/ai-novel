"use client";

import { useState } from "react";

export default function CharacterBible({ lang, t, apiFetch, outline }) {
  const [bible, setBible] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const fetchBible = async () => {
    setLoading(true);
    try {
      const contents = outline.filter(c => c.content).map(c => c.content).slice(-10);
      const existing = JSON.parse(localStorage.getItem("character-bible") || "{}");
      const data = await apiFetch({ mode: "character_bible", chapterContents: contents, existingBible: existing });
      localStorage.setItem("character-bible", JSON.stringify(data));
      setBible(data);
    } catch (err) { /* silent */ }
    finally { setLoading(false); }
  };

  const chars = bible?.characters || {};
  const charList = Object.keys(chars);

  return (
    <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl border border-violet-200 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-violet-900 text-sm">角色圣经</h3>
        <button
          onClick={fetchBible}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-violet-500 text-white text-xs font-medium hover:bg-violet-600 disabled:opacity-50 transition-all"
        >
          {loading ? "..." : bible ? "刷新" : "生成"}
        </button>
      </div>

      {!bible && !loading && (
        <p className="text-xs text-violet-600/70">点击生成角色档案，追踪每个角色的变化</p>
      )}

      {charList.length > 0 && (
        <div className="space-y-2">
          {charList.map(name => {
            const ch = chars[name];
            return (
              <div key={name} className="bg-white rounded-xl p-3 border border-violet-100">
                <button onClick={() => setExpanded(expanded === name ? null : name)}
                  className="w-full flex items-center justify-between text-left">
                  <span className="font-semibold text-sm text-gray-800">{name}</span>
                  <span className="text-xs text-violet-400">{expanded === name ? "收起" : "详情"}</span>
                </button>
                {expanded === name && (
                  <div className="mt-2 space-y-1.5 text-xs text-gray-600 border-t border-violet-50 pt-2">
                    {ch.personalitySnapshot && <p><span className="text-violet-500">性格：</span>{ch.personalitySnapshot}</p>}
                    {ch.signatureLine && <p><span className="text-violet-500">金句：</span>&ldquo;{ch.signatureLine}&rdquo;</p>}
                    {ch.habits?.length > 0 && <p><span className="text-violet-500">习惯：</span>{ch.habits.join("、")}</p>}
                    {ch.secrets?.length > 0 && <div className="bg-amber-50 rounded-lg p-2 mt-1"><span className="text-amber-600">秘密：</span>{ch.secrets.join("；")}</div>}
                    {ch.recentChange && <p><span className="text-blue-500">最近变化：</span>{ch.recentChange}</p>}
                    {ch.readerImpression && <p><span className="text-green-500">读者感受：</span>{ch.readerImpression}</p>}
                  </div>
                )}
              </div>
            );
          })}
          {bible?.chemistryPairs?.length > 0 && (
            <div className="mt-3 pt-3 border-t border-violet-200">
              <p className="text-xs font-semibold text-violet-700 mb-1">角色化学反应</p>
              {bible.chemistryPairs.map((cp, i) => (
                <p key={i} className="text-xs text-gray-600">
                  {cp.pair?.[0]} + {cp.pair?.[1]}：{cp.dynamic}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}