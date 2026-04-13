import { appParams } from "@/lib/app-params";

const BASE_URL = "https://base44.app/api";
const APP_ID = "69cf82674cfb1b4a1759fe28";
const DEFAULT_API_KEY = "bda5ff4cff114e7da9d8a5565b189747";

const getHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
  };

  // Use the provided token if available, otherwise fallback to the default API key
  if (appParams.token) {
    headers["Authorization"] = `Bearer ${appParams.token}`;
  } else {
    headers["api_key"] = DEFAULT_API_KEY;
  }

  return headers;
};

class HttpError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new HttpError(
      errorData.message || `HTTP error! status: ${response.status}`,
      response.status,
      errorData,
    );
  }

  return response.json();
};

export const base44 = {
  entities: {
    FinancingRequest: {
      filter: async (params) => {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(
          `${BASE_URL}/apps/${APP_ID}/entities/FinancingRequest?${query}`,
          {
            headers: getHeaders(),
          },
        );
        return handleResponse(response);
      },
      get: async (id) => {
        const response = await fetch(
          `${BASE_URL}/apps/${APP_ID}/entities/FinancingRequest/${id}`,
          {
            headers: getHeaders(),
          },
        );
        return handleResponse(response);
      },
      update: async (id, data) => {
        const response = await fetch(
          `${BASE_URL}/apps/${APP_ID}/entities/FinancingRequest/${id}`,
          {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(data),
          },
        );
        return handleResponse(response);
      },
    },
    CustomerLink: {
      filter: async (params) => {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(
          `${BASE_URL}/apps/${APP_ID}/entities/CustomerLink?${query}`,
          {
            headers: getHeaders(),
          },
        );
        return handleResponse(response);
      },
      update: async (id, data) => {
        const response = await fetch(
          `${BASE_URL}/apps/${APP_ID}/entities/CustomerLink/${id}`,
          {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(data),
          },
        );
        return handleResponse(response);
      },
    },
  },
  functions: {
    invoke: async (functionName, data) => {
      const response = await fetch(
        `${BASE_URL}/apps/${APP_ID}/functions/${functionName}`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(data),
        },
      );
      return handleResponse(response);
    },
  },
  auth: {
    me: async () => {
      // Trying the standard auth/me endpoint
      const response = await fetch(`${BASE_URL}/auth/me`, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    logout: (redirectUrl) => {
      localStorage.removeItem("base44_access_token");
      localStorage.removeItem("token");
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    },
    redirectToLogin: (redirectUrl) => {
      const loginUrl = `${BASE_URL.replace("/api", "")}/login?app_id=${APP_ID}&redirect_url=${encodeURIComponent(redirectUrl)}`;
      window.location.href = loginUrl;
    },
  },
};
