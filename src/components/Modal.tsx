import { useRef, useState } from "react";
import Icon from "../assets/icons/Icons";
import Button from "./Button";
import { overlayAnimation, useClickOutside } from "./utils/useClickOutside";
import { Status } from "./utils/getStatusColor";


// TODO: Still missing some code, please go through everything and finish what's still missing

export enum ModalTypes{
    ShiftDetails = "Shift details",
    OpenShiftDetails = "Open shift details",
    UnacceptedDetails = "Unaccepted shift details",
    LeaveDetails = "Leave details",
    UnavailabilityDetails = "Unavailability details",
    DeclinedDetails = "Declined shift details",
    AddShift = "Add shift",
    AddLeave = "Add leave",
    AddUnavailability = "Add unavailability",
}

export function getModalTypesByStatus(status:Status){
    switch(status){
        case Status.Unaccepted:
        case Status.Unassigned:
            return null;
        case Status.Request:
            return null;
        case Status.Accepted:
            return ModalTypes.ShiftDetails;
        case Status.Unaccepted:
            return ModalTypes.UnacceptedDetails;
        case Status.Leave:
            return ModalTypes.LeaveDetails;
        case Status.OpenShift:
            return ModalTypes.OpenShiftDetails;
        case Status.DeclinedShift:
            return ModalTypes.DeclinedDetails;
        default:
            return null;
    }
}

export interface ModalUnavailDetailsProps{
    Day: string;
    Time: string;
}

export interface ModalLeaveDetailsProps{
    Date: string;
    Time: string;
}

export interface ModalDetailsProps{
    Date: string;
    Time: string;
    Location: string;
    Address: string;
    Notes: string;
}

interface ModalProps{
    type?: ModalTypes|null;
    startOpen ?: boolean;
    shown?: boolean;
    setShown?: (arg0: boolean) => void;
    details?: ModalUnavailDetailsProps|ModalLeaveDetailsProps|ModalDetailsProps|null; 
    title?:string;
    modalContainer?: HTMLDivElement;
    children?: React.ReactNode;
    customButtons?: React.ReactNode;
}

function createDetail(label: string, detail: string, type:string=""){
    if (type === "textarea")
        return (<><p className="text-sm font-semibold text-gray-600 mt-1 mb-1">{label}</p>
    <textarea readOnly className="text-gray-500 font-normal text-sm border-2 border-gray-500 bg-gray-100 rounded-md min-w-full p-2 min-h-[72px] resize-none focus:outline-0" value={detail}></textarea></>);
    else
        return (<p className="text-sm font-semibold text-gray-600 mt-1">{label}
    <span className="text-[color:var(--secondary-color)] font-normal">{detail}</span></p>);
}

function createDetails(type: string|null, details?: ModalUnavailDetailsProps|ModalLeaveDetailsProps|ModalDetailsProps|null){
    if (details === undefined || details === null || type==null) return;

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
    else if (type === ModalTypes.DeclinedDetails)
    {
        const newDetails = details as ModalDetailsProps;
        return (
            <>
            {createDetail("Date: ", newDetails.Date)}
            {createDetail("Time: ", newDetails.Time)}
            {createDetail("Location: ", newDetails.Location)}
            {createDetail("Address: ", newDetails.Address)}
            {createDetail("Reason: ", newDetails.Notes, "textarea")}
            </>
        );
    }
    else{
        const newDetails = details as ModalDetailsProps;
        return (
            <>
            {createDetail("Date: ", newDetails.Date)}
            {createDetail("Time: ", newDetails.Time)}
            {createDetail("Location: ", newDetails.Location)}
            {createDetail("Address: ", newDetails.Address)}
            {createDetail("Notes: ", newDetails.Notes, "textarea")}
            </>
        );
    }
}

function createButtons(type: string|null){
    let buttons = null;
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
        <Button type="cta" fontSize="0.8em">Pick-up Shift</Button>
        </>);
    }
    else if (type === ModalTypes.UnacceptedDetails)
    {
        buttons = (<>
        <Button type="cta" fontSize="0.8em">Accept</Button>
        <Button type="cta" fontSize="0.8em">Decline</Button>
        </>);
    }
    
    return buttons;
}

export function createModal(type:ModalTypes|null, startOpen: boolean, modalContainer: HTMLDivElement, details?:ModalUnavailDetailsProps|ModalLeaveDetailsProps|ModalDetailsProps|null){
    return (<Modal key={crypto.randomUUID()} type={type} details={details} startOpen={startOpen} modalContainer={modalContainer}/>);
}

export default function Modal({type, details, startOpen, title, modalContainer, ...props} : ModalProps){
    const [shown, setShown] = useState(startOpen ?? false);

    const containerRef = useRef<HTMLDivElement>(null);
    useClickOutside(containerRef, ()=> props.setShown ? props.setShown(false) : setShown(false));
    
    const [rendered, setRendered] = useState(false);
    const [visible, setVisible] = useState(false);

    overlayAnimation(props.shown ? props.shown : shown, setRendered, setVisible, modalContainer);

    return (
        <>
            {rendered && <div role="dialog" aria-modal="true" aria-labelledby="dialog-title" className={`relative z-10 h-full transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} >
            
            <div aria-hidden="true" className={`absolute inset-0 bg-gray-200/75 backdrop-blur-sm transition-all duration-200 ${visible ? 'backdrop-opacity-100' : 'backdrop-opacity-0'}`}></div>

            <div className="relative z-10 w-full overflow-y-auto h-full">
            <div className="flex min-h-full justify-center p-4 text-center items-center sm:p-0">
            
                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all my-auto sm:w-full sm:max-w-lg" ref={containerRef}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                    
                        <div className="mt-3 w-full sm:mt-0 sm:text-left">
                            <div className="flex items-center justify-between align-middle mb-2">
                                <h1 id="dialog-title" className="text-lg font-semibold text-gray-900">{type !== undefined ? type : title??"Please set the tag 'title'"}</h1>
                                <Icon
                                    id="x"
                                    width="1.5em"
                                    height="1.5em"
                                    className="text-black-700 hover:text-[color:var(--danger-color)]"
                                    onClick={() => props.setShown ? props.setShown(false) : setShown(false)}
                                />
                            </div>
                            
                            {type!==undefined && createDetails(type, details)}

                            {props.children}
                        </div>
                    </div>
                </div>
                {((type!==undefined && createButtons(type)!=null) || props.customButtons) && <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row sm:px-6 gap-3">
                    {type!==undefined ? createButtons(type) : props.customButtons}
                </div>}
                </div>
            </div>
            </div>
        </div>  }
        </>
        
    );
}