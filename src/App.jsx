import React from "react";
import ChatInterface from "./components/ChatInterface";

function App() {
  return (
    <div className="flex max-h-screen bg-muted flex-col justify-center ">
      <div className="flex flex-col  mb-2 align-top">
      <h1 className="text-xl sm:text-3xl font-bold text-primary align">
  <span style={{ display: 'inline-flex', alignItems: 'baseline', marginLeft: '4px', marginRight: '3px' }}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 20"
      fill="none"
      stroke="#7c3aed"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-rabbit"
    >
      <path d="M13 16a3 3 0 0 1 2.24 5" />
      <path d="M18 12h.01" />
      <path d="M18 21h-8a4 4 0 0 1-4-4 7 7 0 0 1 7-7h.2L9.6 6.4a1 1 0 1 1 2.8-2.8L15.8 7h.2c3.3 0 6 2.7 6 6v1a2 2 0 0 1-2 2h-1a3 3 0 0 0-3 3" />
      <path d="M20 8.54V4a2 2 0 1 0-4 0v3" />
      <path d="M7.612 12.524a3 3 0 1 0-1.6 4.3" />
    </svg>
  </span>
  wabbit
</h1>
      </div>
      <div className="flex items-center justify-center">
        <ChatInterface />
      </div>
    </div>
  );
}

export default App;