import Icon from "@/public/icons/Icons";
import getStatusColor, { stringToStatus } from "@/app/components/utils/getStatusColor";
import formatDate from "@/app/components/utils/formatDate";
import { Status } from "@/app/components/utils/getStatusColor";
import Tooltip from "../components/Tootltip";


type NotificationType = 'Assigned' | 'Unassigned' | 'Accepted' | 'Declined' | 'Request' | 'Leave Request' | 'Leave Accepted' | 'Leave Declined';

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

    const tooltipContent = isLeave ? 
    <>
        Date: {shift_date}<br/>
        Start time: {start_time} <br/> 
        End time: {end_time}
    </> : <>
        Date: {shift_date}<br/> 
        Location: {location_name} <br/> 
        Start time: {start_time} <br/> 
        End time: {end_time}
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
        content = (
        <div>
            <span className="text-danger">
            You have an unassigned {shift} scheduled in {days_left} day
            {days_left > 1 ? "s" : ""}.<br />
            Please assign it before the shift date.
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
        return "";
    case "Leave Accepted":
        return "";
    case "Leave Declined":
        return "";
    case "Leave Request":
        content = (
        <span>
            {assignee_name} has requested a {shift} on
        </span>
        );
        break;
    default:
        content = <p></p>;
    }

 
    return (
        <div className="flex items-center" onClick={handleClick}>{
            circle()}
            <div>
            {content}
            {type!=='Unassigned' && <span className="text-[color:var(--secondary-color)]"> {formatDate(date)}</span>}
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
        case 'Accepted':
            return '';
            break;
        case 'Unassigned':
            content = <div>You have <span className="text-[color:var(--secondary-color)]"> {days_left} day{days_left>1 ? "s":""}</span> left to Accept/Deny a shift!</div>
            break;
        case 'Request':
            return '';
            break;
        case 'Declined':
            return '';
            break;
        case 'Assigned':
            content = 'You received a new shift on';
            break;
        case 'Leave Accepted':
            content = 'Your leave request has been accepted on';
            break;
        case 'Leave Declined':
            content = 'Your leave request has been declined on';
            break;
        case 'Leave Request':
            return '';
            break;
        default:
            content=<p></p>;
    }
 
    return (
        <div className="flex items-center" onClick={handleClick}>{
            circle()}
            <div>
            {content}
            <span className="text-[color:var(--secondary-color)]"> {formatDate(date)}</span>
            </div>
            
        </div> 
    );
    
}