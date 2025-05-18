import ListView from "../components/LIstView";
import Icon from "../assets/icons/Icons";
import getStatusColor from "../components/utils/getStatusColor";

function ComponentDemo(){

    const circle = (status)=>{
        return <Icon id="circle" width="0.5em" className={`text-[color:${getStatusColor(status)}] mr-2`}/>
    };

    return (
    <ListView title="Notifications">
        <p class="flex items-center" onClick={()=>alert("Redirecting...")}>
        {circle("unaccepted")}New shift assigned on <span class="text-[color:var(--secondary-color)]">&nbsp;17-02-2024</span>
        </p>
        <p class="flex items-center">{circle("warning")}<span class="text-[color:var(--secondary-color)]">2 days</span> &nbsp;left to Accept/Deny shift on <span class="text-[color:var(--secondary-color)]">&nbsp;01-02-2024</span></p>
        <p class="flex items-center">{circle("accepted")}New shift accepted on <span class="text-[color:var(--secondary-color)]">&nbsp;16-02-2024</span></p>
        <p class="flex items-center ">{circle("danger")}Shift declined on <span class="text-[color:var(--secondary-color)]">&nbsp;15-02-2024</span></p>
    </ListView>);
}

export default ComponentDemo;