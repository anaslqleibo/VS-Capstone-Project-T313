import ListView from "../components/ListView";
import Icon from "../assets/icons/Icons";
import { createNotification, createNotifications } from "../components/utils/notification";
import { Status } from "../components/utils/getStatusColor";
import { useRef, useState } from "react";
import Button from "../components/Button";
import { createRoot } from "react-dom/client";

function ComponentDemo(){
    const notifications = [{type:Status.Request},{type:Status.Accepted, date:"17-02-2025", onClick: ()=>alert("Redirecting...")},{type:Status.Unassigned, date:"01-02-2025", daysLeft: 5, onClick: ()=>alert("Redirecting...")},{type:Status.DeclinedShift, date:"15-02-2025"}]

    const [shown, setShown] = useState(false);
    const container = useRef<HTMLDivElement>(null);
    
    const rootRef = useRef<ReturnType<typeof createRoot> | null>(null);


    return (
        <>
            <div ref={container} className="absolute inset-0 pointer-events-none"></div>
    
            <Button onClick={()=>{
                if (container.current) {
                    if (!rootRef.current) rootRef.current = createRoot(container.current);
                    
                    rootRef.current.render(<ListView title="Notifications" container={container.current}>
                {createNotifications(notifications)}
            </ListView>);

                    setShown(!shown);
                }
            }}>Open notification</Button>
            
        </>
   );

    
}

export default ComponentDemo;