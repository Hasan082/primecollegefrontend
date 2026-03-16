/* eslint-disable @typescript-eslint/no-explicit-any */
export const TryCatch = async <T>(
  promise: Promise<T>,
): Promise<[T | null, string | null]> => {
  try {
    const data = await promise;
    return [data, null];
  } catch (error: any) {
    let message = "Something went wrong";

    if (Array.isArray(error?.data?.message)) {
      message = error.data.message[0];
    } else if (error?.data?.message) {
      message = error.data.message;
    }

    return [null, message];
  }
};
