import dayjs from "dayjs";

/**
 * Formats Date/string which represents a date to a specified date format (YYYY-MM-DD)
 * @param date Date/string (in the form of 'YYYY-MM-DD')
 * @param sqlDateFormat Set to true, to return 'YYYY-MM-DD'
 * @returns A string in the format DD-MM-YYYY (can be modified by passing 'true' for sqlDateFormat)
 */
export default function formatDate(date : Date | string = new Date(), sqlDateFormat : boolean = false) : string {
    let dateToFormat;
    if (typeof date === 'string'){
        if (/^\d{2}-\d{2}-\d{4}$/.test(date)) return date;
 
        // should do checking if date string format is correct
        dateToFormat = new Date(date);
    }
    else{
        dateToFormat = date;
    }

    let month = '' + (dateToFormat.getMonth() + 1);
    let day = '' + dateToFormat.getDate();
    const year = dateToFormat.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    if (sqlDateFormat)
        return [year,month,day].join('-');
    else
        return [day,month,year].join('-');
}

/**
 * Convert all the parameters into a dayjs object.
 * @param year Year, e.g., 2025
 * @param month Month, e.g., 12
 * @param date Date, e.g., 04
 */
export function formatDateDayJS(year:number|string, month:number, date:number){
    return dayjs([year,(month+1<10)?('0' + (month+1)):(month+1),(date<10)?('0' + date):date].join('-'));
}

/**
 * Turns a SQL date format to a regular date pattern (DD-MM-YYYY)
 * @param date Date written in the form 'YYYY-MM-DD'
 * @returns  Date string in the form of 'DD-MM-YYYY'
 */
export function sqlDateFormatToRegularFormat(date:string){
    const [year, month, day] = date.split('-');
    return [day, month, year].join('-');
}

/**
 * Turns a regular date to a SQL date format (YYYY-MM-DD)
 * @param date Date written in the form 'DD-MM-YYYY'
 * @returns  Date string in the form of 'YYYY-MM-DD'
 */
export function formatToSqlDate(date:string){
    const [day, month, year] = date.split('-');
    return [year, month, day].join('-');
}

/**
 * Convert a date, start time, and end time to an hour 12 formatted time start and end
 * @param date Date string in the form of 'YYYY-MM-DD'
 * @param start Start time in the form of 'HH:mm'
 * @param end End time in the form of 'HH:mm'
 * @returns Object with the type { startStr, endStr }, where startStr is the start time and endStr is the end time
 */
export function formatDateToHour12(date=dayjs().format('YYYY-MM-DD'), start: string, end: string){
    const startDate = new Date(`${date}T${start}`);
    const endDate = new Date(`${date}T${end}`);

    const fmt = new Intl.DateTimeFormat("en-AU", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });

    const startStr = fmt.format(startDate);
    const endStr = fmt.format(endDate);
    return { startStr, endStr };
}

/**
 * Convert a date, start time, and end time to a combined readable datetime string 
 * @param date Date string in the form of 'YYYY-MM-DD'
 * @param start Start time in the form of 'HH:mm'
 * @param end End time in the form of 'HH:mm'
 * @returns Date time string, e.g., 'Mon, 10 Oct 2025 12:00 pm – 3:00 pm'
 */
export function formatWhen(date: string, start: string, end: string) {
  // e.g., "2025-10-10", "07:00:00", "12:00:00"
  const startDate = new Date(`${date}T${start}`);
  const {startStr, endStr} = formatDateToHour12(date, start, end);

  // make the date look nicer
  const dateStr = new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(startDate);

  return `${dateStr} ${startStr} – ${endStr}`;
}