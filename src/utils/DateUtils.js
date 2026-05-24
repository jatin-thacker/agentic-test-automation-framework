export class DateUtils {
  static nowIso() {
    return new Date().toISOString();
  }

  static timestampForPath(date = new Date()) {
    const iso = date.toISOString();
    return iso.replace(/[:.]/g, "-");
  }
}

export default DateUtils;
