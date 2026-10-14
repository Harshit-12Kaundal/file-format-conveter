import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Bell, Check, FileText, UserPlus, X } from "lucide-react";
import { auth } from "../../firebaseConfig.js";

const API = "http://localhost:3001";
const EMPTY_REQUESTS = [];

const normalizeRequest = (item) => ({
  id: item.id ?? item.requesterUid ?? item.uid ?? item.senderUid ?? `${item.name ?? "user"}-${Math.random()}`,
  requesterUid: item.requesterUid ?? item.fromUid ?? item.uid ?? item.senderUid,
  name: item.name ?? item.senderName ?? "Someone",
  email: item.email ?? "",
  avatarSeed: item.avatarSeed ?? item.avatar_seed ?? item.photo_url ?? item.photoUrl ?? "",
  avatarStyle: item.avatarStyle ?? item.avatar_style ?? "avataaars",
  message: item.message ?? "sent you a friend request",
  type: item.type ?? "friend_request",
  fileId: item.fileId ?? null,
  fileName: item.fileName ?? null,
});

export default function Notification({
  viewerUid: viewerUidProp,
  requests: initialRequests = EMPTY_REQUESTS,
  fetchRequests = null,
  onAction = null,
}) {
  const [requests, setRequests] = useState(initialRequests.map(normalizeRequest));
  const [loading, setLoading] = useState(false);
  const [actingId, setActingId] = useState(null);

  const currentUser = auth.currentUser;
  const viewerUid = viewerUidProp ?? currentUser?.uid;

  useEffect(() => {
    let ignore = false;

    const loadRequests = async () => {
      if (fetchRequests) {
        setLoading(true);
        try {
          const data = await fetchRequests(viewerUid);
          if (!ignore) {
            setRequests((Array.isArray(data) ? data : []).map(normalizeRequest));
          }
        } catch (error) {
          console.error("Failed to fetch friend requests:", error);
          if (!ignore) setRequests([]);
        } finally {
          if (!ignore) setLoading(false);
        }
        return;
      }

      if (viewerUid) {
        setLoading(true);
        try {
          const { data } = await axios.get(`${API}/friends/requests/${encodeURIComponent(viewerUid)}`);
          if (!ignore) setRequests((Array.isArray(data) ? data : []).map(normalizeRequest));
        } catch (error) {
          console.error("Failed to fetch friend requests:", error);
          if (!ignore) setRequests([]);
        } finally {
          if (!ignore) setLoading(false);
        }
        return;
      }

      if (Array.isArray(initialRequests) && initialRequests.length) {
        if (!ignore) setRequests(initialRequests.map(normalizeRequest));
      } else if (!ignore) {
        setRequests([]);
      }
    };

    loadRequests();

    return () => {
      ignore = true;
    };
  }, [fetchRequests, initialRequests, viewerUid]);

  const requestCount = useMemo(() => requests.length, [requests]);

  const handleAction = async (request, action) => {
    if (request.type !== "friend_request" || !viewerUid || !request?.requesterUid) return;

    setActingId(request.id);
    try {
      await axios.post(`${API}/friends/action`, {
        viewerUid,
        targetUid: request.requesterUid,
        action,
      });

      setRequests((current) => current.filter((item) => item.id !== request.id));

      if (onAction) {
        onAction({ ...request, action });
      }
    } catch (error) {
      console.error(`Failed to ${action} friend request:`, error);
    } finally {
      setActingId(null);
    }
  };

  if (!viewerUid) {
    return null;
  }

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-xl dark:border-gray-700 dark:bg-gray-900 dark:text-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-white/10">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-semibold">Notifications</h3>
        </div>

        {requestCount > 0 && (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
            {requestCount}
          </span>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto bg-gray-50 p-3 dark:bg-gray-900">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-sm text-gray-500 dark:text-gray-400">
            Loading requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            No new notifications.
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {request.avatarSeed ? (
                    <img
                      src={`https://api.dicebear.com/8.x/${request.avatarStyle}/svg?seed=${encodeURIComponent(request.avatarSeed)}`}
                      alt={request.name}
                      className="h-10 w-10 rounded-full border border-white/10 object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                      {request.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      <span className="font-medium">{request.name}</span>{" "}
                      <span className="text-xs text-gray-500 dark:text-gray-400">{request.message}</span>
                    </p>
                  </div>
                </div>

                {request.type === "file_share" ? (
                  <a
                    href={`${API}/files/${encodeURIComponent(request.fileId)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-purple-600 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-purple-500"
                  >
                    <FileText size={12} />
                    Open file
                  </a>
                ) : (
                  <div className="flex shrink-0 items-center gap-2">
                    <button type="button" disabled={actingId === request.id} onClick={() => handleAction(request, "accept")} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50">
                      <Check size={12} /> Accept
                    </button>
                    <button type="button" disabled={actingId === request.id} onClick={() => handleAction(request, "remove")} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:border-red-500 hover:text-red-500 disabled:opacity-50 dark:border-white/10 dark:text-gray-300 dark:hover:text-red-400">
                      <X size={12} /> Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 px-4 py-2 text-right dark:border-white/10">
        <button type="button" className="inline-flex items-center gap-1 text-xs text-blue-600 transition hover:text-blue-500 dark:text-blue-300 dark:hover:text-blue-200">
          <UserPlus size={12} />
          View all
        </button>
      </div>
    </div>
  );
}
