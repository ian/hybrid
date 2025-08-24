import { format, isToday, isYesterday } from "date-fns";

/**
 * Formats a date string or Date object into a localized date string
 * @param stringOrDate - Date string or Date object to format
 * @returns Formatted date string (e.g., "Jan 1, 2024") or empty string if no input
 */
export function formatDate(stringOrDate?: string | Date): string {
	if (!stringOrDate) return "";

	const date = new Date(stringOrDate);

	return date.toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

/**
 * Formats a date relative to the current time
 * @param date - Date object to format
 * @returns Formatted string with relative time:
 * - "Today, [time]" for today's dates
 * - "Yesterday, [time]" for yesterday's dates
 * - "MMM d, h:mm a" for dates in current year
 * - "MMM d, yyyy" for dates in other years
 */
export function formatRelativeDate(date: Date) {
	if (isToday(date)) {
		return `Today, ${format(date, "h:mm a")}`;
	}
	if (isYesterday(date)) {
		return `Yesterday, ${format(date, "h:mm a")}`;
	}
	if (new Date().getFullYear() === date.getFullYear()) {
		return format(date, "MMM d, h:mm a");
	}
	return format(date, "MMM d, yyyy");
}
