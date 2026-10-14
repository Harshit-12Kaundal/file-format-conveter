// src/components/Main/components/ChangeHistory.jsx
import { TYPE_META } from "./Constants.js";
import { formatWhen } from "./helper.js";
import { IconBranch, IconPlus } from "./Icons.jsx";

export default function ChangeHistory({ changes, branches, activeBranch, onNewBranch }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-400">History</h3>
        <div className="flex items-center gap-1.5">
          {branches.map((b) => (
            <span
              key={b}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${
                b === activeBranch
                  ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-900/20 dark:text-blue-400"
                  : "border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300"
              }`}
            >
              <IconBranch />
              {b}
            </span>
          ))}
          <button
            onClick={onNewBranch}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-300 px-2 py-0.5 text-xs text-gray-500 transition hover:border-blue-400 hover:text-blue-600 dark:border-gray-700 dark:text-gray-400 dark:hover:border-blue-500 dark:hover:text-blue-400"
          >
            <IconPlus />
            Branch
          </button>
        </div>
      </div>

      {changes.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No changes recorded yet.</p>
      ) : (
        // Fixed max-height + internal scroll, so this panel never grows
        // the page as more history accumulates - it stays a constant
        // size and you scroll WITHIN it instead.
        <ol className="themed-scroll relative max-h-[380px] space-y-4 overflow-y-auto border-l border-gray-200 pl-4 pr-1 dark:border-gray-800">
          {changes.map((c) => {
            const meta = TYPE_META[c.type] ?? TYPE_META.edit;
            const Icon = meta.icon;
            return (
              <li key={c.id} className="relative">
                <span className={`absolute -left-[21px] flex h-5 w-5 items-center justify-center rounded-full ${meta.wrap}`}>
                  <Icon />
                </span>
                <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                    {c.fileName || "Untitled file"}
                  </p>
                  <time className="shrink-0 text-xs text-gray-400 dark:text-gray-500">{formatWhen(c.date)}</time>
                </div>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{c.title}</p>
                {c.detail && <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{c.detail}</p>}
                <span className="mt-1 inline-block text-[11px] text-gray-400 dark:text-gray-600">on {c.branch}</span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}