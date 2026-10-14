import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";
import usernameImage from "../../Images/username.jpg";

const API = "http://localhost:3001";

const EMPTY = { name: "", age: "", gender: "", bio: "" };

// A handful of good-looking, distinct DiceBear styles for the picker.
const AVATAR_STYLES = ["avataaars", "adventurer", "micah", "personas", "notionists", "thumbs", "fun-emoji", "croodles", "bottts", "lorelei"];
const avatarUrl = (style, seed) => `https://api.dicebear.com/8.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
const randomSeed = () => Math.random().toString(36).slice(2, 10);

export default function Profile() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(EMPTY);
  const [snapshot, setSnapshot] = useState(EMPTY);

  // Avatar state
  const [avatarStyle, setAvatarStyle] = useState("avataaars");
  const [avatarSeed, setAvatarSeed] = useState(null);
  const [avatarSnapshot, setAvatarSnapshot] = useState({ style: "avataaars", seed: null });
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [pickerSeeds, setPickerSeeds] = useState(Array.from({ length: 6 }, randomSeed));

  const notify = useCallback((type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setForm(EMPTY);
        setSnapshot(EMPTY);
        setAuthLoading(false);
        return;
      }

      let next = {
        name: currentUser.displayName || "",
        age: "",
        gender: "",
        bio: "",
      };

      try {
        const res = await axios.get(`${API}/data/data/${currentUser.uid}`);
        if (res.data) {
          next = {
            name: res.data.name ?? next.name,
            age: res.data.age ?? "",
            gender: res.data.gender ?? "",
            bio: res.data.bio ?? "",
          };
          if (res.data.avatarSeed) {
            setAvatarSeed(res.data.avatarSeed);
            setAvatarStyle(res.data.avatarStyle || "avataaars");
            setAvatarSnapshot({ style: res.data.avatarStyle || "avataaars", seed: res.data.avatarSeed });
          }
        }
      } catch {
        /* no profile row yet — keep defaults */
      }

      setForm(next);
      setSnapshot(next);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  const dirty =
    JSON.stringify(form) !== JSON.stringify(snapshot) ||
    avatarSeed !== avatarSnapshot.seed ||
    avatarStyle !== avatarSnapshot.style;

  const initials = (form.name || user?.email || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  const filled = ["name", "age", "gender", "bio"].filter(
    (k) => String(form[k] || "").trim() !== ""
  ).length;
  const completion = Math.round((filled / 4) * 100);

  const setField = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((x) => ({ ...x, [key]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    else if (form.name.trim().length < 2) e.name = "Name is too short";

    if (form.age !== "") {
      const n = Number(form.age);
      if (!Number.isFinite(n) || n <= 0 || n > 120) e.age = "Enter a valid age";
    }
    if (form.bio.length > 300) e.bio = "Max 300 characters";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user || !validate() || !dirty) return;

    setSaving(true);
    try {
      await axios.post(`${API}/data/save`, {
        userId: user.uid,
        email: user.email,
        name: form.name.trim(),
        age: form.age === "" ? null : Number(form.age),
        gender: form.gender,
        bio: form.bio.trim(),
        avatarSeed,
        avatarStyle,
      });
      setSnapshot(form);
      setAvatarSnapshot({ style: avatarStyle, seed: avatarSeed });
      setEditMode(false);
      notify("success", "Profile updated");
    } catch (err) {
      console.error("Save profile error:", err);
      notify("error", "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(snapshot);
    setAvatarSeed(avatarSnapshot.seed);
    setAvatarStyle(avatarSnapshot.style);
    setErrors({});
    setEditMode(false);
  };

  const shufflePickerSeeds = () => setPickerSeeds(Array.from({ length: 6 }, randomSeed));

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        <div className="w-full max-w-md animate-pulse space-y-4 rounded-2xl border border-white/10 bg-gray-900 p-6">
          <div className="h-24 rounded-xl bg-white/10" />
          <div className="h-4 w-1/2 rounded bg-white/10" />
          <div className="h-4 w-1/3 rounded bg-white/10" />
          <div className="h-10 rounded-xl bg-white/10" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4 text-white">
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-gray-900 p-8 text-center">
          <h1 className="text-lg font-semibold">You're signed out</h1>
          <p className="mt-2 text-sm text-gray-400">
            Sign in to view and edit your profile.
          </p>
          <a
            href="/login"
            className="mt-6 inline-block w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold transition hover:bg-blue-500"
          >
            Go to login
          </a>
        </div>
      </div>
    );
  }

  // Priority: chosen cartoon avatar > Google/Firebase photo > local fallback image > initials
  const currentAvatarSrc = avatarSeed
    ? avatarUrl(avatarStyle, avatarSeed)
    : user.photoURL || usernameImage || null;

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-10 text-white">
      {toast && (
        <div
          className={`fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-xl px-4 py-2 text-sm font-medium shadow-lg ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.text}
        </div>
      )}

      <div className="mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-gray-900 shadow-xl">
        <div className="h-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

        <div className="-mt-12 flex flex-col items-center px-6">
          <div className="group relative">
            {currentAvatarSrc ? (
              <img
                src={currentAvatarSrc}
                alt={form.name || "Profile avatar"}
                className="h-24 w-24 rounded-full border-4 border-gray-900 bg-gray-800 object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-gray-900 bg-gray-800 text-xl font-bold">
                {initials}
              </div>
            )}

            {/* NEW: click the avatar (always, not just in edit mode) to open the picker */}
            <button
              type="button"
              onClick={() => setShowAvatarPicker(true)}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-xs font-medium opacity-0 transition group-hover:opacity-100"
            >
              Change
            </button>
          </div>

          <h1 className="mt-3 text-lg font-semibold">
            {form.name || "Unnamed user"}
          </h1>
          <p className="text-sm text-gray-400">{user.email}</p>
        </div>

        <div className="px-6 pb-8 pt-6">
          <div className="mb-6">
            <div className="mb-1 flex justify-between text-xs text-gray-400">
              <span>Profile completion</span>
              <span>{completion}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>

          {!editMode ? (
            <>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">Name</dt>
                  <dd className="mt-0.5 text-sm font-medium">{form.name || "Not set"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">Age</dt>
                  <dd className="mt-0.5 text-sm font-medium">{form.age || "Not set"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">Gender</dt>
                  <dd className="mt-0.5 text-sm font-medium">{form.gender || "Not set"}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase tracking-wide text-gray-500">Bio</dt>
                  <dd className="mt-0.5 text-sm font-medium">{form.bio || "Not set"}</dd>
                </div>
              </dl>

              <button
                onClick={() => setEditMode(true)}
                className="mt-6 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold transition hover:bg-blue-500"
              >
                Edit profile
              </button>
            </>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wide text-gray-500">
                  Name
                </label>
                <input
                  value={form.name}
                  onChange={setField("name")}
                  className="w-full rounded-xl border border-white/10 bg-gray-800 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  placeholder="Your name"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-400">{errors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wide text-gray-500">
                    Age
                  </label>
                  <input
                    type="number"
                    value={form.age}
                    onChange={setField("age")}
                    className="w-full rounded-xl border border-white/10 bg-gray-800 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    placeholder="25"
                  />
                  {errors.age && (
                    <p className="mt-1 text-xs text-red-400">{errors.age}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wide text-gray-500">
                    Gender
                  </label>
                  <select
                    value={form.gender}
                    onChange={setField("gender")}
                    className="w-full rounded-xl border border-white/10 bg-gray-800 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-wide text-gray-500">
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={form.bio}
                  onChange={setField("bio")}
                  className="w-full resize-none rounded-xl border border-white/10 bg-gray-800 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  placeholder="A short bio"
                />
                <div className="mt-1 flex justify-between text-xs">
                  <span className="text-red-400">{errors.bio || ""}</span>
                  <span className="text-gray-500">{form.bio.length}/300</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving || !dirty}
                  className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold transition hover:bg-blue-500 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex-1 rounded-xl border border-white/10 bg-transparent py-2.5 text-sm font-semibold text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Avatar Picker Modal */}
      {showAvatarPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Choose an avatar</h3>
              <button
                onClick={() => setShowAvatarPicker(false)}
                className="rounded-lg p-1 text-gray-400 transition hover:bg-white/5 hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {AVATAR_STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setAvatarStyle(style)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    avatarStyle === style
                      ? "border-blue-500 bg-blue-500/15 text-blue-300"
                      : "border-white/10 text-gray-400 hover:bg-white/5"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {pickerSeeds.map((seed) => (
                <button
                  key={seed}
                  type="button"
                  onClick={async () => {
                    setAvatarSeed(seed);
                    setShowAvatarPicker(false);
                    // Save immediately so the click-to-change flow works
                    // even outside "Edit profile" mode.
                    try {
                      await axios.post(`${API}/data/save`, {
                        userId: user.uid,
                        email: user.email,
                        name: form.name,
                        age: form.age === "" ? null : Number(form.age),
                        gender: form.gender,
                        bio: form.bio,
                        avatarSeed: seed,
                        avatarStyle,
                      });
                      setAvatarSnapshot({ style: avatarStyle, seed });
                      notify("success", "Avatar updated");
                    } catch (err) {
                      console.error("Save avatar error:", err);
                      notify("error", "Could not save avatar");
                    }
                  }}
                  className={`rounded-xl border-2 p-2 transition ${
                    avatarSeed === seed
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <img
                    src={avatarUrl(avatarStyle, seed)}
                    alt="Avatar option"
                    className="h-full w-full rounded-lg bg-gray-800"
                  />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={shufflePickerSeeds}
              className="mt-4 w-full rounded-xl border border-white/10 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/5"
            >
              Shuffle options
            </button>
          </div>
        </div>
      )}
    </div>
  );
}