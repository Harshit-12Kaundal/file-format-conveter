import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Navbar from "../Navbar";
import { setUploadedFile, clearUploadedFile } from "../../features/uploadSlice";
import { auth } from "../firebaseConfig"; // adjust path to match your project structure

import ActivityGrid from "./mainpageparts/activitygrid.jsx";
import ChangeHistory from "./mainpageparts/changehistory.jsx";
import StatsRow from "./mainpageparts/StatsRow.jsx";
import WorkSidebar from "./mainpageparts/Worksidebar.jsx";
import ActiveFileModal from "./mainpageparts/Activefilemodel.jsx";
import AddFileModal from "./mainpageparts/addfilemodel.jsx";

import { ROUTE_BY_TYPE } from "./mainpageparts/Constants.js";
import { getFileKind } from "./mainpageparts/helper.js";
import Calender from "./mainpageparts/Calender.jsx";

const API = "http://localhost:3001";

function Main() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const uploadedFile = useSelector((state) => state.upload.file); // still used by other pages, not for Open Document

  // Plain local state, untouched by Redux/Immer's dev-mode freezing
  // (which corrupts File objects) - the reliable copy for Open Document.
  const [activeFileObject, setActiveFileObject] = useState(null);

  const [tempFile, setTempFile] = useState(null);
  const [tempFileName, setTempFileName] = useState("");
  const [isAddPopup, setIsAddPopup] = useState(false);
  const [savedFileName, setSavedFileName] = useState("");
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [changeLog, setChangeLog] = useState([]);
  const [activeBranch, setActiveBranch] = useState("main");

  useEffect(() => {
    const stored = localStorage.getItem("uploadedFileName");
    if (stored) setSavedFileName(stored);

    const user = auth.currentUser;
    if (!user) return;

    axios
      .get(`${API}/conversions/${user.uid}`)
      .then(({ data }) => {
        const hist = data.map((c) => ({
          id: c.id,
          name: c.originalName,
          time: c.createdAt,
          filePath: c.filePath,
          type: c.type,
        }));
        setHistory(hist);
      })
      .catch((err) => console.error("Failed to load conversion history:", err));

    axios
      .get(`${API}/activity/${user.uid}`)
      .then(({ data }) => {
        const log = data.map((e) => ({
          id: e.id,
          fileName: e.fileName,
          type: e.type,
          title: e.title,
          detail: e.detail,
          date: e.createdAt,
          branch: e.branch,
        }));
        setChangeLog(log);
        if (stored) {
          const lastBranch = [...log].reverse().find((c) => c.fileName === stored)?.branch;
          if (lastBranch) setActiveBranch(lastBranch);
        }
      })
      .catch((err) => console.error("Failed to load activity:", err));
  }, []);

  const logChange = async (fileName, type, title, detail, branch) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const res = await axios.post(`${API}/activity`, {
        uid: user.uid,
        email: user.email,
        fileName,
        type,
        title,
        detail,
        branch,
      });

      const entry = {
        id: res.data.id,
        fileName,
        type,
        title,
        detail,
        date: res.data.createdAt,
        branch,
      };
      setChangeLog((prev) => [entry, ...prev]);
    } catch (err) {
      console.error("Failed to log change:", err);
    }
  };

  const handleUpload = (e) => {
    const f = e.target.files[0];
    if (f) {
      setTempFile(f);
      setTempFileName(f.name);
    }
  };

  const handleDone = () => {
    if (!tempFile) {
      alert("Select a file first");
      return;
    }
    dispatch(setUploadedFile(tempFile));
    setActiveFileObject(tempFile);
    localStorage.setItem("uploadedFileName", tempFileName);
    setSavedFileName(tempFileName);
    setActiveBranch("main");
    logChange(tempFileName, "create", "Added to workspace", undefined, "main");
    setTempFile(null);
    setTempFileName("");
    setIsAddPopup(false);
  };

  const handleRemoveFile = () => {
    dispatch(clearUploadedFile());
    localStorage.removeItem("uploadedFileName");
    setSavedFileName("");
    setActiveFileObject(null);
  };

  const handleOpenDocument = () => {
    if (!activeFileObject) {
      alert("Can't open this file directly yet - try Open Tools instead.");
      return;
    }

    const kind = getFileKind(activeFileObject, savedFileName);

    if (kind === "image") {
      navigate("/convert/image-editor", {
        state: { file: activeFileObject, fileName: savedFileName },
      });
    } else if (kind === "pdf" || kind === "docx") {
      navigate("/convert/document-viewer", {
        state: { file: activeFileObject, fileName: savedFileName },
      });
    } else {
      alert("No direct viewer for this file type yet - try Open Tools instead.");
    }
  };

  const handleRename = () => {
    if (!savedFileName) return;
    const next = window.prompt("Rename file", savedFileName);
    if (!next || next === savedFileName) return;
    logChange(next, "rename", "Renamed title", `"${savedFileName}" → "${next}"`, activeBranch);
    localStorage.setItem("uploadedFileName", next);
    setSavedFileName(next);
  };

  const handleNewBranch = () => {
    if (!savedFileName) return;
    const name = window.prompt("New branch name", "review");
    if (!name) return;
    logChange(savedFileName, "branch", `Created branch '${name}' from '${activeBranch}'`, undefined, name);
    setActiveBranch(name);
  };

  // Navigate to the RIGHT conversion tool page, carrying the file's
  // real database id - used by the "Convert" action in the sidebar menu.
  const handleConvertFile = (item) => {
    const route = ROUTE_BY_TYPE[item.type] || "/tools";
    navigate(route, { state: { fileId: item.id, fileName: item.name } });
  };

  // Navigate to the READ-ONLY viewer for a history item, based on its
  // file extension - ImageEditor for images, DocumentViewer for
  // PDF/DOCX. Both pages already support loading by fileId.
  const handleOpenDocumentFromHistory = (item) => {
    const kind = getFileKind(null, item.name);
    if (kind === "image") {
      navigate("/convert/image-editor", { state: { fileId: item.id, fileName: item.name } });
    } else if (kind === "pdf" || kind === "docx") {
      navigate("/convert/document-viewer", { state: { fileId: item.id, fileName: item.name } });
    } else {
      alert("No direct viewer for this file type yet - try Convert instead.");
    }
  };

  const removeFromHistory = (item) => {
    setHistory((prev) => prev.filter((h) => h.name !== item.name || h.time !== item.time));
  };

  const fileChanges = changeLog;
  const fileBranches = [...new Set(changeLog.map((c) => c.branch))].reverse();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Navbar />

      <main className="flex flex-1 overflow-hidden">
        <WorkSidebar
          history={history}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenDocument={handleOpenDocumentFromHistory}
          onConvertFile={handleConvertFile}
          onRemoveFromHistory={removeFromHistory}
          onNewFile={() => setIsAddPopup(true)}
        />

        <section className="flex flex-1 flex-col overflow-y-auto bg-gray-50/50 p-6 dark:bg-gray-900/50">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Global Workspace</h2>
              <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">Manage your files and start creating.</p>
            </div>
            <button
              onClick={() => navigate("/main/designer")}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-blue-600/30 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
              Create
            </button>
          </div>

          <StatsRow history={history} changeLog={changeLog} />


          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <ActivityGrid changes={fileChanges} />
            <Calender />
          </div>
            <ChangeHistory
              changes={fileChanges}
              branches={fileBranches.length ? fileBranches : [activeBranch]}
              activeBranch={activeBranch}
              onNewBranch={handleNewBranch}
            />
        </section>
      </main>

      <ActiveFileModal
        savedFileName={savedFileName}
        activeBranch={activeBranch}
        onRemove={handleRemoveFile}
        onOpenDocument={handleOpenDocument}
        onRename={handleRename}
        onOpenTools={() => navigate("/tools", { state: { fileName: savedFileName } })}
      />

      <AddFileModal
        isOpen={isAddPopup}
        onClose={() => setIsAddPopup(false)}
        tempFileName={tempFileName}
        onFileSelect={handleUpload}
        onDone={handleDone}
        canSubmit={!!tempFile}
      />

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .themed-scroll::-webkit-scrollbar { width: 8px; }
        .themed-scroll::-webkit-scrollbar-track { background: transparent; }
        .themed-scroll::-webkit-scrollbar-thumb {
          background-color: rgb(203 213 225);
          border-radius: 9999px;
        }
        .themed-scroll::-webkit-scrollbar-thumb:hover { background-color: rgb(148 163 184); }
        .dark .themed-scroll::-webkit-scrollbar-thumb { background-color: rgb(55 65 81); }
        .dark .themed-scroll::-webkit-scrollbar-thumb:hover { background-color: rgb(59 130 246); }
        .themed-scroll { scrollbar-width: thin; scrollbar-color: rgb(203 213 225) transparent; }
        .dark .themed-scroll { scrollbar-color: rgb(55 65 81) transparent; }
      `}</style>
    </div>
  );
}

export default Main;