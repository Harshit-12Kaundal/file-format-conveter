import { useMemo, useState } from "react";
import { Search, FileText, FileSpreadsheet, Image as ImageIcon, X, Plus } from "lucide-react";

/**
 * Modernized "My Work" sidebar.
 * Same palette as before (blue-600 accent, gray-50/900 surfaces) but with:
 *  - a search field to filter recent files
 *  - date-grouped sections (Today / Yesterday / This week / Older)
 *  - per-filetype icon + accent color instead of one flat blue icon for everything
 *  - a hover-reveal remove (x) button per item
 */

const EXT_STYLE = {
  pdf: { icon: FileText, wrap: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" },
  docx: { icon: FileText, wrap: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" },
  doc: { icon: FileText, wrap: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" },
  xlsx: { icon: FileSpreadsheet, wrap: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" },
  csv: { icon: FileSpreadsheet, wrap: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" },
  png: { icon: ImageIcon, wrap: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400" },
  jpg: { icon: ImageIcon, wrap: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400" },
  jpeg: { icon: ImageIcon, wrap: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400" },
};

const DEFAULT_STYLE = { icon: FileText, wrap: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" };

function getFileStyle(name = "") {
  const ext = name.split(".").pop()?.toLowerCase();
  return EXT_STYLE[ext] || DEFAULT_STYLE;
}

function groupByRecency(items) {
  const now = new Date();
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const today = startOfDay(now);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const groups = { Today: [], Yesterday: [], "This week": [], Older: [] };

  items.forEach((item) => {
    const t = new Date(item.time);
    const day = startOfDay(t);
    if (day.getTime() === today.getTime()) groups["Today"].push(item);
    else if (day.getTime() === yesterday.getTime()) groups["Yesterday"].push(item);
    else if (t >= weekAgo) groups["This week"].push(item);
    else groups["Older"].push(item);
  });

  return Object.entries(groups).filter(([, v]) => v.length > 0);
}

export default function WorkSidebar({
  history = [],
  onOpenFile = () => {},
  onRemoveFile = () => {},
  onNewFile = () => {},
  formatRelativeTime,
  shortName,
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return history;
    return history.filter((item) =>
      item.name.toLowerCase().includes(query.trim().toLowerCase())
    );
  }, [history, query]);

  const grouped = useMemo(() => groupByRecency(filtered), [filtered]);

  return (
    <aside className="w-72 flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="p-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">My Work</h2>
          <button
            onClick={onNewFile}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md active:scale-95"
          >
            <Plus size={14} strokeWidth={2.5} />
            New
          </button>
        </div>

        {/* Search */}
        <div className="relative mt-3">
          <Search
            size={15}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:focus:bg-gray-950"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {history.length === 0 ? (
          <div className="mt-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400">
              <FileText size={20} strokeWidth={1.5} />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">No recent files</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">No files match "{query}"</p>
          </div>
        ) : (
          <div className="space-y-5">
            {grouped.map(([label, items]) => (
              <div key={label}>
                <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-600">
                  {label}
                </p>
                <div className="space-y-1">
                  {items.map((item, idx) => {
                    const { icon: Icon, wrap } = getFileStyle(item.name);
                    return (
                      <div
                        key={idx}
                        onClick={() => onOpenFile(item)}
                        className="group relative flex cursor-pointer items-center gap-3 rounded-xl p-2.5 transition hover:bg-gray-50 dark:hover:bg-gray-900"
                      >
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${wrap}`}>
                          <Icon size={15} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                            {shortName ? shortName(item.name) : item.name}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {formatRelativeTime ? formatRelativeTime(item.time) : ""}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFile(item);
                          }}
                          className="shrink-0 rounded-md p-1 text-gray-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:text-gray-600 dark:hover:bg-red-900/20"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}