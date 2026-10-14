import React, { useState, useEffect, useMemo, useCallback } from "react";
import { auth } from "../../firebaseConfig.js";
import { onAuthStateChanged } from "firebase/auth";
import { ChevronLeft, ChevronRight, Plus, Trash2, Check, PartyPopper } from "lucide-react";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const COUNTRIES = [
  { code: "IN", name: "India" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
];

const toKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Monday-first 6x7 grid for the given month
function buildGrid(year, month) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // Mon = 0
  const start = new Date(year, month, 1 - offset);
  return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}

const CalendarPage = () => {
  const [uid, setUid] = useState(null);
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState(() => new Date());
  const [tasks, setTasks] = useState({});
  const [holidays, setHolidays] = useState({});
  const [country, setCountry] = useState(() => localStorage.getItem("cal_country") || "IN");
  const [draft, setDraft] = useState("");
  const [loadingHolidays, setLoadingHolidays] = useState(false);

  const storageKey = uid ? `cal_tasks_${uid}` : "cal_tasks_guest";

  useEffect(() => onAuthStateChanged(auth, (u) => setUid(u ? u.uid : null)), []);

  // load tasks whenever the user changes
  useEffect(() => {
    try {
      setTasks(JSON.parse(localStorage.getItem(storageKey) || "{}"));
    } catch {
      setTasks({});
    }
  }, [storageKey]);

  const persist = useCallback(
    (next) => {
      setTasks(next);
      localStorage.setItem(storageKey, JSON.stringify(next));
    },
    [storageKey]
  );

  // fetch public holidays for the visible year
  useEffect(() => {
    const year = cursor.getFullYear();
    let cancelled = false;
    setLoadingHolidays(true);
    fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => {
        if (cancelled) return;
        const map = {};
        (list || []).forEach((h) => {
          map[h.date] = map[h.date] || [];
          map[h.date].push(h.localName || h.name);
        });
        setHolidays(map);
      })
      .catch(() => !cancelled && setHolidays({}))
      .finally(() => !cancelled && setLoadingHolidays(false));
    return () => {
      cancelled = true;
    };
  }, [cursor.getFullYear(), country]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => localStorage.setItem("cal_country", country), [country]);

  const grid = useMemo(() => buildGrid(cursor.getFullYear(), cursor.getMonth()), [cursor]);
  const todayKey = toKey(new Date());
  const selectedKey = toKey(selected);
  const selectedTasks = tasks[selectedKey] || [];

  const addTask = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    persist({
      ...tasks,
      [selectedKey]: [...selectedTasks, { id: Date.now(), text, done: false }],
    });
    setDraft("");
  };

  const toggleTask = (id) =>
    persist({
      ...tasks,
      [selectedKey]: selectedTasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    });

  const removeTask = (id) => {
    const next = { ...tasks, [selectedKey]: selectedTasks.filter((t) => t.id !== id) };
    if (!next[selectedKey].length) delete next[selectedKey];
    persist(next);
  };

  const shift = (n) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + n, 1));
  const goToday = () => {
    const now = new Date();
    setCursor(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelected(now);
  };

  const monthHolidays = Object.entries(holidays)
    .filter(([d]) => {
      const dt = new Date(d);
      return dt.getFullYear() === cursor.getFullYear() && dt.getMonth() === cursor.getMonth();
    })
    .sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <div className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Calendar</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              {MONTHS[cursor.getMonth()]} <span className="text-slate-400">{cursor.getFullYear()}</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-blue-600"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code} className="text-slate-900">
                  {c.name}
                </option>
              ))}
            </select>
            <button onClick={goToday} className="rounded-md border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
              Today
            </button>
            <button onClick={() => shift(-1)} className="rounded-md border border-slate-300 dark:border-slate-700 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => shift(1)} className="rounded-md border border-slate-300 dark:border-slate-700 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
          {/* Month grid */}
          <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
              {WEEKDAYS.map((d) => (
                <div key={d} className="px-2 py-2 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {grid.map((day, i) => {
                const key = toKey(day);
                const inMonth = day.getMonth() === cursor.getMonth();
                const isToday = key === todayKey;
                const isSelected = key === selectedKey;
                const dayTasks = tasks[key] || [];
                const dayHolidays = holidays[key] || [];

                return (
                  <button
                    key={key + i}
                    onClick={() => setSelected(day)}
                    className={[
                      "min-h-[92px] border-b border-r border-slate-200 dark:border-slate-800 p-2 text-left align-top transition",
                      inMonth ? "" : "bg-slate-50/60 dark:bg-slate-900/30 text-slate-400",
                      isSelected ? "ring-2 ring-inset ring-blue-600" : "hover:bg-slate-50 dark:hover:bg-slate-900/50",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                        isToday ? "bg-blue-600 text-white" : "",
                      ].join(" ")}
                    >
                      {day.getDate()}
                    </span>

                    {dayHolidays.length > 0 && (
                      <p className="mt-1 truncate text-[10px] font-medium text-amber-600 dark:text-amber-400">
                        {dayHolidays[0]}
                      </p>
                    )}

                    <div className="mt-1 space-y-0.5">
                      {dayTasks.slice(0, 2).map((t) => (
                        <p
                          key={t.id}
                          className={`truncate rounded bg-blue-50 dark:bg-blue-950/50 px-1 py-0.5 text-[10px] ${
                            t.done ? "line-through text-slate-400" : "text-blue-700 dark:text-blue-300"
                          }`}
                        >
                          {t.text}
                        </p>
                      ))}
                      {dayTasks.length > 2 && (
                        <p className="text-[10px] text-slate-400">+{dayTasks.length - 2} more</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Side panel */}
          <aside className="space-y-6">
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400">Selected</p>
              <h2 className="mt-0.5 text-lg font-semibold">
                {selected.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
              </h2>

              {(holidays[selectedKey] || []).map((h) => (
                <p key={h} className="mt-2 flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400">
                  <PartyPopper size={14} /> {h}
                </p>
              ))}

              <form onSubmit={addTask} className="mt-4 flex gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Add a to-do…"
                  className="flex-1 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-600"
                />
                <button type="submit" className="rounded-md bg-blue-600 px-3 text-white hover:bg-blue-700">
                  <Plus size={16} />
                </button>
              </form>

              <ul className="mt-3 space-y-1">
                {selectedTasks.length === 0 && (
                  <li className="py-4 text-sm text-slate-400">Nothing planned yet.</li>
                )}
                {selectedTasks.map((t) => (
                  <li key={t.id} className="group flex items-center gap-2 rounded-md px-1 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-900">
                    <button
                      onClick={() => toggleTask(t.id)}
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                        t.done ? "border-blue-600 bg-blue-600 text-white" : "border-slate-400"
                      }`}
                    >
                      {t.done && <Check size={11} />}
                    </button>
                    <span className={`flex-1 text-sm ${t.done ? "line-through text-slate-400" : ""}`}>{t.text}</span>
                    <button onClick={() => removeTask(t.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400">
                Holidays this month {loadingHolidays && "…"}
              </p>
              <ul className="mt-2 space-y-2">
                {monthHolidays.length === 0 && !loadingHolidays && (
                  <li className="text-sm text-slate-400">No public holidays.</li>
                )}
                {monthHolidays.map(([date, names]) => (
                  <li key={date} className="flex gap-3 text-sm">
                    <span className="w-6 shrink-0 font-medium text-slate-400">{new Date(date).getDate()}</span>
                    <span>{names.join(", ")}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
