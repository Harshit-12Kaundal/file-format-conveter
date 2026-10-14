// src/components/Main/utils/constants.js
import { FileText, FileSpreadsheet, Image as ImageIcon } from "lucide-react";
import { IconEdit, IconPlus, IconBranch, IconMerge } from "./Icons.jsx";

export const TYPE_META = {
  create: { icon: IconPlus, wrap: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" },
  edit: { icon: IconEdit, wrap: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" },
  rename: { icon: IconEdit, wrap: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" },
  branch: { icon: IconBranch, wrap: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400" },
  merge: { icon: IconMerge, wrap: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300" },
};

export const LEVEL_CLASSES = [
  "bg-gray-100 dark:bg-gray-800",
  "bg-blue-100 dark:bg-blue-950",
  "bg-blue-300 dark:bg-blue-800",
  "bg-blue-500 dark:bg-blue-600",
  "bg-blue-700 dark:bg-blue-400",
];

export const EXT_STYLE = {
  pdf: { icon: FileText, wrap: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" },
  docx: { icon: FileText, wrap: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" },
  doc: { icon: FileText, wrap: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" },
  xlsx: { icon: FileSpreadsheet, wrap: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" },
  csv: { icon: FileSpreadsheet, wrap: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" },
  png: { icon: ImageIcon, wrap: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400" },
  jpg: { icon: ImageIcon, wrap: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400" },
  jpeg: { icon: ImageIcon, wrap: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400" },
};
export const DEFAULT_STYLE = { icon: FileText, wrap: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" };

export const TYPE_LABEL = {
  PDF_TO_DOCX: "DOCX",
  DOCX_TO_PDF: "PDF",
  MERGE_PDF: "Merged",
  COMPRESS_PDF: "Compressed",
  ASK_AI: "AI",
};
export const TYPE_BADGE_STYLE = {
  PDF_TO_DOCX: "bg-blue-500/10 text-blue-400",
  DOCX_TO_PDF: "bg-red-500/10 text-red-400",
  MERGE_PDF: "bg-purple-500/10 text-purple-400",
  COMPRESS_PDF: "bg-emerald-500/10 text-emerald-400",
  ASK_AI: "bg-amber-500/10 text-amber-400",
};

export const ROUTE_BY_TYPE = {
  DOCX_TO_PDF: "/convert/docx-to-pdf",
  PDF_TO_DOCX: "/convert/pdf-to-docx",
  MERGE_PDF: "/convert/merge-pdfs",
  COMPRESS_PDF: "/convert/pdf-compress",
  ASK_AI: "/convert/pdf-description",
};