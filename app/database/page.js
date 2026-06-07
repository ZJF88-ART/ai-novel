"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

function MarketHistory() {
  const [history, setHistory] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    try { setHistory(JSON.parse(localStorage.getItem("market-history") || "[]")); } catch {}
  }, []);

  const refresh = () => {
    try { setHistory(JSON.parse(localStorage.getItem("market-history") || "[]")); } catch {}
  };

  const deleteEntry = (id) => {
    const updated = history.filter(e => e.id !== id);
    setHistory(updated);
    localStorage.setItem("market-history", JSON.stringify(updated));
  };

  const updateLabel = (id, newLabel) => {
    const updated = history.map(e => e.id === id ? { ...e, label: newLabel } : e);
    setHistory(updated);
    localStorage.setItem("market-history", JSON.stringify(updated));
  };

  const updateNotes = (id, newNotes) => {
    const updated = history.map(e => e.id === id ? { ...e, notes: newNotes } : e);
    setHistory(updated);
    localStorage.setItem("market-history", JSON.stringify(updated));
  };

  if (history.length === 0) return (
    <p className="text-sm text-gray-500">暂无保存的调研数据。在首页完成市场调研后点击「💾 保存到数据库」即可在此查看。</p>
  );

  return (
    <div className="space-y-3">
      <button onClick={refresh} className="text-xs px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-gray-300">🔄 刷新列表</button>
      {history.map((entry) => (
        <div key={entry.id} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
          <div className="flex items-center gap-3 p-3">
            <span className="text-xs text-gray-400">{new Date(entry.savedAt).toLocaleString("zh-CN")}</span>
            <input
              className="flex-1 bg-transparent text-sm font-semibold text-gray-200 outline-none border-b border-transparent focus:border-indigo-500 px-2 py-1"
              value={entry.label}
              onChange={(e) => updateLabel(entry.id, e.target.value)}
            />
            <button onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
              className="text-xs px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-gray-300">
              {expanded === entry.id ? "收起" : "查看"}
            </button>
            <button onClick={() => { if (confirm("删除此记录？")) deleteEntry(entry.id); }}
              className="text-xs px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-all">删除</button>
          </div>
          {expanded === entry.id && (
            <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
              {/* Notes */}
              <div>
                <p className="text-xs text-gray-400 mb-1">笔记</p>
                <textarea
                  className="w-full bg-white/10 border border-white/10 rounded-lg p-3 text-sm text-gray-200 outline-none focus:border-indigo-500 resize-y"
                  rows={2}
                  value={entry.notes || ""}
                  onChange={(e) => updateNotes(entry.id, e.target.value)}
                  placeholder="添加笔记..."
                />
              </div>
              {/* Market overview summary */}
              {entry.marketData?.marketOverview && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">市场全景</p>
                  <p className="text-sm text-gray-300">{entry.marketData.marketOverview}</p>
                </div>
              )}
              {/* Genre analysis summary */}
              {(entry.marketData?.genreAnalysis || entry.deepMarketData?.hotBooks) && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">热门题材/书籍</p>
                  <div className="flex flex-wrap gap-1">
                    {(entry.marketData?.genreAnalysis || []).slice(0, 5).map((g, i) => (
                      <span key={i} className="text-xs bg-indigo-500/15 text-indigo-300 px-2 py-0.5 rounded-full">{g.genre} {g.heat}</span>
                    ))}
                    {(entry.deepMarketData?.hotBooks || []).slice(0, 3).map((b, i) => (
                      <span key={i} className="text-xs bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded-full">{b.title}</span>
                    ))}
                  </div>
                </div>
              )}
              {/* Notes from the entry */}
              {entry.notes && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">保存时笔记</p>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{entry.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function DatabasePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [notes, setNotes] = useState("");
  const [predictData, setPredictData] = useState(null);
  const [predictLoading, setPredictLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("db-notes");
    if (saved) setNotes(saved);
  }, []);
  useEffect(() => { localStorage.setItem("db-notes", notes); }, [notes]);

  useEffect(() => {
    // 先从 localStorage 读取缓存
    const cached = localStorage.getItem("trend-database");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const age = Date.now() - (parsed._cachedAt || 0);
        if (age < 3600000) { // 1小时内缓存
          setData(parsed);
          setLoading(false);
          return;
        }
      } catch {}
    }
    fetchTrendData();
  }, []);

  async function fetchTrendData() {
    setLoading(true);
    try {
      const provider = localStorage.getItem("ai-novel-autosave");
      let p = "deepseek";
      if (provider) {
        try { p = JSON.parse(provider).provider || "deepseek"; } catch {}
      }
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "trend_database", provider: p }),
      });
      const result = await res.json();
      result._cachedAt = Date.now();
      localStorage.setItem("trend-database", JSON.stringify(result));
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const tabs = [
    { label: "🏆 热门书籍", key: "hotBooks" },
    { label: "💥 爽点库", key: "satisfactionPoints" },
    { label: "🌍 世界观排行", key: "trendingWorldTypes" },
    { label: "👤 角色原型", key: "trendingCharacterTypes" },
    { label: "📊 类型热度", key: "trendingGenres" },
    { label: "📐 剧情模式", key: "plotPatterns" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">📊 网文市场数据库</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {data?.meta?.updatedAt ? `更新于 ${data.meta.updatedAt}` : "加载中..."}
              {data?.meta?.dataSource && ` · ${data.meta.dataSource}`}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchTrendData}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-medium transition-all disabled:opacity-50"
            >
              {loading ? "⏳ 刷新中..." : "🔄 刷新数据"}
            </button>
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-medium transition-all"
            >
              ← 返回写作
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {loading && !data && (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="text-5xl mb-4 animate-bounce">📊</div>
              <p className="text-lg text-gray-300">正在从 AI 获取最新市场数据...</p>
              <p className="text-sm text-gray-500 mt-2">首次加载需要约 15 秒</p>
            </div>
          </div>
        )}

        {data && (
          <>
            {/* Tab nav */}
            <div className="flex flex-wrap gap-2 mb-6">
              {tabs.map((tab, i) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(i)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTab === i
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                      : "bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 0: 热门书籍 */}
            {activeTab === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(data.hotBooks || []).map((b, i) => (
                  <div key={i} className="bg-white/5 rounded-2xl p-5 border border-white/10 hover:border-indigo-500/30 transition-all">
                    <div className="flex items-start gap-4">
                      <span className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-lg font-black shadow-lg">
                        {b.rank || i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-lg">{b.title}</h3>
                          <span className="text-xs bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full">{b.genre}</span>
                          <span className="text-xs text-gray-400">{b.author}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">👥 {b.readers || "热门"}</p>
                        <p className="text-sm text-gray-300 mt-2 leading-relaxed">{b.whyHot}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {(b.keySatisfactionPoints || []).map((sp, j) => (
                            <span key={j} className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">💥 {sp}</span>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {(b.innovations || []).map((inv, j) => (
                            <span key={j} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">✨ {inv}</span>
                          ))}
                        </div>
                        {b.worldType && <p className="text-xs text-gray-500 mt-1.5">🌍 世界观：{b.worldType}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 1: 爽点库 */}
            {activeTab === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(data.satisfactionPoints || []).map((sp, i) => (
                  <div key={i} className="bg-white/5 rounded-2xl p-5 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">💥</span>
                      <h3 className="font-bold">{sp.name}</h3>
                      <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">{sp.frequency}</span>
                    </div>
                    <p className="text-sm text-gray-300">{sp.desc}</p>
                    <p className="text-xs text-gray-500 mt-1">🧠 效果：{sp.effect}</p>
                    <p className="text-xs text-gray-400 mt-1">📝 {sp.usage}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(sp.worksWellWith || []).map((w, j) => (
                        <span key={j} className="text-xs bg-indigo-500/15 text-indigo-300 px-2 py-0.5 rounded-full">{w}</span>
                      ))}
                    </div>
                    <p className="text-xs text-amber-400 mt-1.5">📖 {sp.example}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 2: 世界观排行 */}
            {activeTab === 2 && (
              <div className="space-y-3">
                {(data.trendingWorldTypes || []).sort((a,b) => (b.heat||0) - (a.heat||0)).map((w, i) => (
                  <div key={i} className="bg-white/5 rounded-2xl p-5 border border-white/10 flex items-center gap-4">
                    <span className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-lg font-black">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-lg">{w.type}</h3>
                        <span className="text-sm text-amber-400">热度 {w.heat}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${w.newcomerFriendly ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
                          {w.newcomerFriendly ? "新人友好" : "竞争激烈"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mt-1">{w.reason}</p>
                      <p className="text-xs text-gray-500">👥 {w.readerGroup}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(w.keyElements || []).map((ke, j) => (
                          <span key={j} className="text-xs bg-blue-500/15 text-blue-300 px-2 py-0.5 rounded-full">{ke}</span>
                        ))}
                      </div>
                      {/* Heat bar */}
                      <div className="mt-2 bg-white/10 rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{width: `${w.heat || 50}%`}} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: 角色原型 */}
            {activeTab === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(data.trendingCharacterTypes || []).map((c, i) => (
                  <div key={i} className="bg-white/5 rounded-2xl p-5 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">👤</span>
                      <h3 className="font-bold">{c.archetype}</h3>
                      <span className="text-xs text-amber-400 ml-auto">热度 {c.heat}</span>
                    </div>
                    <p className="text-sm text-gray-400">{c.whyPopular}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(c.traits || []).map((t, j) => (
                        <span key={j} className="text-xs bg-pink-500/15 text-pink-300 px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {(c.fitWorldTypes || []).map((fw, j) => (
                        <span key={j} className="text-xs bg-indigo-500/15 text-indigo-300 px-2 py-0.5 rounded-full">{fw}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 4: 类型热度 */}
            {activeTab === 4 && (
              <div className="space-y-3">
                {(data.trendingGenres || []).sort((a,b) => (b.heat||0) - (a.heat||0)).map((g, i) => (
                  <div key={i} className="bg-white/5 rounded-2xl p-5 border border-white/10 flex items-center gap-4">
                    <span className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-lg font-black">#{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-lg">{g.genre}</h3>
                        <span className="text-sm text-amber-400">热度 {g.heat}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${g.trend?.includes("上升") ? "bg-green-500/20 text-green-300" : g.trend?.includes("下降") ? "bg-red-500/20 text-red-300" : "bg-gray-500/20 text-gray-300"}`}>{g.trend}</span>
                      </div>
                      <p className="text-xs text-gray-500">👥 {g.avgReaders}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(g.subGenres || []).map((sg, j) => (
                          <span key={j} className="text-xs bg-orange-500/15 text-orange-300 px-2 py-0.5 rounded-full">{sg}</span>
                        ))}
                        {(g.tags || []).map((t, j) => (
                          <span key={j} className="text-xs bg-blue-500/15 text-blue-300 px-2 py-0.5 rounded-full">#{t}</span>
                        ))}
                      </div>
                      <div className="mt-2 bg-white/10 rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full" style={{width: `${g.heat || 50}%`}} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 5: 剧情模式 */}
            {activeTab === 5 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(data.plotPatterns || []).map((pp, i) => (
                  <div key={i} className="bg-white/5 rounded-2xl p-5 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">📐</span>
                      <h3 className="font-bold">{pp.name}</h3>
                      <span className="text-xs bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full ml-auto">{pp.bestGenre}</span>
                    </div>
                    <p className="text-sm text-gray-300">{pp.desc}</p>
                    <p className="text-xs text-green-400 mt-1">✅ {pp.effectiveness}</p>
                    <p className="text-xs text-yellow-400 mt-0.5">⚠️ {pp.risk}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* 预测区域 */}
        {data?.hotBooks?.length > 0 && (
          <div className="mt-8 bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-bold mb-4">🔮 作品预测</h2>
            <p className="text-sm text-gray-400 mb-4">基于数据库中的热书数据，预测你的作品发布表现</p>
            <button
              onClick={async () => {
                setPredictLoading(true);
                try {
                  const saved = localStorage.getItem("ai-novel-autosave");
                  let bookInfo = {};
                  if (saved) {
                    const d = JSON.parse(saved);
                    bookInfo = {
                      worldType: d.worldType,
                      style: d.customStyle || d.style,
                      protagonist: d.protagonist?.name,
                      chapterCount: (d.outline || []).filter(c => c.summary).length,
                    };
                  }
                  const provider = saved ? (JSON.parse(saved).provider || "deepseek") : "deepseek";
                  const res = await fetch("/api/generate", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ mode: "predict", bookInfo, trendDB: data, provider }),
                  });
                  setPredictData(await res.json());
                } catch (err) { alert("预测失败: " + err.message); }
                finally { setPredictLoading(false); }
              }}
              disabled={predictLoading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 transition-all"
            >
              {predictLoading ? "⏳ 分析中..." : "🔮 预测我的作品表现"}
            </button>

            {predictData && (
              <div className="mt-4 space-y-4">
                {/* 评分 */}
                {predictData.score && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {Object.entries(predictData.score).map(([k, v]) => (
                      <div key={k} className="bg-white/5 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-400">{k === "overall" ? "总分" : k === "story" ? "故事" : k === "characters" ? "角色" : k === "marketFit" ? "市场匹配" : "创新"}</p>
                        <p className={`text-2xl font-black ${v >= 80 ? "text-green-400" : v >= 60 ? "text-amber-400" : "text-red-400"}`}>{v}</p>
                      </div>
                    ))}
                  </div>
                )}
                {predictData.verdict && (
                  <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
                    <p className="text-sm text-amber-300 font-semibold">📢 {predictData.verdict}</p>
                  </div>
                )}
                {/* 读者预估 */}
                {predictData.readershipPrediction && (
                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">👥 读者预估</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center"><p className="text-xs text-gray-500">保守</p><p className="text-lg font-bold text-green-400">{predictData.readershipPrediction.lowEstimate}</p></div>
                      <div className="text-center"><p className="text-xs text-gray-500">中等</p><p className="text-lg font-bold text-amber-400">{predictData.readershipPrediction.midEstimate}</p></div>
                      <div className="text-center"><p className="text-xs text-gray-500">乐观</p><p className="text-lg font-bold text-red-400">{predictData.readershipPrediction.highEstimate}</p></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">首周：{predictData.readershipPrediction.firstWeekPrediction}</p>
                    <p className="text-xs text-gray-400">长尾：{predictData.readershipPrediction.longTailPotential}</p>
                  </div>
                )}
                {/* SWOT */}
                {predictData.strengthsWeaknesses && (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["💪 优势","strengths","green"],["⚠️ 劣势","weaknesses","red"],
                      ["🚀 机会","opportunities","blue"],["⚡ 威胁","threats","yellow"]
                    ].map(([label,key,color]) => (
                      <div key={key} className="bg-white/5 rounded-xl p-3">
                        <h4 className="text-sm font-semibold mb-1">{label}</h4>
                        {(predictData.strengthsWeaknesses[key]||[]).map((s,i) => (
                          <p key={i} className={`text-xs text-${color}-400`}>• {s}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
                {/* 对比分析 */}
                {predictData.comparison?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">📊 与热书对比</h4>
                    <div className="space-y-2">
                      {predictData.comparison.map((c,i) => (
                        <div key={i} className="bg-white/5 rounded-lg p-3 text-sm">
                          <span className="text-gray-400">{c.aspect}：</span>
                          <span className="text-gray-300">本书 {c.currentBook}</span>
                          <span className="text-amber-400"> vs 热书 {c.hotBook}</span>
                          <p className="text-xs text-gray-500 mt-0.5">差距：{c.gap} → {c.suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 手动笔记 */}
        <div className="mt-8 bg-white/5 rounded-2xl p-6 border border-white/10">
          <h2 className="text-xl font-bold mb-4">📝 手动笔记</h2>
          <textarea
            className="w-full h-48 bg-white/10 border border-white/10 rounded-xl p-4 text-sm text-gray-200 outline-none focus:border-indigo-500 resize-y placeholder-gray-500"
            placeholder="在这里记录你的市场观察、灵感、人物构思笔记..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-2">自动保存到浏览器 · {notes.length} 字</p>
        </div>

        {/* 市场调研历史记录 */}
        <div className="mt-8 bg-white/5 rounded-2xl p-6 border border-white/10">
          <h2 className="text-xl font-bold mb-4">📦 调研历史记录</h2>
          <MarketHistory />
        </div>
      </div>
    </div>
  );
}
