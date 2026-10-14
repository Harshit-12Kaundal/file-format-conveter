import React, { useState, useCallback, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import Navbar from "../Navbar";
import { auth } from "../firebaseConfig";

const API = "http://localhost:3001";

/* ============================================================
   Canvas helpers - actually bake crop/rotation/flip/filters into
   real pixel data for the final downloadable image, since CSS
   filters on the live preview don't affect what gets exported.
   ============================================================ */
function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.src = url;
  });
}

function cssFilterString(filters) {
  return `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%)`;
}

async function getEditedImage(imageSrc, pixelCrop, rotation, flip, filters) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const rotRad = (rotation * Math.PI) / 180;

  // Bounding box after rotation, so nothing gets clipped mid-rotate
  const sin = Math.abs(Math.sin(rotRad));
  const cos = Math.abs(Math.cos(rotRad));
  const boundW = image.width * cos + image.height * sin;
  const boundH = image.width * sin + image.height * cos;

  canvas.width = boundW;
  canvas.height = boundH;

  ctx.translate(boundW / 2, boundH / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.filter = cssFilterString(filters); // bake filters into the pixels
  ctx.drawImage(image, 0, 0);

  // Crop out just the selected region
  const data = ctx.getImageData(pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.putImageData(data, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

const DEFAULT_FILTERS = { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, sepia: 0 };

export default function ImageEditor() {
  const location = useLocation();
  const navigate = useNavigate();

  const [imageSrc, setImageSrc] = useState(null);
  const [fileName, setFileName] = useState("edited-image.png");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flip, setFlip] = useState({ horizontal: false, vertical: false });
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [history, setHistory] = useState([]); // stack of previous imageSrc for undo
  const [previewUrl, setPreviewUrl] = useState(null);

  // Load either a raw File (from Main.jsx "Open document") or fetch
  // by fileId (from the sidebar history), same pattern as everywhere
  // else this navigation state is used.
  useEffect(() => {
    const { file, fileId, fileName: incomingName } = location.state || {};

    if (incomingName) setFileName(incomingName);

    if (file) {
      setImageSrc(URL.createObjectURL(file));
      return;
    }

    if (fileId) {
      setLoading(true);
      fetch(`${API}/files/${fileId}`)
        .then((res) => {
          if (!res.ok) throw new Error("File not found");
          return res.blob();
        })
        .then((blob) => setImageSrc(URL.createObjectURL(blob)))
        .catch((err) => {
          console.error("Failed to load image:", err);
          setError("Could not load that file.");
        })
        .finally(() => setLoading(false));
    }
  }, [location.state]);

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageSrc(URL.createObjectURL(file));
      setFileName(file.name);
      setHistory([]);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setFlip({ horizontal: false, vertical: false });
      setFilters(DEFAULT_FILTERS);
    } else {
      setError("Please select an image file.");
    }
  };

  // "Apply" bakes the current crop/rotation/flip/filters into a new
  // base image, so you can layer multiple edits (crop, then filter
  // again, then crop again, etc.) instead of only ever editing the
  // original once.
  const handleApply = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setLoading(true);
    try {
      const blob = await getEditedImage(imageSrc, croppedAreaPixels, rotation, flip, filters);
      const newUrl = URL.createObjectURL(blob);
      setHistory((h) => [...h, imageSrc]);
      setImageSrc(newUrl);
      setPreviewUrl(newUrl);
      // Reset live adjustments since they're now baked in
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setFlip({ horizontal: false, vertical: false });
      setFilters(DEFAULT_FILTERS);
    } catch (err) {
      console.error("Failed to apply edit:", err);
      setError("Failed to apply that edit.");
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = () => {
    if (!history.length) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setImageSrc(prev);
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setFlip({ horizontal: false, vertical: false });
    setFilters(DEFAULT_FILTERS);
  };

  const handleDownload = async () => {
    if (!imageSrc) return;
    setLoading(true);
    try {
      // Bake whatever's currently adjusted (even if "Apply" was never
      // clicked) into the final export.
      const blob = croppedAreaPixels
        ? await getEditedImage(imageSrc, croppedAreaPixels, rotation, flip, filters)
        : await fetch(imageSrc).then((r) => r.blob());

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName.replace(/\.[^/.]+$/, "") + "-edited.png";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export image:", err);
      setError("Failed to download the edited image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Navbar />

      <main className="flex flex-1 overflow-hidden pt-16">
        {/* Canvas area */}
        <section className="relative flex-1 bg-gray-100 dark:bg-gray-950">
          {!imageSrc ? (
            <div className="flex h-full items-center justify-center p-6">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center transition hover:border-blue-500 dark:border-gray-700 dark:bg-gray-900">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Click to open an image
                </span>
                <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  JPG, PNG, WEBP supported
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
              </label>
            </div>
          ) : (
            <div className="relative h-full w-full" style={{ filter: cssFilterString(filters) }}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={undefined}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
                style={{
                  containerStyle: {
                    transform: `scale(${flip.horizontal ? -1 : 1}, ${flip.vertical ? -1 : 1})`,
                  },
                }}
              />
            </div>
          )}

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-gray-950/60">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Working...</p>
            </div>
          )}
        </section>

        {/* Tools sidebar */}
        <aside className="themed-scroll w-80 overflow-y-auto border-l border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
          <h2 className="text-lg font-semibold tracking-tight">Edit image</h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">{fileName}</p>

          {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

          {imageSrc && (
            <>
              {/* Zoom */}
              <div className="mt-6">
                <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  Zoom
                </label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              {/* Rotate */}
              <div className="mt-5">
                <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  Rotate
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                    className="flex-1 rounded-lg border border-gray-200 py-1.5 text-sm transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    ↺ 90°
                  </button>
                  <button
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="flex-1 rounded-lg border border-gray-200 py-1.5 text-sm transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    ↻ 90°
                  </button>
                </div>
                <input
                  type="range"
                  min={0}
                  max={359}
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="mt-2 w-full accent-blue-600"
                />
              </div>

              {/* Flip */}
              <div className="mt-5">
                <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  Flip
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFlip((f) => ({ ...f, horizontal: !f.horizontal }))}
                    className={`flex-1 rounded-lg border py-1.5 text-sm transition ${
                      flip.horizontal
                        ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                        : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                    }`}
                  >
                    Horizontal
                  </button>
                  <button
                    onClick={() => setFlip((f) => ({ ...f, vertical: !f.vertical }))}
                    className={`flex-1 rounded-lg border py-1.5 text-sm transition ${
                      flip.vertical
                        ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                        : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                    }`}
                  >
                    Vertical
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="mt-5 space-y-3">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Adjustments</p>
                {[
                  { key: "brightness", label: "Brightness", min: 0, max: 200 },
                  { key: "contrast", label: "Contrast", min: 0, max: 200 },
                  { key: "saturate", label: "Saturation", min: 0, max: 200 },
                  { key: "grayscale", label: "Grayscale", min: 0, max: 100 },
                  { key: "sepia", label: "Sepia", min: 0, max: 100 },
                ].map(({ key, label, min, max }) => (
                  <div key={key}>
                    <div className="mb-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{label}</span>
                      <span>{filters[key]}%</span>
                    </div>
                    <input
                      type="range"
                      min={min}
                      max={max}
                      value={filters[key]}
                      onChange={(e) => setFilters((f) => ({ ...f, [key]: Number(e.target.value) }))}
                      className="w-full accent-blue-600"
                    />
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="mt-6 grid grid-cols-2 gap-2">
                <button
                  onClick={handleReset}
                  className="rounded-lg border border-gray-200 py-2 text-sm font-medium transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Reset
                </button>
                <button
                  onClick={handleUndo}
                  disabled={!history.length}
                  className="rounded-lg border border-gray-200 py-2 text-sm font-medium transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Undo
                </button>
                <button
                  onClick={handleApply}
                  className="col-span-2 rounded-lg border border-gray-200 py-2 text-sm font-medium transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Apply edit
                </button>
                <button
                  onClick={handleDownload}
                  className="col-span-2 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition hover:bg-blue-700 active:scale-[0.98]"
                >
                  Download
                </button>
              </div>
            </>
          )}
        </aside>
      </main>
    </div>
  );
}