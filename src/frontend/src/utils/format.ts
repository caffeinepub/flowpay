import type { Principal } from "@icp-sdk/core/principal";

/**
 * Format a bigint balance (stored in cents) to USD string
 */
export function formatBalance(cents: bigint): string {
  const dollars = Number(cents) / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

/**
 * Format a bigint balance to just the number (no currency symbol)
 */
export function formatBalanceNumber(cents: bigint): string {
  const dollars = Number(cents) / 100;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

/**
 * Format nanosecond timestamp to JS Date
 */
export function nsToDate(ns: bigint): Date {
  return new Date(Number(ns / BigInt(1_000_000)));
}

/**
 * Format nanosecond timestamp to readable string
 */
export function formatDate(ns: bigint): string {
  const date = nsToDate(ns);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/**
 * Format nanosecond timestamp to short time string
 */
export function formatDateTime(ns: bigint): string {
  const date = nsToDate(ns);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/**
 * Format a Principal to shortened display
 */
export function formatPrincipal(principal: Principal): string {
  const str = principal.toString();
  if (str.length <= 12) return str;
  return `${str.slice(0, 8)}...`;
}

/**
 * Format cents to compact dollar display (e.g. $1.2K)
 */
export function formatBalanceCompact(cents: bigint): string {
  const dollars = Number(cents) / 100;
  if (dollars >= 1000) {
    return `$${(dollars / 1000).toFixed(1)}K`;
  }
  return formatBalance(cents);
}

/**
 * Convert dollar string to bigint cents
 */
export function dollarsToCents(dollars: string): bigint {
  const num = Number.parseFloat(dollars.replace(/[^0-9.]/g, ""));
  if (Number.isNaN(num)) return BigInt(0);
  return BigInt(Math.round(num * 100));
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Get category color
 */
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Food: "oklch(0.7 0.18 145)",
    Transport: "oklch(0.65 0.2 210)",
    Shopping: "oklch(0.72 0.2 300)",
    Entertainment: "oklch(0.78 0.2 70)",
    Health: "oklch(0.68 0.22 30)",
    Other: "oklch(0.6 0.01 240)",
  };
  return colors[category] ?? colors.Other;
}

/**
 * Get category emoji
 */
export function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    Food: "🍔",
    Transport: "🚗",
    Shopping: "🛍️",
    Entertainment: "🎬",
    Health: "💊",
    Other: "💳",
  };
  return emojis[category] ?? emojis.Other;
}
