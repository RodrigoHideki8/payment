import { holidaysForYear } from './holiday.utils';

enum DayNumber {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}
export abstract class DateUtils {
  static getCurrentDateWithTimeZone(): Date {
    return new Date();
  }

  static isBeforeDay(startDate: Date, endDate: Date) {
    endDate.setHours(0, 0, 0, 0);
    return startDate < endDate;
  }

  static addDays(date: Date, days: number) {
    const result = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    result.setDate(result.getDate() + days);
    return result;
  }

  static addBusinessDays(date: Date, days: number) {
    const result = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    result.setDate(result.getDate() + days);

    return this.countNonWorkingDays(result);
  }

  static addMonth(date: Date, months: number) {
    const result = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    result.setMonth(result.getMonth() + months);
    return result;
  }
  static dateDiffInDays(a: Date, b: Date) {
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
  }

  static formatDateToYYYYMMDD(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  static isWeekend(date: Date) {
    const day = date.getDay();
    return day === DayNumber.SUNDAY || day === DayNumber.SATURDAY;
  }

  static isHoliday(date: Date) {
    const formattedDate = this.formatDateToYYYYMMDD(date);
    const holidaysYear = holidaysForYear(date.getFullYear());
    return holidaysYear.some((holiday) => holiday.date.includes(formattedDate));
  }

  static isWeekendOrHoliday = (currentDate: Date) => {
    return (
      this.isWeekend(currentDate) ||
      (this.isHoliday(currentDate) &&
        currentDate.getDay() >= DayNumber.MONDAY &&
        currentDate.getDay() <= DayNumber.FRIDAY)
    );
  };

  static countNonWorkingDays = (endDate: Date) => {
    const dateFinal = new Date(endDate);

    while (this.isWeekendOrHoliday(dateFinal)) {
      dateFinal.setDate(dateFinal.getDate() + 1);
      dateFinal.setHours(0, 0, 0, 0);
    }
    return dateFinal;
  };
}
