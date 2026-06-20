"use client";

import { useState } from "react";

export default function SurpriseConnect({ lang, t, apiFetch, trackerData, protagonist, allies, enemies }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const connect = async () => {
    setLoading(true);
    try {
      const threads = trackerData?.plotThreads || [];
      if (threads.length < 2) return;
      const charInfo = {
        protagonist: { name: protagonist?.name, role: "主角" },
        allies: allies?.map(a => ({ name: a.name, role: a.relation })),
        enemies: enemies?.map(e => ({ name: e.name, role: e.relation }))
      };
      const result = await apiFetch({ mode: "plot_connect", plotThreads: threads, characterInfo: charInfo });
      setData(result);
      setHistory(prev => [{ ...result, _time: Date.now() }, ...prev].slice(0, 20));
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-amber-900 text-sm">惊喜连接</h3>
        <button
          onClick={connect}
          disabled={loading || !trackerData?.plotThreads?.length}
          className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-medium hover:bg-amber-600 disabled:opacity-50 transition-all"
        >
          {loading ? "..." : "发现关联"}
        </button>
      </div>

      {!data && !loading && !trackerData?.plotThreads?.length && (
        <p className="text-xs text-amber-600/70">先生成故事追踪，发现伏笔后可寻找隐藏关联</p>
      )}

      {!data && !loading && trackerData?.plotThreads?.length > 0 && (
        <p className="text-xs text-amber-600/70">AI 会在你的伏笔之间找到你没想到的关联</p>
      )}

      {data?.connections?.length > 0 && (
        <div className="space-y-2">
          {data.connections.map((conn, i) => (
            <div key={i} className={`bg-white rounded-xl p-3 border ${conn.surpriseLevel === "A" ? "border-red-200 bg-red-50/30" : conn.surpriseLevel === "S" ? "border-purple-200 bg-purple-50/30" : "border-amber-100"}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${conn.surpriseLevel === "A" ? "bg-red-500 text-white" : conn.surpriseLevel === "S" ? "bg-purple-500 text-white" : "bg-amber-400 text-white"}`}>
                  {conn.surpriseLevel || "B"}
                </span>
                <span className="text-xs text-gray-500">{conn.threadA} + {conn.threadB}</span>
              </div>
              <p className="text-sm text-gray-700 font-medium">{conn.connection}</p>
              {conn.mergeIdea && <p className="text-xs text-amber-600 mt-1">合并：{conn.mergeIdea}</p>}
              {conn.impactOnCharacters?.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {conn.impactOnCharacters.map((c, j) => (
                    <span key={j} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{c}</span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {data.masterKey && (
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-3 border border-purple-200 mt-2">
              <p className="text-xs text-purple-500 font-semibold mb-1">最佳惊喜</p>
              <p className="text-sm text-purple-800">{data.masterKey}</p>
            </div>
          )}
        </div>
      )}

      {history.length > 0 && !data && (
        <div className="text-xs text-gray-400">最近一次分析：{new Date(history[0]._time).toLocaleTimeString("zh-CN")}</div>
      )}
    </div>
  );
}