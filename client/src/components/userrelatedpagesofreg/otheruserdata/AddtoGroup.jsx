// src/components/AddToGroupButton.jsx
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { UsersRound, Check } from "lucide-react";
import { auth } from "../../firebaseConfig";

const API = "http://localhost:3001";

/**
 * Lets the viewer invite `targetUid` into one of the VIEWER's OWN
 * groups. Needs the Group/GroupMember backend to exist first -
 * clicking this before that's built will just show "No groups yet."
 *
 * Expected API contract:
 *  - GET  /groups/mine?viewerUid=X          -> [{ id, name }]
 *  - POST /groups/invite { viewerUid, targetUid, groupId } -> { ok: true }
 */
export default function AddToGroupButton({ targetUid }) {
  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [invitedGroupIds, setInvitedGroupIds] = useState([]);
  const boxRef = useRef(null);

  const viewerUid = auth.currentUser?.uid;

  useEffect(() => {
    const handler = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openMenu = async () => {
    setOpen(true);
    if (!viewerUid) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/groups/mine`, { params: { viewerUid } });
      setGroups(res.data);
    } catch (err) {
      console.error("Failed to load your groups:", err);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const invite = async (groupId) => {
    try {
      await axios.post(`${API}/groups/invite`, { viewerUid, targetUid, groupId });
      setInvitedGroupIds((prev) => [...prev, groupId]);
    } catch (err) {
      console.error("Failed to invite to group:", err);
    }
  };

  if (!viewerUid || viewerUid === targetUid) return null;

  return (
    <div ref={boxRef} className="relative">
      <button
        onClick={open ? () => setOpen(false) : openMenu}
        className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-purple-700"
      >
        <UsersRound size={14} />
        Add to Group
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-56 rounded-xl border border-gray-700 bg-gray-900 p-2 shadow-lg">
          {loading ? (
            <p className="px-3 py-2 text-xs text-gray-500">Loading your groups...</p>
          ) : groups.length === 0 ? (
            <p className="px-3 py-2 text-xs text-gray-500">
              You don't have any groups yet.
            </p>
          ) : (
            groups.map((g) => {
              const invited = invitedGroupIds.includes(g.id);
              return (
                <button
                  key={g.id}
                  onClick={() => !invited && invite(g.id)}
                  disabled={invited}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-gray-200 transition hover:bg-gray-800 disabled:opacity-60"
                >
                  {g.name}
                  {invited && <Check size={14} className="text-purple-400" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}