import React from "react";
import Desnav from "./Desnav";
import Leftsidebar from "./Leftsidebar";
import CanvasWorkspace from "./CanvasWorkspace";
import Rightsidebar from "./Rightsidebar";

export default function Designer() {
  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <Desnav />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Leftsidebar />
        <CanvasWorkspace />
        <Rightsidebar />
      </div>
    </div>
  );
}
