"use client";

export default function Error({ error, reset }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md px-6">
        <div className="text-5xl">⚠️</div>
        <h1 className="text-2xl font-bold text-white">页面出错了</h1>
        <p className="text-gray-400 text-sm">{error?.message || "发生了意外错误"}</p>
        <button
          onClick={reset}
          className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-all"
        >
          重新加载
        </button>
      </div>
    </div>
  );
}
