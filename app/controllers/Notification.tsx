import Icon from "@/public/icons/Icons";
import getStatusColor, { stringToStatus } from "@/app/components/utils/getStatusColor";
import formatDate, { formatDateToHour12 } from "@/app/components/utils/formatDate";
import { Status } from "@/app/components/utils/getStatusColor";
import Tooltip from "../components/Tootltip";
import dayjs from "dayjs";


export type NotificationType = 'Assigned' | 'Unassigned' | 'Open' | 'Accepted' | 'Declined' | 'Request' | 'Leave Request' | 'Leave Accepted' | 'Leave Declined';

export type NotificationProps = {
    id?:string;
    type: NotificationType,
    date?: string,
    shift_id?: string,
    shift_date?: string,
    assignee_name?: string;
    days_left?: number,
    onClick?: ()=>void;

    location_name?: string;
    start_time?: string;
    end_time?: string;
}

export async function checkNewNotification(user_id?: string) {
    const res = await fetch(`/api/notifications/${user_id}`,{
        method: "POST"
    });
    
    if (!res.ok) {
    throw new Error('Failed to fetch notifications');
    }
    const data = await res.json();
    return data.found;
}

export async function fetchNotifications(user_id?: string) {
    const res = await fetch(`/api/notifications/${user_id}`);
    
    if (!res.ok) {
    throw new Error('Failed to fetch notifications');
    }
    const data = await res.json();
    return data as NotificationProps[];
}

export async function notificationMarkAsRead(id: string, is_admin=false) {
    try {
        const res = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_admin }),
        });

        return res.ok;
    } catch (err) {
        console.error('Failed to update notification read status:', err);
        return false;
    }
}



function getNotifications(){
  const notifications : NotificationProps[] = [{type:'Unassigned'},{type:'Request'},{type:'Declined'},{type:'Accepted', date:"2025-02-15", onClick: ()=>alert("Redirecting...")},{type:'Assigned', date:"2025-02-01", days_left: 5, onClick: ()=>alert("Redirecting...")},{type:'Leave Accepted', date:"2025-02-15"},{type:'Leave Declined'},{type:'Leave Request'},]
  return notifications;
}

export function createNotifications(fromAdminView=false, notifications : NotificationProps[] = getNotifications()) {
    return (
    <>
        {notifications.map(item =>{
            if(fromAdminView) 
                return createAdminNotification(item);
            else 
                return createStaffNotification(item);
        })}
    </>
    );
}

export function createAdminNotification({type, date, shift_date, days_left = 1, assignee_name='Steve', location_name, start_time, end_time, onClick} : NotificationProps){
    const circle = ()=>{
        const s = type.split(' ');
        const status = stringToStatus(s.length > 1 ? s[1] : s[0]);
        return <Icon id="circle" width="0.5em" className='mr-2' status={status}/>
    };

    function handleClick(e : React.MouseEvent<HTMLParagraphElement>){
        e.stopPropagation(); 
        
        if (onClick) onClick();
    }

    const isLeave = type.split(' ').length>1;

    const { startStr, endStr } = formatDateToHour12(shift_date, start_time??'00:00', end_time??'00:00');

    const dateFormatted = dayjs(shift_date).format('ddd, D MMM YYYY');
    const tooltipContent = isLeave ? 
    <>
        Date: {dateFormatted}<br/>
        From: {startStr} <br/> 
        To: {endStr}
    </> : <>
        Date: {dateFormatted}<br/> 
        Location: {location_name} <br/> 
        Start time: {startStr} <br/> 
        End time: {endStr}
    </>;

    const shift = (
        <Tooltip content={tooltipContent} position="top" inline={true}>
            <span className="font-semibold">{isLeave? 'leave': 'shift'}</span>
        </Tooltip>
    );

    let content;
    switch (type) {
        case "Accepted":
            content = (
            <span>
                {assignee_name} has accepted their {shift} on
            </span>
            );
            break;
        case "Unassigned":
        case "Open":
            content = (
            <div>
                <span className="text-danger">
                There is an {type.toLowerCase()} {shift} scheduled  {days_left>0?'in ' + days_left + ' day' + (days_left > 1 ? "s" : ""):'today'}.<br />

                {days_left>0?'Please assign it before the shift date.':'Please resolve this as soon as possible!'}
                </span>
            </div>
            );
            break;
        case "Request":
            content = (
            <span>
                {assignee_name} requested to take a {shift} on
            </span>
            );
            break;
        case "Declined":
            content = (
            <span>
                {assignee_name} declined their {shift} on
            </span>
            );
            break;
        case "Assigned":
            content = (
            <div>
                <span className="text-danger">
                {assignee_name} has a pending {shift} scheduled in {days_left} day
                {days_left > 1 ? "s" : ""}.<br />
                Please have the assignee accept/decline the shift.
                </span>
            </div>
            );
            break;
        case "Leave Request":
            content = (
            <span>
                {assignee_name} has requested a {shift} on
            </span>
            );
            break;
        case "Leave Accepted":
        case "Leave Declined":
            return "";
        default:
            content = <p></p>;
    }

 
    return (
        <div className="flex items-center" onClick={handleClick}>{
            circle()}
            <div>
            {content}
            {type!=='Unassigned' && type !== 'Open' && <span className="text-[color:var(--secondary-color)]"> {formatDate(date)}</span>}
            </div>
            
        </div> 
    );
    
}



export function createStaffNotification({type, date, shift_date, days_left=1, onClick} : NotificationProps){
    const circle = ()=>{
        const s = type.split(' ');
        const status = stringToStatus(s.length > 1 ? s[1] : s[0]);
        return <Icon id="circle" width="0.5em" className='mr-2' status={status}/>
    };

    function handleClick(e : React.MouseEvent<HTMLParagraphElement>){
        e.stopPropagation(); 
        
        if (onClick) onClick();
    }

    let content;
    switch(type){
        case 'Open':
            content = <div>A new open shift has been created. Please review the details and accept it if you’re available.</div>
            break;
        case 'Assigned':
            if (days_left > 3)
                content = <div>You've been offered a new shift! Tap to view the details and confirm if you're available to take the shift.</div>
            else
                content = <div>You have <span className="text-[color:var(--secondary-color)]"> {days_left} day{days_left>1 ? "s":""}</span> left to accept/decline a shift!</div>
            break;
        case 'Leave Accepted':
            content = 'Your leave request has been accepted on';
            break;
        case 'Leave Declined':
            content = 'Your leave request has been declined on';
            break;
        case 'Accepted':
        case 'Leave Request':
        case 'Unassigned':
        case 'Declined':
        case 'Request':
            return '';
        default:
            content=<p></p>;
    }
 
    return (
        <div className="flex items-center" onClick={handleClick}>
            <div className="w-fit">{circle()}</div>
            <div>
                {content}

                {(type==='Open'||type==='Assigned') ? '' : <span className="text-[color:var(--secondary-color)]"> {formatDate(date)}</span>}
            </div>
        </div> 
    );
    
}