"use client";
import {  ReactNode, SetStateAction, use, useEffect, useRef, useState } from "react";
import Icon from "@/public/icons/Icons";
import Button from "./Button";
import { overlayAnimation, useClickOutside } from "./utils/useClickOutside";
import getStatusColor, { Status, statusToString, stringToStatus } from "./utils/getStatusColor";
import React from "react";
import { createPortal } from "react-dom";
import ListView from "./ListView";
import { createNotifications } from "./utils/notification";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import Dropdown, { DayPicker, LocationDropdownWithAddress } from "./Dropdown";
import { EventInput } from "@fullcalendar/core";
import { buildShiftEventTitle, deleteShift, Shift, updateShift, updateShiftStatus } from "../controllers/Shifts";
import { useAuth } from "@/app/contexts/AuthContext";
import { FaBell, FaEdit, FaRegBell, FaSave, FaTrash } from "react-icons/fa";
import Input from "./Input";
import { fetchLocations, getLocationsStatic } from "../controllers/Location";
import dayjs from "dayjs";
import { formatToSqlDate, sqlDateFormatToRegularFormat } from "./utils/formatDate";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";


// TODO: Still missing some code, please go through everything and finish what's still missing

export enum ModalTypes{
    ShiftDetails = "Shift details",
    OpenShiftDetails = "Open shift details",
    PendingDetails = "Pending shift details",
    RequestDetails = "Request shift details",
    LeaveDetails = "Leave details",
    UnavailabilityDetails = "Unavailability details",
    DeclinedDetails = "Declined shift details",
    UnassignedShiftDetails = "Unassigned shift details",
    AddShift = "Add shift",
    AddLeave = "Add leave",
    AddUnavailability = "Add unavailability",
    Notifications="Notifications",
}

export function getModalTypesByStatus(status:Status){
    switch(status){
        case Status.Unassigned:
            return ModalTypes.UnassignedShiftDetails;
        case Status.Request:
            return ModalTypes.RequestDetails;
        case Status.Accepted:
            return ModalTypes.ShiftDetails;
        case Status.Pending:
            return ModalTypes.PendingDetails;
        case Status.Leave:
            return ModalTypes.LeaveDetails;
        case Status.OpenShift:
            return ModalTypes.OpenShiftDetails;
        case Status.DeclinedShift:
            return ModalTypes.DeclinedDetails;
        case Status.Unavailable:
            return ModalTypes.UnavailabilityDetails;
        default:
            return null;
    }
}

export type ExtendedProps = {
    id: string;
    user_id: string;
    status: Status;
    employee: string;
    date: string;
    time: string;
    start: string;
    end:string;
    location: string;
    location_id: number;
    address: string;
    notes: string;
    day?: string;
}


export type setEventType = (event: EventInput, mode:"create"|"update"|"delete"|"updateDate")=>void;
interface ModalProps{
    type?: ModalTypes|null;
    startOpen ?: boolean;
    shown?: boolean;
    setShown?: (arg0: boolean) => void;
    details?: ExtendedProps | null; 
    title?:string;
    modalContainer: HTMLDivElement;
    setParentOpen?:(e:boolean)=>void;
    children?: React.ReactNode;
    customButtons?: React.ReactNode;
    setEvents?:setEventType;
    event?:EventInput;
    displayToast?:(message:string, toastType: 'success'|'error')=>void;
    noOverlay?:boolean;
}

