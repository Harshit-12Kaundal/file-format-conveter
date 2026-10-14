// src/components/Main/components/AddFileModal.jsx
import { shortName } from "./helper.js";

export default function AddFileModal({
  isOpen,
  onClose,
  tempFileName,
  onFileSelect,
  onDone,
  canSubmit,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Add File</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition hover:border-blue-500 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500 dark:hover:bg-gray-800/50">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm dark:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {tempFileName ? shortName(tempFileName) : "Click to select a file"}
          </span>
          <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {tempFileName ? "Ready to upload" : "PDF, DOC, JPG supported"}
          </span>
          <input type="file" className="hidden" onChange={onFileSelect} />
        </label>

        <button
          onClick={onDone}
          disabled={!canSubmit}
          className="mt-5 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:hover:bg-gray-300 dark:disabled:bg-gray-700"
        >
          Done
        </button>
      </div>
    </div>
  );
}