import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Initialize theme from localStorage before render
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  document.documentElement.setAttribute("data-theme", savedTheme);
}

// Apply user-specific or locally saved custom background; otherwise use pure CSS gradients
try {
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const savedBg = (user && user.backgroundUrl) || localStorage.getItem("bgUrl");
  if (savedBg) {
    document.documentElement.style.setProperty(
      "--poster-image",
      `url("${savedBg}")`
    );
  } else {
    document.documentElement.style.removeProperty("--poster-image");
  }
} catch {}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
    <ToastContainer position="top-right" autoClose={5000} theme="light" />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
