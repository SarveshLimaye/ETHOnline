import { useState } from "react";
import { Buffer } from "buffer";
globalThis.Buffer = Buffer;
import { env } from "./config/env.ts";
import { useBackend } from "./hooks/useBackend";

import {
  JwtProvider,
  useJwtContext,
} from "@lit-protocol/vincent-app-sdk/react";

const { VITE_APP_ID } = env;

function AppContent() {
  const { authInfo } = useJwtContext();
  const { getJwt } = useBackend();

  return (
    <div>
      {authInfo ? (
        <div>
          <h1>Welcome</h1>
        </div>
      ) : (
        <div>
          <h1>Please log in</h1>
          <button onClick={getJwt}>Log In</button>
        </div>
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
