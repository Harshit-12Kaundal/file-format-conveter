import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, FileText, Flame, Calendar, Zap } from "lucide-react";
import FriendButton from "./FriendsButton.jsx";
import AddToGroupButton from "./AddtoGroup.jsx";

const API = "http://localhost:3001";

const avatarUrl = (style, seed) =>
  `https://api.dicebear.com/8.x/${style}/svg?seed=${encodeURIComponent(seed)}`;

const TYPE_LABEL = {
  PDF_TO_DOCX: "PDF → DOCX",
  DOCX_TO_PDF: "DOCX → PDF",
  MERGE_PDF: "Merging PDFs",
  COMPRESS_PDF: "Compressing PDFs",
  ASK_AI: "Ask AI",
};

const LEVEL_CLASSES = [
  "bg-white/5",
  "bg-blue-900",
  "bg-blue-700",
  "bg-blue-500",
  "bg-blue-300",
];
const levelForCount = (c) => (c === 0 ? 0 : c === 1 ? 1 : c <= 2 ? 2 : c <= 4 ? 3 : 4);

function ProfileSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-white/10 bg-gray-900 p-8">
      <div className="mx-auto h-24 w-24 rounded-full bg-white/10" />
      <div className="mx-auto mt-4 h-6 w-40 rounded bg-white/10" />
      <div className="mx-auto mt-2 h-4 w-24 rounded bg-white/10" />
      <div className="mt-6 grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-white/5" />
        ))}
      </div>
    </div>
  );
}

function MiniActivityGrid({ data = [] }) {
  const weeks = [];
  for (let i = 0; i < data.length; i += 7) weeks.push(data.slice(i, i + 7));

  return (
    <div className="flex justify-center gap-[3px] overflow-x-auto">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-[3px]">
          {week.map((day) => (
            <div
              key={day.date}
              title={`${day.count} action${day.count === 1 ? "" : "s"} on ${day.date}`}
              className={`h-2.5 w-2.5 rounded-sm ${LEVEL_CLASSES[levelForCount(day.count)]}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

const UserProfile = () => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    (async () => {
      try {
        const res = await axios.get(`${API}/users/${uid}`);
        if (!cancelled) setUser(res.data);
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [uid]);

  const initials = (user?.name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-10 text-white">
      <div className="mx-auto w-full max-w-lg">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm text-gray-400 transition hover:text-gray-200"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {loading ? (
          <ProfileSkeleton />
        ) : notFound || !user ? (
          <div className="rounded-2xl border border-white/10 bg-gray-900 p-10 text-center">
            <h1 className="text-lg font-semibold">User not found</h1>
            <p className="mt-2 text-sm text-gray-400">
              This profile doesn't exist or is no longer available.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-gray-900 shadow-xl">
            <div className="h-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

            <div className="-mt-12 flex flex-col items-center px-6">
              {user.photo_url ? (
                <img
                  src={avatarUrl(user.avatar_style || "avataaars", user.photo_url)}
                  alt={user.name}
                  className="h-24 w-24 rounded-full border-4 border-gray-900 bg-gray-800 object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-gray-900 bg-blue-900/40 text-2xl font-bold text-blue-300">
                  {initials}
                </div>
              )}

              <h1 className="mt-3 text-xl font-semibold">{user.name || "Unnamed user"}</h1>

              {user.mostUsedType && TYPE_LABEL[user.mostUsedType] && (
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                  <Zap size={11} />
                  Frequently uses {TYPE_LABEL[user.mostUsedType]}
                </span>
              )}

              {user.bio && (
                <p className="mt-3 max-w-sm text-center text-sm text-gray-400">{user.bio}</p>
              )}
            </div>
           <div className="flex w-full flex-row flex-nowrap items-center justify-center gap-3 px-6 pt-6">
            <FriendButton targetUid={uid} />
            <AddToGroupButton targetUid={uid} />
          </div>
            <div className="grid grid-cols-4 gap-3 px-6 pt-6">
              <div className="rounded-xl border border-white/10 bg-gray-800/50 p-3 text-center">
                <FileText size={16} className="mx-auto mb-1 text-blue-400" />
                <p className="text-lg font-semibold">{user.conversionCount}</p>
                <p className="text-[11px] text-gray-500">Files</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-gray-800/50 p-3 text-center">
                <Zap size={16} className="mx-auto mb-1 text-emerald-400" />
                <p className="text-lg font-semibold">{user.totalActions}</p>
                <p className="text-[11px] text-gray-500">Actions</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-gray-800/50 p-3 text-center">
                <Flame size={16} className="mx-auto mb-1 text-amber-400" />
                <p className="text-lg font-semibold">{user.streak}</p>
                <p className="text-[11px] text-gray-500">Day streak</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-gray-800/50 p-3 text-center">
                <Calendar size={16} className="mx-auto mb-1 text-purple-400" />
                <p className="text-xs font-medium">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })
                    : "—"}
                </p>
                <p className="text-[11px] text-gray-500">Joined</p>
              </div>
            </div>

            {user.activityGrid && (
              <div className="px-6 pb-8 pt-5">
                <p className="mb-2 text-center text-[11px] text-gray-500">Activity, last 9 weeks</p>
                <MiniActivityGrid data={user.activityGrid} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;