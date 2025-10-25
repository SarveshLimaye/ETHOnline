import { useState } from "react";
import { Buffer } from "buffer";
globalThis.Buffer = Buffer;
import { env } from "./config/env.ts";
import { useBackend } from "./hooks/useBackend";
import "./App.css";
import { LoginPage } from "./components/Login.tsx";

import {
  JwtProvider,
  useJwtContext,
} from "@lit-protocol/vincent-app-sdk/react";

const { VITE_APP_ID } = env;

function AppContent() {
  const { authInfo } = useJwtContext();

  return (
    <div>
      {authInfo ? (
        <div>
          <h1>Welcome</h1>
        </div>
      ) : (
        <LoginPage />
      )}
    </div>
  );
}

function App() {
  return (
    <JwtProvider appId={VITE_APP_ID}>
      <AppContent />
    </JwtProvider>
  );
}

export default App;
