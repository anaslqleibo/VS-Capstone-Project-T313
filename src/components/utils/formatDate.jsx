export default function formatDate(date) {
    if (/^\d{2}-\d{2}-\d{4}$/.test(date)) return date;
    let d;
    if (date)
        d = new Date(date);
    else 
        d = new Date();

    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    let year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [day,month,year].join('-');
}