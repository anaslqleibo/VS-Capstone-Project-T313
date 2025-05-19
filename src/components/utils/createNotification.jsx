import Icon from "../../assets/icons/Icons";
import getStatusColor from "./getStatusColor";
import formatDate from "./formatDate";

export function createNotification({type="accepted", date, daysLeft=1, onClick}){
    const circle = (status)=>{
        return <Icon id="circle" width="0.5em" className={`text-[color:${getStatusColor(status)}] mr-2`}/>
    };

    function handleClick(e){
        e.stopPropagation(); 
        
        onClick();
    }
    let result;
    switch(type){
        case "accepted":
            result = <p className="flex items-center" onClick={handleClick}>{circle("accepted")}New shift accepted on <span className="text-[color:var(--secondary-color)]">&nbsp;{formatDate(date)}</span></p>;
            break;

        case "unassigned":
            result = <p className="flex items-center" onClick={handleClick}>{circle("warning")}<span className="text-[color:var(--secondary-color)]">{daysLeft} day{daysLeft>1 ? "s":""}</span> &nbsp;left to Accept/Deny shift on <span className="text-[color:var(--secondary-color)]">&nbsp;{formatDate(date)}</span></p>
            break;

        case "request":
            result = <p className="flex items-center" onClick={handleClick}>
        {circle("request")}New shift requested on <span className="text-[color:var(--secondary-color)]">&nbsp;{formatDate(date)}</span>
        </p>
            break;

        case "declined":
            result = <p className="flex items-center" onClick={handleClick}>{circle("danger")}Shift declined on <span className="text-[color:var(--secondary-color)]">&nbsp;{formatDate(date)}</span></p>
            break;
        default:
            result=<p></p>;
    }

    return result;
}