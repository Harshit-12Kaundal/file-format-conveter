// src/components/Main/components/WorkSidebar.jsx
import { useMemo, useState, useRef, useEffect } from "react";
import axios from "axios";
import { Search, FileText, X, Plus, FileEdit, RefreshCw, Share2, Trash2, Users, Mail, Link as LinkIcon, UserRound, Layers3 } from "lucide-react";
import { auth } from "../../firebaseConfig.js";
import { TYPE_LABEL, TYPE_BADGE_STYLE } from "./Constants.js";
import { getFileStyle, groupByRecency, shortName, formatRelativeTime } from "./helper.js";

const API = "http://localhost:3001";

function ShareDialog({ item, onClose }) {
  const [tab, setTab] = useState("friends");
  const [query, setQuery] = useState("");
  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [pendingRecipient, setPendingRecipient] = useState(null);
  const viewerUid = auth.currentUser?.uid;
  const fileUrl = `${API}/files/${item.id}`;

  useEffect(() => {
    let ignore = false;
    const loadRecipients = async () => {
      if (!viewerUid) {
        setLoading(false);
        return;
      }

      try {
        const friendsResponse = await axios.get(
          `${API}/friends/list/${encodeURIComponent(viewerUid)}`
        );
        if (!ignore) {
          setFriends(Array.isArray(friendsResponse.data) ? friendsResponse.data : []);
          setGroups([]);
        }
      } catch (error) {
        console.error("Failed to load share recipients:", error);
        if (!ignore) setFriends([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadRecipients();
    return () => { ignore = true; };
  }, [viewerUid]);

  const filteredFriends = friends.filter((friend) =>
    `${friend.name ?? ""} ${friend.email ?? ""}`.toLowerCase().includes(query.trim().toLowerCase())
  );

  const copyFor = (recipient) => {
    setPendingRecipient(recipient);
  };

  const confirmShare = async () => {
    const recipient = pendingRecipient;
    if (!recipient) return;
    setPendingRecipient(null);

    try {
      if (recipient.uid) {
        await axios.post(`${API}/friends/share`, {
          viewerUid,
          targetUid: recipient.uid,
          fileId: item.id,
          fileName: item.name,
        });
      }
      await navigator.clipboard.writeText(fileUrl);
      setNotice(`File shared with ${recipient.name || recipient.email || "recipient"}`);
    } catch {
      window.prompt("Copy this link:", fileUrl);
    }
  };

  const emailUrl = `mailto:?subject=${encodeURIComponent(`Shared file: ${item.name}`)}&body=${encodeURIComponent(`Here is the file link: ${fileUrl}`)}`;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onMouseDown={onClose}>
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between border-b border-gray-200 p-5 dark:border-gray-700">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Share file</p>
            <h2 className="mt-1 truncate pr-4 text-lg font-semibold text-gray-900 dark:text-white">{item.name}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white" aria-label="Close share dialog">
            <X size={18} />
          </button>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            ["friends", Users, "Friends"],
            ["groups", Layers3, "Groups"],
            ["gmail", Mail, "Gmail"],
          ].map(([value, Icon, label]) => (
            <button key={value} type="button" onClick={() => { setTab(value); setQuery(""); setNotice(""); }} className={`flex flex-1 items-center justify-center gap-2 px-3 py-3 text-sm font-medium ${tab === value ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400" : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"}`}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === "friends" && (
            <>
              <div className="relative">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search friends" className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" autoFocus />
              </div>
              <div className="mt-3 max-h-56 space-y-1 overflow-y-auto">
                {loading ? <p className="py-6 text-center text-sm text-gray-500">Loading friends...</p> : filteredFriends.length === 0 ? <p className="py-6 text-center text-sm text-gray-500">No friends found.</p> : filteredFriends.map((friend) => (
                  <button key={friend.uid} type="button" onClick={() => copyFor(friend)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-800">
                    <UserRound size={18} className="text-blue-600 dark:text-blue-400" />
                    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-gray-900 dark:text-gray-100">{friend.name || "Unnamed friend"}</span><span className="block truncate text-xs text-gray-500">{friend.email}</span></span>
                    <LinkIcon size={15} className="text-gray-400" />
                  </button>
                ))}
              </div>
            </>
          )}

          {tab === "groups" && (
            <div className="space-y-2">
              {groups.length === 0 ? <p className="py-8 text-center text-sm text-gray-500">You are not in any groups yet.</p> : groups.map((group) => <button key={group.id} type="button" onClick={() => copyFor({ name: group.name })} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800"><Layers3 size={18} className="text-purple-600 dark:text-purple-400" /><span className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">{group.name}</span><LinkIcon size={15} className="text-gray-400" /></button>)}
            </div>
          )}

          {tab === "gmail" && <a href={emailUrl} className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-700"><Mail size={17} /> Compose Gmail message</a>}
          {notice && <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">{notice}</p>}
        </div>
      </div>

      {pendingRecipient && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4" onMouseDown={() => setPendingRecipient(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-700 dark:bg-gray-900" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
                <Share2 size={18} />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Confirm file share</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Share <span className="font-medium text-gray-700 dark:text-gray-200">{item.name}</span> with <span className="font-medium text-gray-700 dark:text-gray-200">{pendingRecipient.name || pendingRecipient.email || "this recipient"}</span>?
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setPendingRecipient(null)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800">
                Cancel
              </button>
              <button type="button" onClick={confirmShare} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
                <Share2 size={15} /> Share file
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Small action popover shown when a file item is clicked, instead of
 * navigating immediately. Positioned to appear right below the item
 * that triggered it.
 */
function FileActionMenu({ item, onClose, onOpenDocument, onConvert, onShare, onRemove }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const actions = [
    { label: "Open document", icon: FileEdit, onClick: () => onOpenDocument(item) },
    { label: "Convert", icon: RefreshCw, onClick: () => onConvert(item) },
    { label: "Share", icon: Share2, onClick: () => onShare(item) },
    { label: "Remove", icon: Trash2, onClick: () => onRemove(item), danger: true },
  ];

  return (
    <div
      ref={ref}
      className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900"
    >
      {actions.map(({ label, icon: Icon, onClick, danger }) => (
        <button
          key={label}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
            onClose();
          }}
          className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition ${
            danger
              ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
          }`}
        >
          <Icon size={15} />
          {label}
        </button>
      ))}
    </div>
  );
}

export default function WorkSidebar({
  history,
  searchQuery,
  setSearchQuery,
  onOpenDocument,   // NEW: navigate to the read-only viewer (DocumentViewer/ImageEditor)
  onConvertFile,    // was onOpenFile - navigates to the actual conversion tool page
  onRemoveFromHistory,
  onNewFile,
}) {
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [shareItem, setShareItem] = useState(null);

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    return history.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );
  }, [history, searchQuery]);

  const groupedHistory = useMemo(() => groupByRecency(filteredHistory), [filteredHistory]);

  const handleShare = (item) => setShareItem(item);

  return (
    <aside className="w-72 flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-blue-700 dark:text-blue-400">My Work</h2>
          <button
            onClick={onNewFile}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md active:scale-95"
          >
            <Plus size={14} strokeWidth={2.5} />
            New
          </button>
        </div>

        <div className="relative mt-3">
          <Search
            size={15}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:focus:bg-gray-950"
          />
        </div>
      </div>

      <div className="themed-scroll flex-1 overflow-y-auto p-3">
        {history.length === 0 ? (
          <div className="mt-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400">
              <FileText size={20} strokeWidth={1.5} />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">No recent files</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">No files match "{searchQuery}"</p>
          </div>
        ) : (
          <div className="space-y-5">
            {groupedHistory.map(([label, items]) => (
              <div key={label}>
                <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-600">
                  {label}
                </p>
                <div className="space-y-1">
                  {items.map((item, idx) => {
                    const { icon: Icon, wrap } = getFileStyle(item.name);
                    const itemKey = item.id || idx;
                    return (
                      <div key={itemKey} className="relative">
                        <div
                          onClick={() => setMenuOpenId(menuOpenId === itemKey ? null : itemKey)}
                          className="group relative flex cursor-pointer items-center gap-3 rounded-xl p-2.5 transition hover:bg-gray-50 dark:hover:bg-gray-900"
                        >
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${wrap}`}>
                            <Icon size={15} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                              {shortName(item.name)}
                            </p>
                            <div className="mt-0.5 flex items-center gap-1.5">
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                {formatRelativeTime(item.time)}
                              </p>
                              {item.type && TYPE_LABEL[item.type] && (
                                <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${TYPE_BADGE_STYLE[item.type] || "bg-gray-500/10 text-gray-400"}`}>
                                  {TYPE_LABEL[item.type]}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {menuOpenId === itemKey && (
                          <FileActionMenu
                            item={item}
                            onClose={() => setMenuOpenId(null)}
                            onOpenDocument={onOpenDocument}
                            onConvert={onConvertFile}
                            onShare={handleShare}
                            onRemove={onRemoveFromHistory}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {shareItem && <ShareDialog item={shareItem} onClose={() => setShareItem(null)} />}
    </aside>
  );
}