function createAdminComponent(status: Status, employee?:string, setEvents?: setEventType, event?:EventInput, displayToast?:(message:string, toastType: 'success'|'error')=>void, closeModal?:Function, isEditing=false, setEditing?:(e:boolean)=>void, formValues?: ExtendedProps | null, initialDetails?:ExtendedProps){
    const handleDelete = async () => {
        const confirm = window.confirm("Are you sure you want to delete this shift?")
        if (!confirm) return;
        const result = await deleteShift(event?.extendedProps?.id, event?.extendedProps?.user_id);
        
        if (result){
            if (event) setEvents!(event, "delete"); 
            closeModal!();
            displayToast!('Shift deleted successfully!', 'success');
        }
        else{
            displayToast!('Failed to delete leave!', 'error');
        }
        
    }

    const handleSave = async () => {
        if (formValues){
            console.log(formValues);

            if (formValues === initialDetails){
                if (setEditing) setEditing(false);
                return;
            }

            const updatedShift : Shift = { ...formValues, status: statusToString(formValues.status) };
            const result = await updateShift(updatedShift);

            if (result){
                displayToast!(`Updated shift successfully!`, 'success');

                const updatedEvent = {
                    ...event,
                    extendedProps: formValues,
                    title: buildShiftEventTitle(formValues.status, formValues.time, formValues.location, formValues.employee),
                    backgroundColor: getStatusColor(formValues.status)
                };

                setEvents!(updatedEvent, "update");
                setEvents!(updatedEvent, "updateDate");
                
                if (setEditing) setEditing(false);
                
            }
            else{
                displayToast!(`Failed to update shift!`, 'error');
            }
        }
    }
    
    return (
        <>
    <div className = "flex justify-between">
        <p className="text-sm font-semibold text-gray-600 mt-1">Status: 
        <span className="font-bold" style={{color: getStatusColor(status)}}> {status}</span></p>

        <div className="flex gap-3 text-[color:var(--primary-color)] [&>*]:hover:text-[color:var(--hover-color)]">
            {isEditing ? <FaSave onClick={()=>{handleSave()}}/> :
            <>
            <FaRegBell/>
            <FaEdit onClick={()=>setEditing && setEditing(true)}/>
            <FaTrash onClick={handleDelete}/>
            </>
            }
            
        </div>
    </div>
    
    {employee ? <p className="text-sm font-semibold text-gray-600 mt-1">Employee: <span className="text-[color:var(--secondary-color)] font-normal"> {employee}</span></p> : ""}    


    </>);
}


function createDetail(label: string, detail: string, type:string=""){
    if (type === "textarea")
        return (<><p className="text-sm font-semibold text-gray-600 mt-1 mb-1">{label}</p>
    <textarea className="text-gray-500 font-normal text-sm border-2 border-gray-500 bg-gray-100 rounded-md min-w-full p-2 min-h-[72px] resize-none focus:outline-0" value={detail}></textarea></>);
    else{
            return (<p className="text-sm font-semibold text-gray-600 mt-1">{label}
    <span className="text-[color:var(--secondary-color)] font-normal">{detail}</span></p>);
    }
}

function createDetailEditor(label: string, field: keyof ExtendedProps, detail: string, type:string="", isEditing=false, formValues?: ExtendedProps | null, handleChange?: (field: string, value: any) => void){
    if (type === "textarea")
        return (<><p className="text-sm font-semibold text-gray-600 mt-1 mb-1">{label}</p>
    <textarea readOnly={!isEditing} className="text-gray-500 font-normal text-sm border-2 border-gray-500 bg-gray-100 rounded-md min-w-full p-2 min-h-[72px] resize-none focus:outline-0" value={detail} onChange={(e)=>handleChange!("notes", e.target.value)}></textarea></>);
    else{
        if (isEditing){
            const pickerSetup = { "& .MuiPickersInputBase-sectionsContainer": {padding: "8px 4px", fontSize: "0.9em"}};

            let editJSX = <></>;

            if (label.toLowerCase().includes('date')){
                editJSX = <DatePicker  format="DD-MM-YYYY"  slotProps={{textField: {sx: pickerSetup}}} defaultValue={dayjs(formatToSqlDate(detail))} onChange={(e)=>handleChange!("date", e?.format('YYYY-MM-DD'))}/>
            }
            else if (label.toLowerCase().includes('time')){
                const [start, end] = detail.split('–');
            
                editJSX = <>
                    <TimePicker format="hh:mm A" slotProps={{ textField: {sx: pickerSetup}}} className="w-36" value={formValues?.start ? dayjs(formValues.start, "HH:mm") : dayjs(start,"HH:mm")} onChange={(e)=>handleChange!("start", e?.format('HH:mm:ss'))}/>
                    <span className="text-[color:var(--primary-color)] font-bold">–</span>
                    <TimePicker format="hh:mm A" slotProps={{ textField: {sx: pickerSetup}}} className="w-36" value={formValues?.end ? dayjs(formValues.end, "HH:mm") : dayjs(end,"HH:mm")} onChange={(e)=>handleChange!("end", e?.format('HH:mm:ss'))}/>
                </>;
            }
            else if (label.toLowerCase().includes('location')){
                return (
                <div className="flex items-center gap-2 text-sm mt-2 w-full">
                    <div className="font-semibold text-gray-600">
                        <div>Location:</div><br/>
                        <div>Address:</div>
                    </div>
                    
                    <LocationDropdownWithAddress detail={detail} setUpdatedLocation={handleChange}/>
                </div>
                
                );
            }
            else{
                editJSX = <Input value={detail} className="py-1 px-3 border-1" containerClassName="w-full" readonly/>;
            }


            if (label.startsWith("Address")) return;

            return (
                <div className="flex items-center gap-2 text-sm mt-2 w-full">
                    <div className="font-semibold text-gray-600">
                        {label}
                    </div>
                    
                    
                    {editJSX}
                </div>
            );
        }
        else 
            return (<p className="text-sm font-semibold text-gray-600 mt-1">{label}
    <span className="text-[color:var(--secondary-color)] font-normal">{detail}</span></p>);
    }
}

