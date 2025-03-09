import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Get the root element from the DOM
// Non-null assertion is used here because we know this element exists in our HTML
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
