import ListView from "../components/ListView";
import Icon from "../assets/icons/Icons";
import { createNotification } from "../components/utils/createNotification";
import { Status } from "../components/utils/getStatusColor";

function ComponentDemo(){
    return (
    <ListView title="Notifications">
        {createNotification({type:Status.Request})}
        {createNotification({type:Status.Accepted, date:"17-02-2025", onClick: ()=>alert("Redirecting...")})}
        {createNotification({type:Status.Unassigned, date:"01-02-2025", daysLeft: 5, onClick: ()=>alert("Redirecting...")})}
        {createNotification({type:Status.DeclinedShift, date:"15-02-2025"})}

    </ListView>);

    
}

export default ComponentDemo;