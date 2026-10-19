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
