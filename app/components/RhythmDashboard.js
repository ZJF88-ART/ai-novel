"use client";

import { useState } from "react";

export default function RhythmDashboard({ lang, t, apiFetch, outline }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);
    try {
      const contents = outline.filter(c => c.content).map(c => c.content).slice(-8);
      if (contents.length < 2) return;
      const result = await apiFetch({ mode: "rhythm_analysis", chapterContents: contents });
      setData(result);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const getColor = (tension) => {
    if (tension >= 80) return "from-red-500 to-orange-500";
    if (tension >= 50) return "from-amber-500 to-yellow-500";
    return "from-green-500 to-emerald-500";
  };

  const getTypeIcon = (type) => {
    const map = { fight: "⚔️", reveal: "💡", daily: "☕", transition: "➡️" };
    return map[type] || "📖";
  };

  const getSuggestionBg = (data) => {
    if (!data?.suggestion) return "";
    if (data.suggestion.includes("日常") || data.suggestion.includes("喘息")) return "bg-green-50 border-green-200 text-green-700";
    if (data.suggestion.includes("战斗") || data.suggestion.includes("高潮")) return "bg-red-50 border-red-200 text-red-700";
    if (data.suggestion.includes("伏笔") || data.suggestion.includes("悬念")) return "bg-purple-50 border-purple-200 text-purple-700";
    return "bg-blue-50 border-blue-200 text-blue-700";
  };

  return (
    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl border border-teal-200 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-teal-900 text-sm">节奏仪表盘</h3>
        <button
          onClick={analyze}
          disabled={loading || outline.filter(c => c.content).length < 2}
          className="px-3 py-1.5 rounded-lg bg-teal-500 text-white text-xs font-medium hover:bg-teal-600 disabled:opacity-50 transition-all"
        >
          {loading ? "..." : "分析"}
        </button>
      </div>

      {!data && !loading && (
        <p className="text-xs text-teal-600/70">写够2章后点击分析，查看节奏是否单调</p>
      )}

      {data?.chapters?.length > 0 && (
        <div className="space-y-3">
          {/* Tension bars */}
          <div className="space-y-1">
            {data.chapters.map((ch, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-10 shrink-0">第{ch.chapter}章</span>
                <span className="text-xs w-5">{getTypeIcon(ch.type)}</span>
                <div className="flex-1 bg-white rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getColor(ch.tension)} rounded-full transition-all`}
                    style={{ width: `${ch.tension || 50}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-8 text-right">{ch.tension || "-"}</span>
              </div>
            ))}
          </div>

          {/* Fatigue warning */}
          {data.fatigueIndex > 70 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-600">
              读者疲劳度 {data.fatigueIndex}/100 —— 建议插入日常
            </div>
          )}

          {/* Suggestion */}
          {data.suggestion && (
            <div className={`rounded-lg p-2 text-xs border ${getSuggestionBg(data)}`}>
              下一章建议：{data.suggestion}
            </div>
          )}

          {/* Curve label */}
          {data.curve && (
            <p className="text-xs text-gray-400">
              节奏曲线：{data.curve === "rising" ? "上升" : data.curve === "falling" ? "下降" : data.curve === "flat" ? "平缓" : "过山车"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}