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