import { Buffer } from "buffer";
globalThis.Buffer = Buffer;
import { env } from "./config/env.ts";
import "./App.css";
import { LoginPage } from "./components/Login.tsx";
import { DashboardPage } from "./components/Dashboard.tsx";

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
        <DashboardPage
          userAddress={authInfo.pkp.ethAddress}
          onLogout={() => {}}
        />
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
