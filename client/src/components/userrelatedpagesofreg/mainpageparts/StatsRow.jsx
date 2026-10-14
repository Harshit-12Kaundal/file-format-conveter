// src/components/Main/components/StatsRow.jsx
import { TYPE_LABEL } from "./Constants.js";

export default function StatsRow({ history, changeLog }) {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const totalConversions = history.length;
  const thisWeek = history.filter((h) => new Date(h.time) >= weekAgo).length;

  const typeCounts = {};
  history.forEach((h) => {
    typeCounts[h.type] = (typeCounts[h.type] || 0) + 1;
  });
  const topTypeEntry = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
  const topType = topTypeEntry ? (TYPE_LABEL[topTypeEntry[0]] || topTypeEntry[0]) : "—";

  // Simple current streak: consecutive days (from today backward) with at least one change
  let streak = 0;
  const daysWithActivity = new Set(changeLog.map((c) => new Date(c.date).toDateString()));
  for (let i = 0; i < 365; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    if (daysWithActivity.has(d.toDateString())) streak++;
    else break;
  }

  const stats = [
    { label: "Total files", value: totalConversions, accent: "text-blue-600 dark:text-blue-400" },
    { label: "This week", value: thisWeek, accent: "text-emerald-600 dark:text-emerald-400" },
    { label: "Most used", value: topType, accent: "text-purple-600 dark:text-purple-400" },
    { label: "Day streak", value: streak, accent: "text-amber-600 dark:text-amber-400" },
  ];

  return (
    <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl border border-gray-200 bg-white p-3.5 dark:border-gray-800 dark:bg-gray-950"
        >
          <p className={`text-xl font-semibold tracking-tight ${s.accent}`}>{s.value}</p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
        </div>
      ))}
    </div>
  );
}