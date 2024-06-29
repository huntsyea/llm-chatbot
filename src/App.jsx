import React from 'react';
import ChatInterface from './components/ChatInterface';

function App() {
  return (
    <div className="max-h-screen bg-muted flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">Research LLM</h1>
      <div className="w-full max-w-3xl bg-background shadow-lg rounded-lg overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 8rem)' }}>
        <ChatInterface />
      </div>
    </div>
  );
}

export default App;