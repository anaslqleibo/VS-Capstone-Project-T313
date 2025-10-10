
import dayjs from "dayjs";

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
 * Formats date object of dayjs
 * @param year 
 * @param month 
 * @param date 
 */
export function formatDateDayJS(year:number|string, month:number, date:number){
    return dayjs([year,(month+1<10)?('0' + (month+1)):(month+1),(date<10)?('0' + date):date].join('-'));
}

export function sqlDateFormatToRegularFormat(date:string){
    const [year, month, day] = date.split('-');
    return [day, month, year].join('-');
}

export function formatToSqlDate(date:string){
    const [day, month, year] = date.split('-');
    return [year, month, day].join('-');
}

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