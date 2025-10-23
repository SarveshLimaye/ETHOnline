import { useCallback } from "react";

import {
  useJwtContext,
  useVincentWebAuthClient,
} from "@lit-protocol/vincent-app-sdk/react";

import { env } from "../config/env.ts";

const { VITE_APP_ID, VITE_REDIRECT_URI } = env;

export const useBackend = () => {
  const { authInfo } = useJwtContext();
  const vincentWebAuthClient = useVincentWebAuthClient(VITE_APP_ID);

  const getJwt = useCallback(() => {
    // Redirect to Vincent Auth consent page with appId and version
    vincentWebAuthClient.redirectToConnectPage({
      // consentPageUrl: `http://localhost:3000/`,
      redirectUri: VITE_REDIRECT_URI,
    });
  }, [vincentWebAuthClient]);

  return {
    getJwt,
  };
};