function createDetails(type: string|null, details?: ExtendedProps|null, isAdmin?:boolean, setEvents?: setEventType, event?:EventInput, displayToast?:(message:string, toastType: 'success'|'error')=>void, closeModal?:Function, isEditing?: boolean, setEditing?:((e:boolean)=>void), formValues?: ExtendedProps | null, handleChange?: (field: string, value: any) => void, initialDetails?:ExtendedProps){
    if (details === undefined || details === null || type===null) return;

    if (type === ModalTypes.UnavailabilityDetails)
    {
        return (
            <>
            {createDetail("Every: ", details.day ? details.day : "")}
            {createDetail("Time: ", details.time)}
            </>
        );
    }
    else if (type === ModalTypes.LeaveDetails)
    {
        return (
            <>
            {createDetail("Date: ", details.date)}
            {createDetail("Time: ", details.time)}
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
            <div className="flex flex-wrap items-center gap-2">
                <p className="text-md font-semibold text-gray-600 mt-1 mb-1">Date:</p>
                <div className="flex gap-2">
                    <DatePicker label="From" format="DD-MM-YYYY" slotProps={{ textField: { sx: { minWidth: 120, maxWidth: 140 } } }} />
                    <span className="text-[color:var(--primary-color)] font-bold">–</span>
                    <DatePicker label="To" format="DD-MM-YYYY" slotProps={{ textField: { sx: { minWidth: 120, maxWidth: 140 } } }} />
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <p className="text-md font-semibold text-gray-600 mt-1 mb-1">Time:</p>
                <div className="flex gap-2">
                    <TimePicker label="From" format="hh:mm A" slotProps={{ textField: { sx: { minWidth: 120, maxWidth: 140 } } }} />
                    <span className="text-[color:var(--primary-color)] font-bold">–</span>
                    <TimePicker label="To" format="hh:mm A" slotProps={{ textField: { sx: { minWidth: 120, maxWidth: 140 } } }} />
                </div>
            </div>
            <FormControl component="fieldset">
                <FormLabel component="legend" className="!text-md !font-semibold !text-gray-600">Recurrence</FormLabel>
                <RadioGroup row>
                    {["Never", "Daily", "Weekly", "Monthly"].map((opt) => (
                        <FormControlLabel key={opt} value={opt} control={<Radio color="primary" />} label={opt} />
                    ))}
                </RadioGroup>
            </FormControl>
        </div>
        ); 
    else{

        return (
            <>
            {isAdmin && setEditing && createAdminComponent(details.status, details.employee, setEvents, event, displayToast, closeModal, isEditing, setEditing, formValues, initialDetails)}
            {createDetailEditor("Date: ", 'date', sqlDateFormatToRegularFormat(details.date), "", isEditing, formValues, handleChange)}
            {createDetailEditor("Time: ", 'time' , details.time, "", isEditing, formValues, handleChange)}
            {createDetailEditor("Location: ", 'location' ,details.location, "", isEditing, formValues, handleChange)}
            {createDetailEditor("Address: ", 'address' ,details.address, "", isEditing, formValues, handleChange)}
            {createDetailEditor("Notes: ", 'notes',details.notes, "textarea", isEditing, formValues, handleChange)}
            </>
        );
    }
}

function createButtons(type: string|null, setEvents?: setEventType, event?:EventInput, displayToast?:(message:string, toastType: 'success'|'error')=>void, closeModal?:Function, isAdmin?:boolean){
    
    let buttons = null;
    if (type === ModalTypes.LeaveDetails){
        const handleDelete = () => {
            // delete from db and check if succesful, if yes then proceed
            // deleteLeave();
            const result = true;
            

            if (result){
                if (event) setEvents!(event, "delete"); 
                closeModal!();
                displayToast!('Leave deleted successfully!', 'success');
            }
            else{
                displayToast!('Failed to delete leave!', 'error');
            }
            
        }

        if (!isAdmin)
            buttons = <Button type="cta" fontSize="0.8em" onClick={handleDelete}>Delete leave</Button>;
    }
    else if (type === ModalTypes.UnavailabilityDetails){
        const handleDelete = () => {
            // delete from db and check if succesful, if yes then proceed
            // deleteAvailability();
            const result = true;

            if (result){
                if (event) setEvents!(event, "delete"); 
                closeModal!();
                displayToast!('Availability deleted successfully!', 'success');
            }
            else{
                displayToast!('Failed to delete availability details!', 'error');
            }
            
        }

        if (!isAdmin)
            buttons = <Button type="cta" fontSize="0.8em" onClick={handleDelete}>Delete unavailability</Button>;
    }
    else if (type === ModalTypes.AddLeave){
        buttons = <Button type="cta" fontSize="0.8em">Submit leave</Button>
    }
    else if (type === ModalTypes.AddUnavailability)
        buttons = <Button type="cta" fontSize="0.8em">Submit unavailability</Button>;
    else if (type === ModalTypes.OpenShiftDetails)
    {
        const handleAssign = () => {};
        const handlePickup = async () => {
            const result = await updateShiftStatus(event?.extendedProps?.id as string, event?.extendedProps?.user_id as string, Status.Accepted);
            
            if (result){
                if (event) {
                    const updatedEvent = {
                        ...event,
                        extendedProps: {
                            ...event.extendedProps,
                            status: Status.Accepted
                        },
                        title: buildShiftEventTitle(Status.Accepted, event.extendedProps?.time, event.extendedProps?.location),
                        backgroundColor: getStatusColor(Status.Accepted)
                    };

                    setEvents!(updatedEvent, "update");

                    closeModal!();
                    displayToast!(`Picked up shift at ${event.extendedProps?.location}, ${event.extendedProps?.time} successfully!`, 'success');
                }
            }
            else{
                displayToast!('Failed to pick-up shift!', 'error');
            }
            
        }

        if (isAdmin){
            buttons = (<>
        <Button type="cta" fontSize="0.8em" onClick={handleAssign}>Assign</Button>
        </>);
        }
        else{
            buttons = (<>
        <Button type="cta" fontSize="0.8em" onClick={handlePickup}>Pick-up Shift</Button>
        </>);
        }
        
    }
    else if (type === ModalTypes.PendingDetails)
    {
        const handleAccept = async () => {
            const result = await updateShiftStatus(event?.extendedProps?.id as string,event?.extendedProps?.user_id as string, Status.Accepted);

            if (result){
                if (event) {
                    const updatedEvent = {
                        ...event,
                        extendedProps: {
                            ...event.extendedProps,
                            status: Status.Accepted
                        },
                        title: buildShiftEventTitle(Status.Accepted, event.extendedProps?.time, event.extendedProps?.location),
                        backgroundColor: getStatusColor(Status.Accepted)
                    };

                    setEvents!(updatedEvent, "update");

                    closeModal!();
                    displayToast!(`Accepted shift at ${event.extendedProps?.location}, ${event.extendedProps?.time} successfully!`, 'success');
                }
            }
            else{
                displayToast!('Failed to accept your pending shift!', 'error');
            }
            
        }
        const handleDecline = async () => {
            const confirmation = window.confirm("This action cannot be undone. Are you sure you want to decline this shift?");
            const result = await updateShiftStatus(event?.extendedProps?.id as string,event?.extendedProps?.user_id as string, Status.DeclinedShift);;

            if (!confirmation) return;

            if (result){
                if (event) setEvents!(event, "delete"); 
                closeModal!();
                displayToast!('Shift declined!', 'success');
            }
            else{
                displayToast!('Failed to decline shift!', 'error');
            }
            
        }

        if (!isAdmin)
            buttons = (<>
        <Button type="cta" fontSize="0.8em" className="bg-[color:var(--success-color)] hover:bg-[color:var(--success-color-hover)]" onClick={handleAccept}>Accept</Button>
        <Button type="cta" fontSize="0.8em" className="bg-[color:var(--danger-color)] hover:bg-[color:var(--danger-color-hover)]" onClick={handleDecline}>Decline</Button>
        </>);
    }
    else if (type === ModalTypes.DeclinedDetails){
        const onView = () => {
            // delete from db and check if succesful, if yes then proceed
            // viewDeclined();
            const result = true;

            if (result){
                if (event) setEvents!(event, "delete"); 
                closeModal!();
            }
            else{
                displayToast!('An unknown error occured', 'error');
            }
            
        }

        if (isAdmin)
            buttons = <Button fontSize="0.8em" onClick={onView}>Reassign</Button>
        else buttons = <Button fontSize="0.8em" onClick={onView}>Mark as viewed</Button>
    }
    
    return buttons;
}

export function createModal(type:ModalTypes|null, startOpen: boolean, modalContainer: HTMLDivElement, details?:ExtendedProps|null, setParentOpen?: (e:boolean)=>void, setEvents?:setEventType, event?:EventInput, displayToast?:(message:string, toastType: 'success'|'error')=>void){
    return (<Modal type={type} details={details} startOpen={startOpen} modalContainer={modalContainer} setParentOpen={setParentOpen} setEvents={setEvents} event={event} displayToast={displayToast}/>);
}

export default function Modal({type, details, startOpen, title, modalContainer, setParentOpen, ...props} : ModalProps){
    const [shown, setShown] = useState(startOpen ?? false);
    const [isEditing, setIsEditing] = useState(false);
    const [formValues, setFormValues] = useState<ExtendedProps|null>(details ?? null);

    const handleChange = (field: string, value: any) => {
        setFormValues((prev: any) => {
            if (field === "start" || field === "end"){
                return {
                    ...prev,
                    [field]: value,
                    time: (field === "start" ? value.slice(0,5) : formValues?.start.slice(0,5)) + "-" + (field === "end"?value.slice(0,5):formValues?.end.slice(0,5))
                };

            }

            return {
                ...prev,
                [field]: value
            };
        });
    };

    const containerRef = useRef<HTMLDivElement>(null);
    useClickOutside(containerRef, ()=> props.setShown ? props.setShown(false) : setShown(false));
    
    const [rendered, setRendered] = useState(false);
    const [visible, setVisible] = useState(false);

    overlayAnimation(props.shown ? props.shown : shown, setRendered, setVisible, modalContainer, setParentOpen)

    const closeModal = () => props.setShown ? props.setShown(false) : setShown(false);

    const admin = useAuth().user?.role === "admin";
    const buttons = type!==undefined && createButtons(type, props.setEvents, props.event, props.displayToast, closeModal, admin);

    const setEditing = (edit:boolean) => {
        setIsEditing(admin && edit);
    }

    const ModalJSX = (<div className={`${props.noOverlay ? ' ': 'fixed -translate-y-1/2 top-1/2'} md:translate-none md:relative transform rounded-lg bg-white text-left shadow-xl transition-all my-auto w-80 sm:w-full sm:max-w-lg`} ref={containerRef}>
    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 rounded-lg">
        <div className="sm:flex sm:items-start">
        
            <div className="mt-3 w-full sm:mt-0 sm:text-left">
                <div className="flex items-center justify-between align-middle mb-2">
                    <h1 id="dialog-title" className="text-lg font-semibold text-gray-900">{type !== undefined ? type : title??"Please set the tag 'title'"}</h1>
                    
                    {!props.noOverlay && 
                    <Icon
                        id="x"
                        width="1.5em"
                        height="1.5em"
                        className="text-black-700 hover:text-[color:var(--danger-color)]"
                        onClick={closeModal}
                    />}
                    
                </div>
                

                {type!==undefined && type !== ModalTypes.Notifications && createDetails(type, formValues, admin, props.setEvents, props.event, props.displayToast, closeModal, isEditing, setEditing, formValues, handleChange, details===null?undefined:details)}
                

                {props.children}
            </div>
        </div>  
    </div>
    {(buttons!=null || props.customButtons) && <div className=" py-3 flex flex-row px-6 gap-3 rounded-lg">
        {type!==undefined ? buttons : props.customButtons}
    </div>}    
    </div>);

    if (props.noOverlay) return ModalJSX;

    return (
        <ModalPortal container={modalContainer} isModalOpen={rendered}>
            {rendered && <div role="dialog" aria-modal="true" aria-labelledby="dialog-title" className={`relative z-10 h-full transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} >
            
            <div aria-hidden="true" className={`absolute inset-0 bg-gray-200/75 backdrop-blur-sm transition-all duration-200 ${visible ? 'backdrop-opacity-100' : 'backdrop-opacity-0'}`}></div>

            <div className="relative z-10 w-full overflow-y-auto h-full">
            <div className="flex min-h-full justify-center p-4 text-center items-center sm:p-0">
            
                {type === ModalTypes.Notifications &&
                    <ListView title="Notifications" containerRef={containerRef} setShown={setShown}>{createNotifications()}</ListView>
                }

                {type !== ModalTypes.Notifications && ModalJSX}
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
    div.className = "w-full h-full z-100";
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
