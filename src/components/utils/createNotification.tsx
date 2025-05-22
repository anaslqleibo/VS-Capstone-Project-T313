import Icon from "../../assets/icons/Icons";
import getStatusColor from "./getStatusColor";
import formatDate from "./formatDate";
import { Status } from "./getStatusColor";


interface ParamTypes {
    type?: Status,
    date?: Date | string,
    daysLeft?: number,
    onClick?: Function
}

export function createNotification({type=Status.Accepted, date, daysLeft=1, onClick} : ParamTypes){
    const circle = (status : Status)=>{
        return <Icon id="circle" width="0.5em" className={`text-[color:${getStatusColor(status)}] mr-2`}/>
    };

    function handleClick(e : React.MouseEvent<HTMLParagraphElement>){
        e.stopPropagation(); 
        
        if (onClick) onClick(e);
    }
    let result; 
    switch(type){
        case Status.Accepted:
            result = <p className="flex items-center" onClick={handleClick}>{circle(type)}New shift accepted on <span className="text-[color:var(--secondary-color)]">&nbsp;{formatDate(date)}</span></p>;
            break;

        case Status.Unassigned:
            result = <p className="flex items-center" onClick={handleClick}>{circle(type)}<span className="text-[color:var(--secondary-color)]">{daysLeft} day{daysLeft>1 ? "s":""}</span> &nbsp;left to Accept/Deny shift on <span className="text-[color:var(--secondary-color)]">&nbsp;{formatDate(date)}</span></p>
            break;

        case Status.Request:
            result = <p className="flex items-center" onClick={handleClick}>
        {circle(type)}New shift requested on <span className="text-[color:var(--secondary-color)]">&nbsp;{formatDate(date)}</span>
        </p>
            break;

        case Status.DeclinedShift:
            result = <p className="flex items-center" onClick={handleClick}>{circle(type)}Shift declined on <span className="text-[color:var(--secondary-color)]">&nbsp;{formatDate(date)}</span></p>
            break;
        default:
            result=<p></p>;
    }

    return result;
}