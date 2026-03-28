/**
 * Removes keys with null, undefined, or empty string values from an object.
 * @param obj - The object to clean
 * @returns A new object with only meaningful key-value pairs
 */
export const cleanObject = <T extends Record<string, unknown>>(
    obj: T
): Partial<T> => {
    const cleaned: Partial<T> = {};

    Object.entries(obj).forEach(([key, value]) => {
        if (
            value !== null &&
            value !== undefined &&
            !(typeof value === "string" && value.trim() === "")
        ) {
            (cleaned as Record<string, unknown>)[key] = value;
        }
    });

    return cleaned;
};