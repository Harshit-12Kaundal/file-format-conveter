// src/components/FriendButton.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { UserPlus, Clock, Check, X, Users } from "lucide-react";
import { auth } from "../../firebaseConfig.js";

const API = "http://localhost:3001";

export default function FriendButton({ targetUid }) {
  const [status, setStatus] = useState("loading");
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const viewerUid = auth.currentUser?.uid;

  const fetchStatus = async () => {
    if (!viewerUid || !targetUid || viewerUid === targetUid) {
      setStatus("self_or_signed_out");
      return;
    }
    try {
      const res = await axios.get(`${API}/friends/status`, {
        params: { viewerUid, targetUid },
      });
      setStatus(res.data.status); // "none" | "pending_outgoing" | "pending_incoming" | "friends"
    } catch (err) {
      console.error("Failed to fetch friend status:", err);
      setStatus("none");
    }
  };

  useEffect(() => {
    fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUid, viewerUid]);

  const act = async (action) => {
    setBusy(true);
    try {
      await axios.post(`${API}/friends/action`, { viewerUid, targetUid, action });
      await fetchStatus();
    } catch (err) {
      console.error(`Failed to ${action} friend request:`, err);
    } finally {
      setBusy(false);
      setConfirmOpen(false);
    }
  };

  if (status === "loading" || status === "self_or_signed_out") return null;

  if (status === "none") {
    return (
      <button
        onClick={() => act("request")}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        <UserPlus size={14} />
        Add Friend
      </button>
    );
  }

  if (status === "pending_outgoing") {
    return (
      <button
        onClick={() => act("remove")}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-1.5 text-sm font-medium text-gray-300 transition hover:border-red-500 hover:text-red-400 disabled:opacity-50"
      >
        <Clock size={14} />
        Request Sent
      </button>
    );
  }

  if (status === "pending_incoming") {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => act("accept")}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          <Check size={14} />
          Accept
        </button>
        <button
          onClick={() => act("remove")}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-1.5 text-sm font-medium text-gray-300 transition hover:border-red-500 hover:text-red-400 disabled:opacity-50"
        >
          <X size={14} />
          Decline
        </button>
      </div>
    );
  }

  if (status === "friends") {
    return (
      <>
        <button
          onClick={() => setConfirmOpen(true)}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-700 bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-400 transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
        >
          <Users size={14} />
          Remove Friend
        </button>

        {confirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-gray-900 p-5 shadow-2xl">
              <h3 className="text-lg font-semibold text-white">Remove friend?</h3>
              <p className="mt-2 text-sm text-gray-300">
                This will remove the connection and clear your friendship status.
              </p>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  className="rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-gray-300 transition hover:border-gray-500 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => act("remove")}
                  disabled={busy}
                  className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
                >
                  {busy ? "Removing..." : "Remove"}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}