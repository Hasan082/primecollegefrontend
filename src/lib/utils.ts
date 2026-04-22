import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: string | number | null | undefined, currencyCode?: string) {
  if (price === null || price === undefined) return "No price set";

  const amount = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(amount)) return "Invalid price";

  const code = (currencyCode || "GBP").toUpperCase();

  const symbols: Record<string, string> = {
    GBP: "£",
    USD: "$",
    EUR: "€",
  };

  const symbol = symbols[code] || code;

  // Use a space between symbol and amount for better readability in some currencies or if it's a code


  return `${symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
