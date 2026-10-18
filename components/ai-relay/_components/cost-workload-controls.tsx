export function CostWorkloadControls({
  dailyRequests,
  setDailyRequests,
  avgPromptTokens,
  setAvgPromptTokens,
  avgCompletionTokens,
  setAvgCompletionTokens,
}: {
  dailyRequests: number;
  setDailyRequests: (value: number) => void;
  avgPromptTokens: number;
  setAvgPromptTokens: (value: number) => void;
  avgCompletionTokens: number;
  setAvgCompletionTokens: (value: number) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {/* Daily requests */}
      <div className="space-y-2 rounded-lg border bg-white p-3.5 shadow-2xs">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">
            Permintaan / Hari
          </span>
          <span className="font-mono text-sm font-bold text-indigo-600">
            {dailyRequests.toLocaleString("id-ID")} req
          </span>
        </div>
        <input
          type="range"
          aria-label="Permintaan per hari"
          min="10"
          max="3000"
          step="10"
          value={dailyRequests}
          onChange={(e) => setDailyRequests(Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600"
        />
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>10 req</span>
          <span>1,500</span>
          <span>3,000 req</span>
        </div>
      </div>

      {/* Prompt tokens */}
      <div className="space-y-2 rounded-lg border bg-white p-3.5 shadow-2xs">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">Rata-rata Prompt</span>
          <span className="font-mono text-sm font-bold text-indigo-600">
            {avgPromptTokens.toLocaleString("id-ID")} tokens
          </span>
        </div>
        <input
          type="range"
          aria-label="Rata-rata token prompt"
          min="200"
          max="8000"
          step="100"
          value={avgPromptTokens}
          onChange={(e) => setAvgPromptTokens(Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600"
        />
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>200 tokens</span>
          <span>4,000</span>
          <span>8,000 tokens</span>
        </div>
      </div>

      {/* Completion tokens */}
      <div className="space-y-2 rounded-lg border bg-white p-3.5 shadow-2xs">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">
            Rata-rata Completion
          </span>
          <span className="font-mono text-sm font-bold text-indigo-600">
            {avgCompletionTokens.toLocaleString("id-ID")} tokens
          </span>
        </div>
        <input
          type="range"
          aria-label="Rata-rata token completion"
          min="50"
          max="3000"
          step="50"
          value={avgCompletionTokens}
          onChange={(e) => setAvgCompletionTokens(Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600"
        />
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>50 tokens</span>
          <span>1,500</span>
          <span>3,000 tokens</span>
        </div>
      </div>
    </div>
  );
}
