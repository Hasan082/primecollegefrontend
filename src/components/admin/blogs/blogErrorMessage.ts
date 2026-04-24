type ApiErrorPayload = {
  message?: string;
  data?: Record<string, string[] | string | undefined>;
  error?: string;
};

type MutationErrorShape = {
  data?: ApiErrorPayload | string;
  error?: string;
  status?: number | string;
};

const getFirstFieldError = (data?: ApiErrorPayload["data"]) => {
  if (!data || typeof data !== "object") return null;

  for (const value of Object.values(data)) {
    if (Array.isArray(value) && value.length > 0 && value[0]) {
      return value[0];
    }
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return null;
};

export const getBlogErrorMessage = (error: unknown, fallback: string) => {
  if (!error || typeof error !== "object") return fallback;

  const mutationError = error as MutationErrorShape;
  const payload =
    typeof mutationError.data === "object" && mutationError.data !== null
      ? mutationError.data
      : undefined;

  return (
    getFirstFieldError(payload?.data) ||
    payload?.message ||
    payload?.error ||
    mutationError.error ||
    fallback
  );
};
