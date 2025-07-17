import ButtonDemo from "./ButtonDemo";
import IconDemo from "./IconDemo";
import InputDemo from "./InputDemo";
import FormDemo from "./FormDemo";
import ComponentDemo from "./ComponentDemo";
import Modal from "../components/Modal";
import { ModalTypes } from "../components/Modal";
import { useState } from "react";
import Button from "../components/Button";

export default function Demo(){
    const [openShiftShown, setOpenShiftShown] = useState(false);
    const [unavailDetailShown, setUnavailDetailShown] = useState(false);
    const [leaveDetailShown, setLeaveDetailShown] = useState(false);

    const unavailDetails = {
        Day: "Mondays",
        Time: "12:00-16:30"
    };
    const leaveDetails = {
        Date: "11-04-2024",
        Time: "12:00-16:30"
    };
    const openShiftDetails = {
        Date: "11-04-2024",
        Time: "12:00-16:30",
        Location: "Noosa",
        Address: "111 Test Drive, Noosa, 4110",
        Notes: "School excursion. 50+ students. Arrive early."
    };

    return (
        <>
            <ButtonDemo/>
            <IconDemo/>
            <InputDemo/>
            <FormDemo/>
            <ComponentDemo/>

            <Button onClick={()=>setOpenShiftShown(true)}>Open shift details</Button>
            <Modal type={ModalTypes.OpenShiftDetails} details={openShiftDetails} shown={openShiftShown} setShown={setOpenShiftShown} />

            <Button onClick={()=>setUnavailDetailShown(true)}>Open Unavailability details</Button>
            <Modal type={ModalTypes.UnavailabilityDetails} details={unavailDetails} shown={unavailDetailShown} setShown={setUnavailDetailShown} />

            <Button onClick={()=>setLeaveDetailShown(true)}>Open Leave details</Button>
            <Modal type={ModalTypes.LeaveDetails} details={leaveDetails} shown={leaveDetailShown} setShown={setLeaveDetailShown} />
        </>
        
    );
}