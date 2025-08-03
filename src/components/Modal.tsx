import { JSX, ReactNode, useEffect, useRef, useState } from "react";
import Icon from "../assets/icons/Icons";
import Button from "./Button";
import { overlayAnimation, useClickOutside } from "./utils/useClickOutside";
import { Status } from "./utils/getStatusColor";
import { PageProps } from "../App";
import { createRoot } from "react-dom/client";
import React from "react";
import { createPortal } from "react-dom";
import ListView from "./ListView";
import { createNotifications } from "./utils/notification";
import { DatePicker, LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from "dayjs";
import Dropdown, { DayPicker } from "./Dropdown";


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
    Notifications="Notifications"
}

export function getModalTypesByStatus(status:Status){
    switch(status){
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

export type DetailsPropsList = ModalUnavailDetailsProps|ModalLeaveDetailsProps|ModalDetailsProps|null;

interface ModalProps{
    type?: ModalTypes|null;
    startOpen ?: boolean;
    shown?: boolean;
    setShown?: (arg0: boolean) => void;
    details?: DetailsPropsList; 
    title?:string;
    modalContainer: HTMLDivElement;
    setParentOpen?:(e:boolean)=>void;
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

function createDetails(type: string|null, details?: DetailsPropsList){
    if (details === undefined || type==null) return;

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
        return (
            <div className="flex flex-col gap-4 mt-4">
                <div className="flex items-center gap-2">
                    <p className="text-md font-semibold text-gray-600 mt-1 mb-1 w-12">Day:</p>
                    {/* TODO: Add checking so that 'to' cant be before 'from' and vice versa */}

                    <DayPicker />
                </div>

                <div className="flex items-center gap-2">
                    <p className="text-md font-semibold text-gray-600 mt-1 mb-1 w-12">Time:</p>
                    

                    {/* TODO: Add checking so that 'to' cant be before 'from' and vice versa */}
                    <TimePicker label="From" format="hh:mm A"/>
                        <span className="text-[color:var(--primary-color)] font-bold">–</span>
                    <TimePicker label="To" format="hh:mm A"/>
                </div>            
            </div>
        );
    
    else if (type === ModalTypes.AddLeave)
        return (
            <div className="flex flex-col gap-4 mt-4">
                <div className="flex items-center gap-2">
                    <p className="text-md font-semibold text-gray-600 mt-1 mb-1">Date:</p>
                    {/* TODO: Add checking so that 'to' cant be before 'from' and vice versa */}

                    <DatePicker label="From" format="DD-MM-YYYY"/>
                        <span className="text-[color:var(--primary-color)] font-bold">–</span>
                    <DatePicker label="To" format="DD-MM-YYYY"/>
                </div>

                <div className="flex items-center gap-2">
                    <p className="text-md font-semibold text-gray-600 mt-1 mb-1">Time:</p>
                    

                    {/* TODO: Add checking so that 'to' cant be before 'from' and vice versa */}
                    <TimePicker label="From" format="hh:mm A"/>
                        <span className="text-[color:var(--primary-color)] font-bold">–</span>
                    <TimePicker label="To" format="hh:mm A"/>
                </div>            
            </div>
        );
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

export function createModal(type:ModalTypes|null, startOpen: boolean, modalContainer: HTMLDivElement, details?:ModalUnavailDetailsProps|ModalLeaveDetailsProps|ModalDetailsProps|null, setParentOpen?: (e:boolean)=>void){
    return (<Modal type={type} details={details} startOpen={startOpen} modalContainer={modalContainer} setParentOpen={setParentOpen}/>);
}

export default function Modal({type, details, startOpen, title, modalContainer, setParentOpen, ...props} : ModalProps){
    const [shown, setShown] = useState(startOpen ?? false);
    
    const containerRef = useRef<HTMLDivElement>(null);
    useClickOutside(containerRef, ()=> props.setShown ? props.setShown(false) : setShown(false));
    
    const [rendered, setRendered] = useState(false);
    const [visible, setVisible] = useState(false);

    overlayAnimation(props.shown ? props.shown : shown, setRendered, setVisible, modalContainer, setParentOpen)

    return (
        <ModalPortal container={modalContainer} isModalOpen={rendered}>
            {rendered && <div role="dialog" aria-modal="true" aria-labelledby="dialog-title" className={`relative z-10 h-full transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} >
            
            <div aria-hidden="true" className={`absolute inset-0 bg-gray-200/75 backdrop-blur-sm transition-all duration-200 ${visible ? 'backdrop-opacity-100' : 'backdrop-opacity-0'}`}></div>

            <div className="relative z-10 w-full overflow-y-auto h-full">
            <div className="flex min-h-full justify-center p-4 text-center items-center sm:p-0">
            
                {type === ModalTypes.Notifications &&
                    <ListView title="Notifications" containerRef={containerRef} setShown={setShown}>{createNotifications()}</ListView>
                }

                {type !== ModalTypes.Notifications && 
                <div className="relative transform rounded-lg bg-white text-left shadow-xl transition-all my-auto sm:w-full sm:max-w-lg" ref={containerRef}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 rounded-lg">
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
                {((type!==undefined && createButtons(type)!=null) || props.customButtons) && <div className="bg-gray-50 py-3 flex flex-row px-6 gap-3 rounded-lg">
                    {type!==undefined ? createButtons(type) : props.customButtons}
                </div>}
                </div>
                }
            </div>
            </div>
        </div>  }
        </ModalPortal>
        
    );
}

interface ModalPortal{
    children: ReactNode;
    container: HTMLDivElement | HTMLElement | undefined;
    isModalOpen:boolean;
}

export function ModalPortal({children, container, isModalOpen}: ModalPortal ) {
  const elRef = useRef<HTMLDivElement | null>(null);
  if (!elRef.current) {
    const div = document.createElement("div");
    div.className = "fixed w-full md:w-[calc(100%-220px)] h-full z-100";
    elRef.current = div;
    }


 useEffect(() => {
    const el = elRef.current!;
  if (!container) return;

  if (isModalOpen) {
    if (!container.contains(el)) {
      container.appendChild(el);
    }
  } else {
    if (container.contains(el)) {
      container.removeChild(el);
    }
  }

  return () => {
    if (container.contains(el)) {
      container.removeChild(el);
    }
  };
}, [container, isModalOpen]);

  return container ? createPortal(children, elRef.current) : null;
}


// export function renderModal({modalContainer, rootRef}: PageProps, status: Status, details?:ModalUnavailDetailsProps | ModalLeaveDetailsProps | ModalDetailsProps | null){    
//     if (modalContainer.current) {
//         if (rootRef && !rootRef.current)
//             rootRef.current = createRoot(modalContainer.current);
        
//         rootRef?.current?.render(createModal(getModalTypesByStatus(status), true, modalContainer.current, details));
//     } 
//     else {
//         console.warn("Modal container is missing or not mounted.");
//     }
// }

// export function renderCustomModal({modalContainer, rootRef}: PageProps, jsx: ReactNode){
//     if (modalContainer.current) {
//         if (rootRef && !rootRef.current)
//             rootRef.current = createRoot(modalContainer.current);
        
//         rootRef?.current?.render(jsx);
//     } 
//     else {
//         console.warn("Modal container is missing or not mounted.");
//     }
// }