// src/components/Main/components/ActiveFileModal.jsx
import { IconBranch } from "./Icons.jsx";
import { shortName } from "./helper.js";

export default function ActiveFileModal({
  savedFileName,
  activeBranch,
  onRemove,
  onOpenDocument,
  onRename,
  onOpenTools,
}) {
  if (!savedFileName) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-950">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">Current file</p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">{shortName(savedFileName)}</p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-600">
                <IconBranch />
                {activeBranch}
              </p>
            </div>
            <button
              onClick={onRemove}
              className="rounded-md p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <button
              onClick={onOpenDocument}
              className="rounded-xl border border-gray-200 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Open document
            </button>
            <button
              onClick={onRename}
              className="rounded-xl border border-gray-200 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Rename
            </button>
            <button
              onClick={onOpenTools}
              className="rounded-xl bg-blue-600 py-2 text-sm font-medium text-white transition hover:bg-blue-700 active:scale-[0.98]"
            >
              Open tools
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}