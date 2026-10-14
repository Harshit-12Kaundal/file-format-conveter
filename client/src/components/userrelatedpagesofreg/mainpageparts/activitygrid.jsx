// src/components/Main/components/ActivityGrid.jsx
import { useState } from "react";
import { LEVEL_CLASSES } from "./Constants.js";
import { localDateKey, levelForCount } from "./helper.js";

export default function ActivityGrid({ changes }) {
  const [hovered, setHovered] = useState(null);

  const weeksCount = 9;
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const countsByDate = {};
  changes.forEach((c) => {
    const key = localDateKey(new Date(c.date));
    countsByDate[key] = (countsByDate[key] || 0) + 1;
  });

  for (let i = weeksCount * 7 - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = localDateKey(d);
    days.push({ date: key, count: countsByDate[key] || 0 });
  }

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  const total = changes.length; // ALL logged changes, not just ones landing in a visible day bucket

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-400">Activity</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">{total} changes in the last {weeksCount} weeks</span>
      </div>

      <div className="flex gap-[3px] overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day) => (
              <button
                type="button"
                key={day.date}
                onMouseEnter={() => setHovered(day)}
                onMouseLeave={() => setHovered(null)}
                className={`h-2.5 w-2.5 rounded-sm ${LEVEL_CLASSES[levelForCount(day.count)]} transition hover:ring-1 hover:ring-blue-500`}
                title={`${day.count} change${day.count === 1 ? "" : "s"} on ${day.date}`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{hovered ? `${hovered.count} change${hovered.count === 1 ? "" : "s"} · ${hovered.date}` : "Hover a square for details"}</span>
        <div className="flex items-center gap-1">
          <span>Less</span>
          {LEVEL_CLASSES.map((c, i) => (
            <span key={i} className={`h-2.5 w-2.5 rounded-sm ${c}`} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}