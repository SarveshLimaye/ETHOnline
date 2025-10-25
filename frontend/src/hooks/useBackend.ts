import { useCallback } from "react";

import {
  useJwtContext,
  useVincentWebAuthClient,
} from "@lit-protocol/vincent-app-sdk/react";

import { env } from "../config/env.ts";

const { VITE_APP_ID, VITE_REDIRECT_URI, VITE_BACKEND_URL } = env;

type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE";

export type Order = {
  ethAddress: string;
  collateralPriceMax: number;
  collateralPriceMin: number;
  collateralAsset: string;
  loanAsset: string;
  orderType: "automatedLeverageManagement" | "stopLoss" | "takeProfit";
  healthRatioToMaintain?: number;
};

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

  const sendRequest = useCallback(
    async <T>(
      endpoint: string,
      method: HTTPMethod,
      body?: unknown
    ): Promise<T> => {
      if (!authInfo?.jwt) {
        throw new Error("No JWT to query backend");
      }

      const headers: HeadersInit = {
        Authorization: `Bearer ${authInfo.jwt}`,
      };
      if (body != null) {
        headers["Content-Type"] = "application/json";
      }

      const response = await fetch(`${VITE_BACKEND_URL}${endpoint}`, {
        method,
        headers,
        ...(body ? { body: JSON.stringify(body) } : {}),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = (await response.json()) as { data: T; success: boolean };

      console.log("Response from backend:", json);

      if (!json) {
        throw new Error(`Backend error:`);
      }

      return json.data;
    },
    [authInfo]
  );

  const createOrder = useCallback(
    async (order: Order) => {
      return sendRequest<Order>("/api/orders", "POST", order);
    },
    [sendRequest]
  );

  return {
    getJwt,
    sendRequest,
    createOrder,
  };
};
