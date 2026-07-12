import React from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./lib/AuthContext.jsx";
import { PreferencesProvider } from "./lib/PreferencesContext.jsx";
import { RealtimeProvider } from "./lib/RealtimeContext.jsx";
import "./styles/rebuild.css";
import App from "./App.jsx";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "missing-google-client-id";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PreferencesProvider>
      <GoogleOAuthProvider clientId={googleClientId}>
        <AuthProvider>
          <RealtimeProvider>
            <App />
          </RealtimeProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </PreferencesProvider>
  </React.StrictMode>
);
