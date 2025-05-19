import ListView from "../components/ListView";
import Icon from "../assets/icons/Icons";
import { createNotification } from "../components/utils/createNotification";

function ComponentDemo(){
    return (
    <ListView title="Notifications">
        {createNotification({type:"request"})}
        {createNotification({type:"accepted", date:"17-02-2025", onClick: ()=>alert("Redirecting...")})}
        {createNotification({type:"unassigned", date:"01-02-2025", daysLeft: 5, onClick: ()=>alert("Redirecting...")})}
        {createNotification({type:"declined", date:"15-02-2025"})}

    </ListView>);
}

export default ComponentDemo;