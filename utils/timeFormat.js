// Time formatting utilities for consistent 12-hour format throughout the project

/**
 * Convert 24-hour time format to 12-hour format
 * @param {string} time24 - Time in 24-hour format (e.g., "15:00", "09:30")
 * @returns {string} Time in 12-hour format (e.g., "3:00 PM", "9:30 AM")
 */
export const formatTime12Hour = (time24) => {
  if (!time24) return "N/A";

  const [hours, minutes] = time24.split(":");
  const hour24 = parseInt(hours, 10);

  if (isNaN(hour24)) return time24; // Return original if not a valid time

  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  const ampm = hour24 >= 12 ? "PM" : "AM";

  return `${hour12}:${minutes || "00"} ${ampm}`;
};

/**
 * Format datetime string to 12-hour format
 * @param {string} dateTime - DateTime string (e.g., "2024-01-15 15:30:00")
 * @returns {string} Formatted datetime (e.g., "Jan 15, 2024 at 3:30 PM")
 */
export const formatDateTime12Hour = (dateTime) => {
  if (!dateTime) return "N/A";

  try {
    const date = new Date(dateTime);
    const dateStr = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return `${dateStr} at ${timeStr}`;
  } catch (error) {
    return dateTime; // Return original if parsing fails
  }
};

/**
 * Format date and time separately for admin displays
 * @param {string} dateTime - DateTime string
 * @returns {object} Object with formatted date and time
 */
export const formatDateTimeComponents = (dateTime) => {
  if (!dateTime) return { date: "N/A", time: "N/A" };

  try {
    const date = new Date(dateTime);
    const dateStr = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return { date: dateStr, time: timeStr };
  } catch (error) {
    return { date: dateTime, time: "N/A" };
  }
};

/**
 * Check if a time slot is in the past (for filtering)
 * @param {string} time24 - Time in 24-hour format
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {boolean} True if the time is in the past
 */
export const isTimeInPast = (time24, date) => {
  if (!time24 || !date) return false;

  const today = new Date().toISOString().split("T")[0];
  if (date !== today) return false;

  const [hours] = time24.split(":");
  const hour24 = parseInt(hours, 10);
  const nowHour = new Date().getHours();

  return hour24 <= nowHour;
};
