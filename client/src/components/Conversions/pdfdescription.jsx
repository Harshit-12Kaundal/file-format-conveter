import React, { useState, useRef, useEffect } from "react";
import {
  FaPaperPlane, FaFilePdf, FaFileWord,
  FaCompressAlt, FaObjectGroup, FaExchangeAlt,
} from "react-icons/fa";
import axios from "axios";
import Navbar from "../Navbar";
import { auth } from "../firebaseConfig";

const BASE_URL = "http://localhost:3001";

const CONVERSIONS = [
  {
    id: "pdf_to_docx",
    route: `${BASE_URL}/convertfile/pdf/to-docx`,
    label: "PDF → Word",
    icon: <FaFileWord />,
    field: "file",
    multi: false,
    outputExt: ".docx",
    match: (t) =>
      (t.includes("word") || t.includes("docx")) &&
      !t.includes("word to pdf") && !t.includes("docx to pdf"),
    hint: "convert this pdf to word",
  },
  {
    id: "pdf_merge",
    route: `${BASE_URL}/convertfile/pdf/to-merge`,
    label: "Merge PDFs",
    icon: <FaObjectGroup />,
    field: ["file1", "file2"],
    multi: true,
    outputExt: ".pdf",
    match: (t) => t.includes("merge"),
    hint: "merge two pdfs",
  },
  {
    id: "pdf_compress",
    route: `${BASE_URL}/convertfile/pdf/to-compress`,
    label: "Compress PDF",
    icon: <FaCompressAlt />,
    field: "file",
    multi: false,
    outputExt: ".pdf",
    match: (t) => t.includes("compress") || t.includes("reduce"),
    hint: "compress this pdf",
  },
  {
    id: "docx_to_pdf",
    route: `${BASE_URL}/convertfile/docx/to-pdf`,
    label: "Word → PDF",
    icon: <FaFilePdf />,
    field: "file",
    multi: false,
    outputExt: ".pdf",
    match: (t) =>
      t.includes("word to pdf") || t.includes("docx to pdf") ||
      (t.includes("word") && t.includes("pdf")),
    hint: "convert word to pdf",
  },
];

function detectConversion(text) {
  const lower = text.toLowerCase();
  const isConvertRequest =
    lower.includes("convert") || lower.includes("merge") ||
    lower.includes("compress") || lower.includes("reduce") ||
    lower.includes("to pdf")   || lower.includes("to word") ||
    lower.includes("to docx");
  if (!isConvertRequest) return null;
  return CONVERSIONS.find((c) => c.match(lower)) ?? null;
}

async function callConversionAPI(conversion, rawFile, rawSecondFile, currentUser) {
  const formData = new FormData();
  formData.append("intent", conversion.id);

  if (conversion.multi) {
    formData.append("file1", rawFile);
    if (rawSecondFile) formData.append("file2", rawSecondFile);
  } else {
    formData.append(conversion.field, rawFile);
  }

  // NEW: send uid/email so the backend can log this conversion,
  // same as the dedicated single-purpose pages do.
  if (currentUser) {
    formData.append("uid", currentUser.uid);
    formData.append("email", currentUser.email);
  }

  const res = await axios.post(conversion.route, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    responseType: "blob",
  });

  const originalBase = rawFile.name.replace(/\.[^/.]+$/, "");
  const downloadName = `${originalBase}_converted${conversion.outputExt}`;

  const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
  const link    = document.createElement("a");
  link.href     = blobUrl;
  link.download = downloadName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);

  return downloadName;
}

