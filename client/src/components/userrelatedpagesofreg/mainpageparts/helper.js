// src/components/Main/utils/helpers.js
import { EXT_STYLE, DEFAULT_STYLE } from "./Constants.js";

export function localDateKey(d) {
  // Always use LOCAL year/month/day, never .toISOString() (which
  // converts to UTC and shifts the date for timezones ahead of UTC,
  // e.g. India UTC+5:30 - that mismatch was causing entries to be
  // silently dropped from the activity total).
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function levelForCount(count) {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 2) return 2;
  if (count <= 4) return 3;
  return 4;
}

export function formatWhen(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function formatRelativeTime(dateString) {
  if (!dateString) return "";
  const past = new Date(dateString);
  const now = new Date();
  const diff = now - past;
  const seconds = diff / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = hours / 24;
  const weeks = days / 7;
  const months = days / 30;
  const years = days / 365;

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${Math.floor(minutes)}m ago`;
  if (hours < 24) return `${Math.floor(hours)}h ago`;
  if (days < 7) return `${Math.floor(days)}d ago`;
  if (weeks < 5) return `${Math.floor(weeks)}w ago`;
  if (months < 12) return `${Math.floor(months)}mo ago`;
  return `${Math.floor(years)}y ago`;
}

export function shortName(name) {
  return name?.length > 24 ? name.slice(0, 22) + "..." : name;
}

export function getFileStyle(name = "") {
  const ext = name.split(".").pop()?.toLowerCase();
  return EXT_STYLE[ext] || DEFAULT_STYLE;
}

export function getFileKind(file, name) {
  const type = file?.type || "";
  const ext = (name || "").split(".").pop()?.toLowerCase();
  if (type.startsWith("image/") || ["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) return "image";
  if (type === "application/pdf" || ext === "pdf") return "pdf";
  if (ext === "docx" || ext === "doc") return "docx";
  return "other";
}

export function groupByRecency(items) {
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