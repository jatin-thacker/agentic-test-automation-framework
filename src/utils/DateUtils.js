let lastTimestampBase = "";
let timestampSequence = 0;

export class DateUtils {
  static nowIso() {
    return new Date().toISOString();
  }

  static timestampForPath(date = new Date()) {
    const base = date.toISOString().replace(/[:.]/g, "-");
    if (base === lastTimestampBase) {
      timestampSequence += 1;
    } else {
      lastTimestampBase = base;
      timestampSequence = 0;
    }

    const sequenceSuffix = timestampSequence > 0 ? `-${timestampSequence}` : "";
    return `${base}-p${process.pid}${sequenceSuffix}`;
  }
}

export default DateUtils;