export default function PDFChatInterface() {

  const [rawFile, setRawFile]               = useState(null);
  const [rawSecondFile, setRawSecondFile]   = useState(null);
  const [fileId, setFileId]                 = useState(null);
  const [isIndexed, setIsIndexed]           = useState(false);
  const [loading, setLoading]               = useState(false);
  const [messages, setMessages]             = useState([]);
  const [input, setInput]                   = useState("");
  const [liveConversion, setLiveConversion] = useState(null);

  const fileInputRef   = useRef();
  const secondFileRef  = useRef();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setLiveConversion(input.trim() ? detectConversion(input) : null);
  }, [input]);

  const addMessage = (type, text, extra = {}) =>
    setMessages((prev) => [...prev, { type, text, ...extra }]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setRawFile(file);
    setFileId(null);
    setLoading(true);
    addMessage("system", `"${file.name}" uploading…`);

    const formData = new FormData();
    formData.append("file", file);

    // NEW: send uid/email so /ai/upload can associate this with the
    // logged-in user (needed for ASK_AI conversion logging server-side).
    const user = auth.currentUser;
    if (user) {
      formData.append("uid", user.uid);
      formData.append("email", user.email);
    }

    try {
      const res = await axios.post(`${BASE_URL}/ai/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFileId(res.data.fileId);
      setIsIndexed(res.data.indexed === true);
      if (res.data.indexed) {
        addMessage("system", "Ready! Ask questions or request a conversion.");
      } else {
        addMessage("system", "File ready for conversion. (AI chat only works with PDFs)");
      }
    } catch {
      addMessage("system", "AI indexing failed — conversions still work.");
    }

    setLoading(false);
  };

  const handleSecondFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setRawSecondFile(file);
    addMessage("system", `Second file "${file.name}" ready.`);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !rawFile) return;

    const userText = input.trim();
    addMessage("user", userText);
    setInput("");
    setLoading(true);

    const conversion = detectConversion(userText);
    const currentUser = auth.currentUser;

    try {

      if (conversion) {

        if (conversion.multi && !rawSecondFile) {
          addMessage("system", "Please select a second PDF for merging.");
          secondFileRef.current?.click();
          setLoading(false);
          return;
        }

        addMessage("system", `${conversion.label} in progress…`);

        const downloadName = await callConversionAPI(conversion, rawFile, rawSecondFile, currentUser);

        addMessage("bot", `Done! "${downloadName}" has been downloaded to your device.`);

      } else {

        if (!fileId || !isIndexed) {
          addMessage("bot", "AI chat only works with PDF files. Please upload a PDF to ask questions.");
          setLoading(false);
          return;
        }

        const res = await axios.post(`${BASE_URL}/ai/ask`, {
          fileId,
          question: userText,
          // NEW: pass uid so the backend can log this as an ASK_AI event
          uid: currentUser?.uid,
          email: currentUser?.email,
        });

        addMessage("bot", res.data.answer || "No response.");
      }

    } catch (err) {
      console.error(err);
      addMessage("bot", "Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e); }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-900 text-white">
      <Navbar className="fixed" />

      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 text-center px-4 pt-24 pb-60 gap-6">
          <div className="text-5xl">📄</div>
          <h1 className="text-2xl font-semibold">Document AI Assistant</h1>
          <p className="text-gray-400 max-w-md text-sm">
            Upload a file, then ask questions or convert it to another format.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-1">
            {CONVERSIONS.map((c) => (
              <button key={c.id} onClick={() => setInput(c.hint)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs
                           bg-gray-800 border border-gray-700 hover:border-blue-500
                           hover:text-blue-400 transition text-gray-300">
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 max-w-3xl mx-auto w-full px-4 pt-24 pb-52">
        {messages.map((msg, idx) => (
          <div key={idx}
            className={`rounded-xl px-4 py-3 text-sm break-words leading-relaxed
              ${msg.type === "user"
                ? "self-end bg-blue-600 text-white max-w-[75%]"
                : msg.type === "bot"
                ? "self-start bg-gray-700 text-white max-w-[80%]"
                : "self-center text-gray-400 text-xs bg-gray-800/50 px-3 py-1.5 rounded-full"
              }`}>
            {msg.text}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-gray-400 italic self-start">
            <span className="animate-pulse">●</span> Processing…
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend}
        className="fixed bottom-0 left-0 w-full flex flex-col items-center
                   bg-gray-900/90 backdrop-blur-md border-t border-gray-700 py-4 shadow-2xl">

        {liveConversion && (
          <div className="w-full max-w-3xl mb-2 px-4">
            <span className="inline-flex items-center gap-1.5 text-xs bg-blue-600/20 border
                             border-blue-500/40 text-blue-300 px-3 py-1 rounded-full">
              <FaExchangeAlt size={10} />
              Detected: <strong className="ml-1">{liveConversion.label}</strong>
              <span className="text-gray-500 ml-1">→ {liveConversion.route.replace(BASE_URL, "")}</span>
            </span>
          </div>
        )}

        <div className="w-full max-w-3xl mb-2 px-4 flex flex-col gap-1">
          {rawFile && (
            <div className="flex items-center justify-between bg-gray-700/60 px-3 py-2 rounded-lg text-sm text-blue-400">
              <div className="flex items-center gap-2 overflow-hidden">
                <FaFilePdf size={14} />
                <span className="truncate">{rawFile.name}</span>
              </div>
              <button type="button"
                onClick={() => { setRawFile(null); setFileId(null); setIsIndexed(false); }}
                className="text-red-400 hover:text-red-500 text-xs ml-2 shrink-0">✕</button>
            </div>
          )}

          {liveConversion?.multi && (
            <div className="flex items-center justify-between bg-gray-700/60 px-3 py-2 rounded-lg text-sm text-purple-400">
              <div className="flex items-center gap-2 overflow-hidden">
                <FaFilePdf size={14} />
                <span className="truncate">
                  {rawSecondFile ? rawSecondFile.name : "Select second PDF for merge…"}
                </span>
              </div>
              <button type="button" onClick={() => secondFileRef.current.click()}
                className="text-purple-300 hover:text-purple-100 text-xs ml-2 shrink-0">
                {rawSecondFile ? "Change" : "Browse"}
              </button>
              <input ref={secondFileRef} type="file" accept=".pdf"
                className="hidden" onChange={handleSecondFileChange} />
            </div>
          )}
        </div>

        <div className="flex items-end w-full max-w-3xl gap-2 px-4">
          <button type="button" onClick={() => fileInputRef.current.click()} title="Upload file"
            className="bg-gray-700 hover:bg-blue-600 text-gray-300 hover:text-white
                       rounded-xl p-3 transition duration-200 shadow shrink-0">
            <FaFilePdf size={16} />
            <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt"
              className="hidden" onChange={handleFileChange} />
          </button>

          <textarea rows={1}
            className="flex-1 max-h-40 min-h-[44px] px-4 py-3 bg-gray-800 text-white
                       rounded-xl resize-none placeholder-gray-500
                       focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            placeholder={rawFile
              ? 'Ask anything or say "convert to Word / compress / merge…"'
              : "Upload a file first…"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <button type="submit"
            disabled={loading || !input.trim() || !rawFile}
            className={`px-4 py-3 rounded-xl flex items-center justify-center transition shrink-0
              ${loading || !input.trim() || !rawFile
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow"}`}>
            <FaPaperPlane size={15} />
          </button>
        </div>

        <p className="text-[11px] text-gray-600 mt-2">
          Supports PDF, DOCX, TXT · Enter to send · Shift+Enter for new line
        </p>
      </form>
    </div>
  );
}