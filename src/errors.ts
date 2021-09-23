import axios from "axios";

export { G4ApiError, getG4ApiError };

type G4ApiError = {
  source: "network" | "http" | "auth" | "g4" | "validation" | "other";
  code?: string;
  message: string;
};

function getG4ApiError(error: unknown): G4ApiError {
  if (!axios.isAxiosError(error)) {
    return {
      source: "other",
      message: error instanceof Error ? error.message : "unknown error",
    };
  }
  if (typeof error.code !== "undefined") {
    return {
      source: "network",
      code: error.code,
      message: error.message,
    };
  }
  const g4error = error.response?.headers["x-g4-error"];
  if (typeof g4error !== "undefined") {
    return {
      source: "g4",
      message: g4error,
    };
  }
  const status = error.response?.data.status;
  if (typeof status === "number") {
    switch (status) {
      case 400:
        const statusText = error.response?.data.statusText;
        if (typeof statusText === "undefined") {
          return {
            source: "validation",
            message: JSON.stringify(error.response?.data.errors),
          };
        }
        return {
          source: "http",
          message: statusText,
        };
      case 401:
        return {
          source: "auth",
          message: "unauthorized request",
        };
      default:
        return {
          source: "http",
          message: `status: ${status}`,
        };
    }
  }
  return {
    source: "other",
    message: `${error.name}: ${error.message}`,
  };
}
