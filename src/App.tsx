import React from "react";
import ChatInterface from "./components/ChatInterface";

/**
 * App component serves as the root of the application. It contains the header
 * with logo and main application area.
 *
 * @returns React component
 */
const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-muted flex flex-col items-center">
      <header className="w-full container-1200 px-4 sm:px-6 lg:px-8 py-4">
        <h1 className="text-xl sm:text-3xl font-bold text-primary flex items-center justify-center">
          <span className="inline-flex items-baseline mr-2">
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
      </header>
      <main className="w-full container-1200 flex-grow">
        <ChatInterface />
      </main>
    </div>
  );
};

export default App;
