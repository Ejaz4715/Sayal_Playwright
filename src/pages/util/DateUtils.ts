export class DateUtils {
  /* @param {number} offsetDays - Days to add/subtract (default: 0)
   * @param {string} format - Target format string using YYYY, MM, DD (default: "YYYY-MM-DD")
   */
  static getDateWithOffsetAndFormat(offsetDays = 0, format = 'YYYY-MM-DD') {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);

    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return format.replace('YYYY', year).replace('MM', month).replace('DD', day);
  }

  static getDateISO(offsetDays = 0) {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  static getCurrentDateISO() {
    return DateUtils.getDateISO(0);
  }

  static getKsaTime(date = new Date()) {
    const formatted = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Asia/Riyadh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);

    return formatted.replace(' ', 'T');
  }

  /**
   * Gets the current local time, adds an offset in minutes, and formats the result.
   *
   * @param offsetMinutes - The number of minutes to add (or subtract if negative).
   * @param format - Desired output format ('HH:MM:SS' or 'HH:MM').
   * @param is24Hour - True for 24-hour format (default), false for 12-hour format (with AM/PM).
   * @returns A formatted time string.
   */
  static getFormattedFutureTime(offsetMinutes: number, format: 'HH:MM:SS' | 'HH:MM', is24Hour: boolean = true): string {
    const date = new Date();
    date.setMinutes(date.getMinutes() + offsetMinutes);

    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    let period = '';

    if (!is24Hour) {
      period = hours >= 12 ? ' PM' : ' AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // Handle hour '0' as '12' in 12-hour format
    }

    // Helper to ensure 2-digit padding (e.g., '9' -> '09')
    const pad = (n: number): string => n.toString().padStart(2, '0');

    const formattedHours = pad(hours);
    const formattedMinutes = pad(minutes);
    const formattedSeconds = pad(seconds);

    if (format === 'HH:MM:SS') {
      return `${formattedHours}:${formattedMinutes}:${formattedSeconds}${period}`;
    } else {
      return `${formattedHours}:${formattedMinutes}${period}`;
    }
  }

  static formatKsaTimeString(date: Date) {
    const formatted = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Asia/Riyadh',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);

    return formatted;
  }
}
