/**
 * @file timeHelper.js
 * @description Time calculation and calendar scheduling utility functions.
 * Handles slot intervals, 12h/24h time conversions, duration math,
 * and time collision detection between scheduled appointments.
 */

/**
 * Converts a 12-hour format string (e.g. "10:00 AM", "2:30 PM") into a 24-hour SQL TIME string ("10:00:00", "14:30:00").
 * @param {string} time12h - Time string in 12-hour format
 * @returns {string} Time string in 24-hour format (HH:MM:SS)
 */
function to24HourTime(time12h) {
  if (!time12h) return "00:00:00";
  const trimmed = String(time12h).trim();

  // If already in 24h format (HH:MM or HH:MM:SS)
  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})(:(\d{2}))?$/);
  if (match24 && !trimmed.toLowerCase().includes('am') && !trimmed.toLowerCase().includes('pm')) {
    const hours = String(match24[1]).padStart(2, '0');
    const mins = match24[2];
    const secs = match24[4] || '00';
    return `${hours}:${mins}:${secs}`;
  }

  const match = trimmed.match(/^(\d{1,2}):?(\d{2})?\s*(AM|PM)$/i);
  if (!match) return `${trimmed.slice(0, 5)}:00`;

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? match[2] : '00';
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return `${String(hours).padStart(2, '0')}:${minutes}:00`;
}

/**
 * Converts a 24-hour SQL TIME string ("14:00:00") into a user-friendly 12-hour display string ("2:00 PM").
 * @param {string} time24h - 24-hour time string
 * @returns {string} 12-hour display string
 */
function to12HourDisplay(time24h) {
  if (!time24h) return "";
  const [hourStr, minStr] = String(time24h).split(':');
  let hour = parseInt(hourStr, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minStr || '00'} ${period}`;
}

/**
 * Calculates end time by adding a duration (in minutes) to a 24-hour start time.
 * @param {string} startTime - Format "HH:MM:SS" or "HH:MM"
 * @param {number} [durationMinutes=60] - Duration in minutes
 * @returns {string} Calculated end time in "HH:MM:SS" format
 */
function calculateEndTime(startTime, durationMinutes = 60) {
  const [hour, min] = String(startTime).split(':').map(num => parseInt(num, 10) || 0);
  const totalMins = hour * 60 + min + parseInt(durationMinutes, 10);
  const endHour = Math.floor(totalMins / 60) % 24;
  const endMin = totalMins % 60;
  return `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}:00`;
}

/**
 * Generates an array of discrete time slots between working start and end hours.
 * @param {string} startTime - e.g. "09:00:00"
 * @param {string} endTime - e.g. "17:00:00"
 * @param {number} [stepMinutes=60] - Slot step size
 * @returns {string[]} Array of slots in 12-hour display format
 */
function generateHourlySlots(startTime, endTime, stepMinutes = 60) {
  const [startHour, startMin] = String(startTime).split(':').map(Number);
  const [endHour, endMin] = String(endTime).split(':').map(Number);

  let currentMinutes = startHour * 60 + (startMin || 0);
  const endMinutes = endHour * 60 + (endMin || 0);
  const slots = [];

  while (currentMinutes + stepMinutes <= endMinutes) {
    const h = Math.floor(currentMinutes / 60);
    const m = currentMinutes % 60;
    const time24 = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
    slots.push(to12HourDisplay(time24));
    currentMinutes += stepMinutes;
  }

  return slots;
}

/**
 * Determines whether two time intervals overlap on the same calendar date.
 * Interval 1: [start1, end1], Interval 2: [start2, end2]
 * @param {string} start1 - 24h start time 1
 * @param {string} end1 - 24h end time 1
 * @param {string} start2 - 24h start time 2
 * @param {string} end2 - 24h end time 2
 * @returns {boolean} True if the two intervals collide
 */
function checkTimeOverlap(start1, end1, start2, end2) {
  const s1 = to24HourTime(start1);
  const e1 = to24HourTime(end1);
  const s2 = to24HourTime(start2);
  const e2 = to24HourTime(end2);

  // Overlap occurs when start1 < end2 AND start2 < end1
  return s1 < e2 && s2 < e1;
}

module.exports = {
  to24HourTime,
  to12HourDisplay,
  calculateEndTime,
  generateHourlySlots,
  checkTimeOverlap
};
