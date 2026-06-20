export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-300 text-lg">加载中...</p>
      </div>
    </div>
  );
}
