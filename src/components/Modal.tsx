import { useEffect, useRef, useState } from "react";
import Icon from "../assets/icons/Icons";
import Button from "./Button";
import { useClickOutside } from "./utils/useClickOutside";


// TODO: Still missing some code, please go through everything and finish what's still missing

export enum ModalTypes{
    ShiftDetails = "Shift details",
    OpenShiftDetails = "Open shift details",
    LeaveDetails = "Leave details",
    UnavailabilityDetails = "Unavailability Details",
    AddShift = "Add shift",
    AddLeave = "Add leave",
    AddUnavailability = "Add Unavailability",
}

interface ModalUnavailDetailsProps{
    Day: string;
    Time: string;
}

interface ModalLeaveDetailsProps{
    Date: string;
    Time: string;
}

interface ModalDetailsProps{
    Date: string;
    Time: string;
    Location: string;
    Address: string;
    Notes: string;
}

interface ModalProps{
    type?: ModalTypes;
    shown: boolean;
    setShown: (arg0: boolean) => void;
    details?: ModalUnavailDetailsProps|ModalLeaveDetailsProps|ModalDetailsProps; 
    title?:string;
    children?: React.ReactNode;
    customButtons?: React.ReactNode;
}

function createDetail(label: string, detail: string){
    return (<p className="text-sm font-semibold text-gray-600 mt-1">{label}
    <span className="text-[color:var(--secondary-color)] font-normal">{detail}</span></p>);
}

function createDetails(type: string, details?: ModalUnavailDetailsProps|ModalLeaveDetailsProps|ModalDetailsProps){
    if (details === undefined) return;

    if (type === ModalTypes.UnavailabilityDetails)
    {
        const newDetails = details as ModalUnavailDetailsProps;
        return (
            <>
            {createDetail("Day: ", newDetails.Day)}
            {createDetail("Time: ", newDetails.Time)}
            </>
        );
    }
    else if (type === ModalTypes.LeaveDetails)
    {
        const newDetails = details as ModalLeaveDetailsProps;
        return (
            <>
            {createDetail("Date: ", newDetails.Date)}
            {createDetail("Time: ", newDetails.Time)}
            </>
        );
    }
    else if (type === ModalTypes.AddUnavailability)
        return;
    else if (type === ModalTypes.AddLeave)
        return;
    else{
        const newDetails = details as ModalDetailsProps;
        return (
            <>
            {createDetail("Date: ", newDetails.Date)}
            {createDetail("Time: ", newDetails.Time)}
            {createDetail("Location: ", newDetails.Location)}
            {createDetail("Address: ", newDetails.Address)}
            {createDetail("Notes: ", newDetails.Notes)}
            </>
        );
    }
}

function createButtons(type: string){
    let buttons;
    if (type === ModalTypes.LeaveDetails)
        buttons = <Button type="cta" fontSize="0.8em">Delete leave</Button>;
    else if (type === ModalTypes.UnavailabilityDetails)
        buttons = <Button type="cta" fontSize="0.8em">Delete unavailability</Button>;
    else if (type === ModalTypes.AddLeave)
        buttons = <Button type="cta" fontSize="0.8em">Submit leave</Button>;
    else if (type === ModalTypes.AddUnavailability)
        buttons = <Button type="cta" fontSize="0.8em">Submit unavailability</Button>;
    else if (type === ModalTypes.OpenShiftDetails)
    {
        buttons = (<>
        <Button type="cta" fontSize="0.8em">Accept</Button>
        <Button type="cta" fontSize="0.8em">Decline</Button>
        </>);
    }
    else return;
    
    return buttons;
}

export default function Modal({type, shown = false, setShown, details, title, ...props} : ModalProps){
    const containerRef = useRef<HTMLDivElement>(null);
    useClickOutside(containerRef, ()=>setShown(false));
    
    const [rendered, setRendered] = useState(false);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
    if (shown) {
        setRendered(true);
        const timeout = setTimeout(() => setVisible(true), 10); // delay to set to 0 opacity
        return () => clearTimeout(timeout);
    } else {
        setVisible(false);
        const timeout = setTimeout(() => setRendered(false), 200);
        return () => clearTimeout(timeout);
    }
    }, [shown]);

    return (
        <>
            {rendered && <div role="dialog" aria-modal="true" aria-labelledby="dialog-title" className={`relative z-10 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} >
            
            <div aria-hidden="true" className={`fixed inset-0 bg-gray-200/75 backdrop-blur-sm transition-all duration-200 ${visible ? 'backdrop-opacity-100' : 'backdrop-opacity-0'}`}></div>

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            
                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg" ref={containerRef}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ">
                    <div className="sm:flex sm:items-start">
                    
                        <div className="mt-3 w-full sm:mt-0 sm:text-left">
                            <div className="flex items-center justify-between align-middle mb-2">
                                <h1 id="dialog-title" className="text-lg font-semibold text-gray-900">{type !== undefined ? type : title??"Please set the tag 'title'"}</h1>
                                <Icon
                                    id="x"
                                    width="1.5em"
                                    height="1.5em"
                                    className="text-black-700 hover:text-[color:var(--danger-color)]"
                                    onClick={() => setShown(false)}
                                />
                            </div>
                            
                            {type!==undefined && createDetails(type, details)}

                            {props.children}
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row sm:px-6 gap-3">
                    {type!==undefined ? createButtons(type) : props.customButtons}
                </div>
                </div>
            </div>
            </div>
        </div>  }
        </>
        
    );
}