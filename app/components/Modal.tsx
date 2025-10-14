"use client";
import { ReactNode, useEffect, useRef, useState } from "react";
import Icon from "@/public/icons/Icons";
import Button, { Selectable } from "./Button";
import { overlayAnimation, useClickOutside } from "./utils/useClickOutside";
import getStatusColor, { Status, statusToString, stringToStatus } from "./utils/getStatusColor";
import React from "react";
import { createPortal } from "react-dom";
import ListView from "./ListView";
import { createNotifications, generateStaffNotificationMessage, NotificationProps, notifyManually, shiftStatusToNotificationType } from "../controllers/Notification";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import Dropdown, { DayPicker, DropdownUser, LocationDropdownWithAddress } from "./Dropdown";
import { EventInput } from "@fullcalendar/core";
import { buildShiftEventTitle, deleteShift, publishShift, Shift, ShiftStatus, updateShift, updateShiftStatus } from "../controllers/Shifts";
import { useAuth } from "@/app/contexts/AuthContext";
import { FaBell, FaBellSlash, FaEdit, FaRegBell, FaSave, FaTrash } from "react-icons/fa";
import Input from "./Input";
import dayjs from "dayjs";
import { formatToSqlDate, sqlDateFormatToRegularFormat } from "./utils/formatDate";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import { createLeave, deleteLeave, updateLeaveStatus } from "../controllers/Leave";
import Spinner from "./Spinner";
import { fetchUsersPayRate } from "../controllers/User";
import { duplicateShift, shiftToEventInput } from "../controllers/Shifts";
import { FaBellConcierge, FaCopy } from "react-icons/fa6"; // or from "react-icons/fa"
import { createShift } from "../controllers/Shifts";
import { buildShiftEmail, buildShiftEmailPreview } from "../lib/shift-email";
import Checkbox from "./Checkbox";


type DupDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: Shift) => Promise<void>;
  initial: Shift;
};

function DupDialog({ open, onClose, onCreate, initial }: DupDialogProps) {
  const [date, setDate] = React.useState(dayjs(initial.date));
  const [from, setFrom] = React.useState(dayjs(initial.start_time, "HH:mm"));
  const [to, setTo] = React.useState(dayjs(initial.end_time, "HH:mm"));
  const [assigneeId, setAssigneeId] = React.useState(initial.assignee_id);
  const [assigneeName, setAssigneeName] = React.useState(initial.assignee_name ?? "");
  const [locationId, setLocationId] = React.useState(initial.location_id);
  const [locationName, setLocationName] = React.useState(initial.location_name);
  const [address, setAddress] = React.useState(initial.address);
  const [notes, setNotes] = React.useState(initial.notes ?? "");
  const [status, setStatus] = React.useState<ShiftStatus>(initial.status as ShiftStatus); // or default to "Pending"
  const [busy, setBusy] = React.useState(false);
  const [published, setPublished] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-5 relative">
        <button className="absolute right-3 top-2 text-xl" onClick={onClose}>×</button>
        <h3 className="text-lg font-semibold mb-4">Duplicate shift</h3>

        <div className="flex flex-col gap-3">
          {/* Date */}
          <div className="flex items-center gap-2">
            <span className="w-24 text-sm font-medium text-gray-600">Date:</span>
            <DatePicker
              format="DD-MM-YYYY"
              value={date}
              onChange={(d)=> d && setDate(d)}
              slotProps={{ textField: { sx: { minWidth: 170 } } }}
            />
          </div>

          {/* Time */}
          <div className="flex items-center gap-2">
            <span className="w-24 text-sm font-medium text-gray-600">Time:</span>
            <TimePicker
              label="From"
              format="hh:mm A"
              value={from}
              onChange={(t)=> t && setFrom(t)}
              slotProps={{ textField: { sx: { minWidth: 150 } } }}
            />
            <span className="font-bold text-[color:var(--primary-color)]">–</span>
            <TimePicker
              label="To"
              format="hh:mm A"
              value={to}
              onChange={(t)=> t && setTo(t)}
              slotProps={{ textField: { sx: { minWidth: 150 } } }}
            />
          </div>

          {/* Assignee */}
          <div className="flex items-center gap-2">
            <span className="w-24 text-sm font-medium text-gray-600">Assignee:</span>
            <DropdownUser
              detail={assigneeName}
              setUpdatedDetail={(k: string, v: any) => {
                if (k === "assignee_name") setAssigneeName(v);
                if (k === "assignee_id") setAssigneeId(v);
              }}
            />
          </div>

          {/* Location + address */}
          <div className="flex items-stretch gap-2">
            <span className="w-24 text-sm font-medium text-gray-600 pt-2">Location:</span>
            <div className="flex-1">
              <LocationDropdownWithAddress
                detail={locationName}
                setUpdatedDetail={(k: string, v: any) => {
                  if (k === "location_id") setLocationId(v);
                  if (k === "location_name") setLocationName(v);
                  if (k === "address") setAddress(v);
                }}
              />
            </div>
          </div>

          {/* Set as published */}
          <div className="flex items-stretch gap-2">
            <span className="w-24 text-sm font-medium text-gray-600 pt-2">Set as published:</span>
            <div className="flex-1">
              <Checkbox label='' checked={published} onChange={(e:boolean)=>setPublished(e)}/>
            </div>
          </div>

          {/* Notes */}
          <div>
            <span className="block text-sm font-medium text-gray-600">Notes:</span>
            <textarea
              className="border rounded w-full p-2 text-sm"
              value={notes}
              onChange={(e)=> setNotes(e.target.value)}
            />
          </div>

          {/* Status (optional – show if you want to override to Pending) */}
          {/* <div className="flex items-center gap-2">
            <span className="w-24 text-sm font-medium text-gray-600">Status:</span>
            <Dropdown items={['Pending','Accepted','Open','Unassigned']} initialSelectedItem={status} onChange={(s)=> setStatus(s)} />
          </div> */}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button className="px-4 py-2 rounded bg-gray-200" onClick={onClose}>Cancel</button>
          <button
            disabled={busy}
            className="px-4 py-2 rounded bg-[color:var(--primary-color)] text-white hover:bg-[color:var(--hover-color)]"
            onClick={async ()=>{
              setBusy(true);
              await onCreate({
                date: date.format("YYYY-MM-DD"),
                start_time: from.format("HH:mm:ss"),
                end_time: to.format("HH:mm:ss"),
                assignee_id: assigneeId,
                assignee_name: assigneeName,
                location_id: locationId,
                location_name: locationName,
                address,
                notes,
                status, // or force "Pending"
                published,
              });
              setBusy(false);
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}




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
    UnpublishedShiftDetails = "Unpublished shift details",
    Notifications="Notifications",
}

export type EventTypes = "shift"|"leave"|"unavailability"

export function getModalTypesByStatus(status:Status, type:EventTypes="shift"){
    switch(status){
        case Status.Unassigned:
            return ModalTypes.UnassignedShiftDetails;
        case Status.Request:
            return ModalTypes.RequestDetails;
        case Status.Accepted:
            if (type==="shift")
                return ModalTypes.ShiftDetails;
            else
                return ModalTypes.LeaveDetails;
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
        case Status.Unpublished:
            return ModalTypes.UnpublishedShiftDetails;
        default:
            return null;
    }
}

export type LeaveExtendedProps = {
    id?: string;
    assignee_id: string;
    assignee_name?: string;
    type: string;
    status: string;
    date: string;
    end_date: string;
    time:string;
    start_time: string;
    end_time: string;
    day?: string;
    recurrence?: string;
    unavailability?: boolean;
}

export type ShiftExtendedProps = {
    id?: string;
    assignee_id: string;
    assignee_name?: string;
    status: Status;
    original_status: Status;
    type: string;
    date: string;
    time: string;
    start_time: string;
    end_time: string;
    location_name: string;
    location_id: string;
    address: string;
    notes: string;
    published?: boolean;
    pay_rate?:number;
    total_payment?:number;
    day?: string;
    recurrence?: string;
}

export type setEventType = (event: EventInput, mode:"create"|"update"|"delete", isEventImpl?:boolean)=>void;
interface ModalProps{
    type?: ModalTypes|null;
    startOpen ?: boolean;
    shown?: boolean;
    setShown?: (arg0: boolean) => void;
    details?: Record<string, any>; 
    title?:string;
    modalContainer: HTMLDivElement;
    setParentOpen?:(e:boolean)=>void;
    children?: React.ReactNode;
    customButtons?: React.ReactNode;
    setEvents?:setEventType;
    event?:EventInput;
    displayToast?:(message:string, toastType: 'success'|'error')=>void;
    noOverlay?:boolean;
    hasItems?:(e:boolean)=>void;
    onClose?:()=>void;
    maxContentHeight?:string;
}

function createAdminComponent(status: Status, employee?:string, setEvents?: setEventType, event?:EventInput, displayToast?:(message:string, toastType: 'success'|'error')=>void, closeModal?:Function, isEditing=false, setEditing?:(e:boolean)=>void, formValues?: Record<string, any>, handleChange?: (field: string, value: any) => void, initialDetails?:ShiftExtendedProps, setLoading?:(e:boolean)=>void){
    const castedFormValues =  formValues ? ("location_id" in formValues ? formValues as ShiftExtendedProps : -1) : -1;
    if (castedFormValues === -1) return;

    const handleDelete = async () => {
        const confirm = window.confirm("Are you sure you want to delete this shift?")
        if (!confirm) return;
        const result = await deleteShift(event?.extendedProps?.id);
        
        if (result){
            if (event) setEvents!(event, "delete"); 
            closeModal!();
            displayToast!('Shift deleted successfully!', 'success');
        }
        else{
            displayToast!('Failed to delete shift!', 'error');
        }
        
    }

    const handleSave = async () => {
        if (castedFormValues){
            if (castedFormValues.assignee_name === '') castedFormValues.assignee_name = initialDetails?.assignee_name;
            if (castedFormValues.date === initialDetails?.date && castedFormValues.time === initialDetails.time && castedFormValues.location_id === initialDetails.location_id && castedFormValues.address === initialDetails.address && castedFormValues.status === initialDetails.status && castedFormValues.assignee_id === initialDetails.assignee_id && castedFormValues.notes === initialDetails.notes && castedFormValues.published == initialDetails.published){
                if (setEditing) setEditing(false);
                return;
            }

            try{
                setLoading && setLoading(true);
                const updatedShift : Shift = { ...castedFormValues, status: statusToString(castedFormValues.status) };
                const result = await updateShift(updatedShift, castedFormValues.assignee_name !== initialDetails?.assignee_name);

                if (result){
                    displayToast!(`Updated shift successfully!`, 'success');


                    const isOpenOrUnassigned = castedFormValues.status === Status.OpenShift || castedFormValues.status === Status.Unassigned;
                    if (isOpenOrUnassigned){
                        handleChange!('assignee_id', '');
                        handleChange!('assignee_name', undefined);
                    }

                    const updatedEvent = {
                        ...event,
                        extendedProps: {...castedFormValues, assignee_id: isOpenOrUnassigned ? '' : castedFormValues.assignee_id, assignee_name: isOpenOrUnassigned ? undefined : castedFormValues.assignee_name},
                        title: buildShiftEventTitle(castedFormValues.published ? castedFormValues.status : Status.Unpublished, castedFormValues.time, castedFormValues.location_name, isOpenOrUnassigned ? '' : castedFormValues.assignee_name),
                        backgroundColor: getStatusColor(castedFormValues.published ? castedFormValues.status : Status.Unpublished)
                    };
                    
                    if (setEvents) setEvents(updatedEvent, "update");
                    
                    if (setEditing) {
                        setEditing(false);
                    }
                }
                else{
                    displayToast!(`Failed to update shift!`, 'error');
                }
            }
            finally{
                setLoading && setLoading(false);
            }
            
        }
    }

    return (
        <>
    <div className="flex justify-between items-center">
        <div className={`text-sm font-semibold text-gray-600 mt-1 flex items-center ${isEditing ? 'gap-2' : 'gap-1'}`}>Status: 
            {isEditing ? 
             <>
                <Dropdown items={[ ...Object.values(Status).filter(((status)=>status!=='Leave'&&status!=='Unavailable'&&status!=='Assigned'&&status!=='Unpublished'))]} placeholder="Select shift" maxVisibleItems={6} className='min-w-32' initialSelectedItem={formValues?.original_status ?? 'Select a status'} onChange={(e)=>handleChange!('status', e)} colorBasedOnValue syncCurrentWithInitialSelected={true}/>
                {initialDetails?.published ? <Checkbox label="Published" checked={castedFormValues.published?castedFormValues.published:false} onChange={(e)=>{handleChange!('published', e ? 1 : 0)}} className="text-xs md:text-sm"/> : ''}
                
             </>
            : 
            <span className="font-bold" style={{color: getStatusColor(status)}}>{status}</span>}
        </div>
        
        
        <div className="flex gap-3 text-[color:var(--primary-color)] [&>*]:hover:text-[color:var(--hover-color)]">
            {isEditing ? <div id="btnSave" onClick={()=>{handleSave()}} className="hidden md:block"><FaSave /></div> :
            <>
              {castedFormValues.assignee_name ? (castedFormValues.status === 'Unpublished' ? <FaBell title="Publish the shift first to notify the assignee" onClick={()=>displayToast&&displayToast('You need to publish this shift first to be able to notify the assignee. Assignee will be automatically notified once you published this shift.', 'error')}/> : <FaBell onClick={() => (window as any).__openNotifyModal?.()} title='Notify assignee'/>): ''}
              <FaCopy onClick={() => (window as any).__openShiftDuplicate?.()} title="Duplicate shift" />
              <FaEdit
                  onClick={() => {
                    setEditing && setEditing(true);
                    castedFormValues.assignee_id === null;
                  }}
                title="Edit shift"/>
              <FaTrash onClick={handleDelete} title="Delete shift"/>
            </>

            }
            
        </div>
    </div>
    
    {(employee!==undefined && employee!==null) ? <div className={`text-sm font-semibold text-gray-600 ${isEditing ? 'mt-3 gap-2' : 'mt-1 gap-1'} flex items-center`}>Employee: {isEditing ?  
    <DropdownUser id='dropdown-user' detail={employee} setUpdatedDetail={handleChange}/>
    : <span className="text-[color:var(--secondary-color)] font-normal"> {employee}</span>}</div> : ""}    


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

function createDetailEditor(label: string, field: keyof ShiftExtendedProps, detail: string, type:string="", isEditing=false, formValues?: Record<string, any>, handleChange?: (field: string, value: any) => void, displayToast?:(message:string, toastType: 'success'|'error')=>void){
    const castedFormValues =  formValues ? ("status" in formValues ? formValues as ShiftExtendedProps : -1) : -1;
    if (castedFormValues === -1) return;

    if (type === "textarea")
        return (<><p className={`text-sm font-semibold text-gray-600 ${isEditing?"mt-3":"mt-1"} mb-1`}>{label}</p>
    <textarea readOnly={!isEditing} className="text-gray-500 font-normal text-sm border-2 border-gray-500 bg-gray-100 rounded-md min-w-full p-2 min-h-[72px] resize-none focus:outline-0" value={castedFormValues.notes??''} onChange={(e)=>handleChange!("notes", e.target.value)}></textarea></>);
    else{
        if (isEditing){
            const pickerSetup = { "& .MuiPickersInputBase-sectionsContainer": {padding: "8px 4px", fontSize: "0.9em"}};

            let editJSX = <></>;

            if (label.toLowerCase().includes('date')){
                editJSX = <DatePicker  format="DD-MM-YYYY"  slotProps={{textField: {sx: pickerSetup}}} defaultValue={dayjs(formatToSqlDate(detail))} onChange={(e)=>handleChange!("date", e?.format('YYYY-MM-DD'))}/>
            }
            else if (label.toLowerCase().includes('time')){
                editJSX = <>
                    <TimePicker label="From" format="hh:mm A" slotProps={{ textField: { sx: pickerSetup} } } value={castedFormValues.start_time ? dayjs(castedFormValues.start_time, "HH:mm") : null} onChange={(e)=>{handleChange!("start_time", e?.format('HH:mm:ss'))}}/>
                    <span className="text-[color:var(--primary-color)] font-bold">–</span>
                    <TimePicker label="To" format="hh:mm A" slotProps={{ textField: { sx: pickerSetup } }}  value={castedFormValues.end_time ? dayjs(castedFormValues.end_time, "HH:mm") : null} onChange={(e)=>{handleChange!("end_time", e?.format('HH:mm:ss'))}}/>
                </>;
            }
            else if (label.toLowerCase().includes('location')){
                return (
                <div className="flex items-stretch gap-2 text-sm mt-3 w-full h-fit">
                    <div className="font-semibold text-gray-600 flex flex-col justify-center gap-3">
                        <div className="flex items-center py-2">Location:</div>
                        <div className="flex items-center py-2">Address:</div>
                    </div>
                    
                    <LocationDropdownWithAddress detail={detail} setUpdatedDetail={handleChange} />
                </div>
                
                );
            }
            else if (label.toLowerCase().includes('pay')){
                return (
                    <div className="flex items-center gap-2 text-sm mt-3 w-full">
                        <div className="font-semibold text-gray-600">
                            {label}
                        </div>
                        
                        <div className="font-medium text-hover">
                            {detail}
                        </div>
                    </div>
                );
            }
            else{
                editJSX = <Input value={detail} className="py-1 px-3 border-1" containerClassName="w-full" readonly/>;
            }


            if (label.startsWith("Address")) return;

            return (
                <div className="flex items-center gap-2 text-sm mt-3 w-full">
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

function createDetails(type: string|null, details?: Record<string, any>, isAdmin?:boolean, setEvents?: setEventType, event?:EventInput, displayToast?:(message:string, toastType: 'success'|'error')=>void, closeModal?:Function, isEditing?: boolean, setEditing?:((e:boolean)=>void), formValues?: Record<string, any>, handleChange?: (field: string, value: any) => void, initialDetails?:ShiftExtendedProps, setLoading?:(e:boolean)=>void){
    if (type===null || details === undefined || formValues === undefined) return;

    const castedDetails = 'location_id' in formValues ? formValues as ShiftExtendedProps : formValues as LeaveExtendedProps;


    if ('day' in castedDetails && (castedDetails.type === "leave" || type === ModalTypes.UnavailabilityDetails))
    {
        return (
            <>
            {isAdmin && createDetail("Employee: ", castedDetails.assignee_name ? castedDetails.assignee_name : "")}
            {createDetail("Every: ", castedDetails.day ? castedDetails.day : "")}
            {createDetail("Time: ", castedDetails.time)}
            </>
        );
    }
    else if (castedDetails.type === "leave")
    {
        return (
            <>
            {isAdmin && createDetail("Employee: ", castedDetails.assignee_name ? castedDetails.assignee_name : "")}
            {createDetail("Date: ", castedDetails.date)}
            {createDetail("Time: ", castedDetails.time)}
            {castedDetails.recurrence && createDetail("Recurrence: ", castedDetails.recurrence)}
            </>
        );
    }
    else if (type === ModalTypes.AddLeave){
        // Must pass in details having the 'recurrence' key
        const castedFormValues =  formValues ? ("recurrence" in formValues ? formValues as LeaveExtendedProps : -1) : -1;
        if (castedFormValues === -1) return;

        if (castedFormValues.recurrence === "") castedFormValues.recurrence = "Never";
        // console.log(castedFormValues);

        const onToggleLeave = {
            true: function(){handleChange!("unavailability", false)},
            false: function(){handleChange!("unavailability", true)},
        };

        const onToggleUnavail = {
            true: function(){handleChange!("unavailability", true)},
            false: function(){handleChange!("unavailability", false)},
        };
      
        return (
           <div className="flex flex-col gap-4 mt-4">
            {/* <div className="flex flex-wrap items-center gap-2">
                <Button type='selectable' fontSize="0.8em" startActive={castedFormValues.unavailability?!castedFormValues.unavailability:true} onToggleClick={onToggleLeave}>Leave</Button>
                <Button type='selectable' fontSize="0.8em" startActive={castedFormValues.unavailability??false} onToggleClick={onToggleUnavail}>Unavailability</Button>
            </div> */}
            

            {castedFormValues.unavailability && <div className="flex items-center gap-2">
                <p className="text-md font-semibold text-gray-600 mt-1 mb-1 w-12">Day:</p>
                
                <DayPicker onChange={(e:string)=>handleChange!("day", e)} value={castedFormValues.day} />
            </div>}

            <div className="flex flex-wrap items-center gap-2">
                <p className="text-md font-semibold text-gray-600 mt-1 mb-1">Date:</p>
                <div className="flex gap-2 items-center w-full md:w-auto">
                    <DatePicker label="From" format="DD-MM-YYYY" slotProps={{ textField: { sx: { minWidth: 120, maxWidth: 140 } } }} value={castedFormValues.date ? dayjs(castedFormValues.date) : null} onChange={(e)=>{
                        if (!e) return;
                        const end = castedFormValues?.end_date ? dayjs(castedFormValues.end_date, "YYYY-MM-DD") : null;

                        if (end && e.isAfter(end)) {
                            displayToast!("Start date cannot be after end date", "error");
                            return;
                        }
                        handleChange!("date", e?.format('YYYY-MM-DD'))}}/>
                    
                    {!castedFormValues.unavailability && <>
                    <span className="text-[color:var(--primary-color)] font-bold">–</span>
                    <DatePicker label="To" format="DD-MM-YYYY" slotProps={{ textField: { sx: { minWidth: 120, maxWidth: 140 } } }} value={castedFormValues.end_date ? dayjs(castedFormValues.end_date) : null} onChange={(e)=>{
                        if (!e) return;
                        const start = castedFormValues?.date ? dayjs(castedFormValues.date, "YYYY-MM-DD") : null;

                        if (start && e.isBefore(start)) {
                            displayToast!("End date cannot be before start date", "error");
                            return;
                        }
                        handleChange!("end_date", e?.format('YYYY-MM-DD'))}}/>
                    </>}
                    
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <p className="text-md font-semibold text-gray-600 mt-1 mb-1">Time:</p>
                <div className="flex gap-2 items-center w-full md:w-auto">
                    <TimePicker label="From" format="hh:mm A" slotProps={{ textField: { sx: { minWidth: 120, maxWidth: 140 } } }} value={castedFormValues.start_time ? dayjs(castedFormValues.start_time, "HH:mm") : null} onChange={(e)=>{handleChange!("start_time", e?.format('HH:mm:ss'))}}/>
                    <span className="text-[color:var(--primary-color)] font-bold">–</span>
                    <TimePicker label="To" format="hh:mm A" slotProps={{ textField: { sx: { minWidth: 120, maxWidth: 140 } } }}  value={castedFormValues.end_time ? dayjs(castedFormValues.end_time, "HH:mm") : null} onChange={(e)=>{handleChange!("end_time", e?.format('HH:mm:ss'))}}/>
                </div>
            </div>
            {!castedFormValues.unavailability && <>
            <FormControl component="fieldset">
                <FormLabel component="legend" className="!text-md !font-semibold !text-gray-600">Recurrence</FormLabel>
                <RadioGroup row value={castedFormValues.recurrence} onChange={(e) => handleChange!("recurrence", e.target.value)}>
                    {["Never", "Daily", "Weekly", "Monthly"].map((opt) => (
                        <FormControlLabel key={opt} value={opt} control={<Radio color="primary" />} label={opt} />
                    ))}
                </RadioGroup>
            </FormControl>
            </>}
            
        </div>
        ); 
    }
    else if ('location_name' in castedDetails){
        return (
            <>
            {isAdmin && setEditing && createAdminComponent(castedDetails.original_status, castedDetails.assignee_name, setEvents, event, displayToast, closeModal, isEditing, setEditing, formValues, handleChange, initialDetails, setLoading)}
            {createDetailEditor("Date: ", 'date', sqlDateFormatToRegularFormat(castedDetails.date), "", isEditing, formValues, handleChange, displayToast)}
            {createDetailEditor("Time: ", 'time' , castedDetails.time, "", isEditing, formValues, handleChange, displayToast)}
            {createDetailEditor("Location: ", 'location_name' ,castedDetails.location_name, "", isEditing, formValues, handleChange, displayToast)}
            {createDetailEditor("Address: ", 'address' ,castedDetails.address, "", isEditing, formValues, handleChange, displayToast)}
            
            {isAdmin && (castedDetails.pay_rate!==undefined&&castedDetails.pay_rate!==null) && createDetailEditor("Active pay rate: ", 'pay_rate' ,'$'+castedDetails.pay_rate.toFixed(2)+'/h', "", isEditing, formValues, handleChange, displayToast)}
            {isAdmin && (castedDetails.total_payment!==undefined&&castedDetails.total_payment!==null) && createDetailEditor("Total Pay: ", 'total_payment' ,'$'+castedDetails.total_payment.toFixed(2), "", isEditing, formValues, handleChange, displayToast)}
            {createDetailEditor("Notes: ", 'notes',castedDetails.notes, "textarea", isEditing, formValues, handleChange, displayToast)}
            </>
        );
    }
}

function createButtons(type: string|null, setEvents?: setEventType, event?:EventInput, displayToast?:(message:string, toastType: 'success'|'error')=>void, closeModal?:Function, isAdmin?:boolean, formValues?: Record<string, any>, handleChange?: (field: string, value: any) => void, isEditing?: boolean, setEditing?:(e:boolean)=>void){
    // console.log(formValues);
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
        const castedFormValues =  formValues ? ("recurrence" in formValues ? formValues as LeaveExtendedProps : -1) : -1;
        if (castedFormValues === -1) return;

        
        const handleSubmit = async () => {
            if (!("date" in castedFormValues)){
                if (displayToast) displayToast(`Please select the leave starting date.`, 'error');  
                return;
            }

            if (!castedFormValues.unavailability && !("end_date" in castedFormValues)){
                if (displayToast) displayToast(`Please select the leave ending date.`, 'error');  
                return;
            }

            if (!("start_time" in castedFormValues)){
                if (displayToast) displayToast(`Please select the starting time.`, 'error');  
                return;
            }

            if (!("end_time" in castedFormValues)){
                if (displayToast) displayToast(`Please select the leave ending time.`, 'error');  
                return;
            }

            if (!castedFormValues.assignee_id){
                if (displayToast) displayToast(`Cannot retrieve active user id.`, 'error');  
                return;
            }

            const result = await createLeave({...castedFormValues, day_of_week:null, recurrence: castedFormValues.recurrence? castedFormValues.recurrence : "Never", type: 'leave'}, castedFormValues.unavailability??false);
            
            if (result){
                closeModal!();
                if (displayToast) displayToast(`Submitted leave request successfully! Please refresh the page to view your leave request.`, 'success');
        
            }
            else{
                if (displayToast) displayToast!('Failed to submit leave request!', 'error');
            }
            
        }
        buttons = <Button type="cta" fontSize="0.8em" onClick={()=>handleSubmit()}>Submit {castedFormValues.unavailability ? "unavailability" : "leave"}</Button>
    }
    else if (type === ModalTypes.OpenShiftDetails || type === ModalTypes.UnassignedShiftDetails)
    {
        const handleAssign = () => {
            handleChange!('assignee_name','');  
           
            setEditing!(true);
            // const dropdownUser = document.getElementById('dropdown-user');
            // console.log(dropdownUser);
            // dropdownUser?.click();
        };
        const handlePickup = async () => {
            if(!formValues) return;
            const result = await updateShiftStatus(formValues.id, Status.Accepted, formValues.assignee_id);
            
            if (result.success){
                if (event) {
                    const updatedEvent = {
                        ...event,
                        extendedProps: {
                            ...event.extendedProps,
                            status: Status.Accepted
                        },
                        title: buildShiftEventTitle(Status.Accepted, event.extendedProps?.time, event.extendedProps?.location_name),
                        backgroundColor: getStatusColor(Status.Accepted)
                    };

                    setEvents!(updatedEvent, "update");

                    closeModal!();
                    displayToast!(`Picked up shift at ${event.extendedProps?.location_name}, ${event.extendedProps?.time} successfully!`, 'success');
                }
                else {
                    closeModal!();
                    displayToast!(`Picked up shift at ${formValues.location_name}, ${formValues.time} successfully!`, 'success');
                }
            }
            else{
                displayToast!(result.err, 'error');
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
    else if (formValues && formValues.type === "leave" && type === ModalTypes.PendingDetails)
    {
        if (isAdmin){
            const handleAccept = async () => {
                const result = await updateLeaveStatus(event?.extendedProps?.id as string, (formValues as LeaveExtendedProps).assignee_id, true);

                if (result){
                    if (event) {
                        const updatedEvent = {
                            ...event,
                            extendedProps: {
                                ...event.extendedProps,
                                status: Status.Accepted
                            },
                            title: buildShiftEventTitle(Status.Leave, event.extendedProps?.time, event.extendedProps?.location_name),
                            backgroundColor: getStatusColor(Status.Leave)
                        };

                        setEvents!(updatedEvent, "update");

                        closeModal!();
                        displayToast!(`Accepted leave successfully!`, 'success');
                    }
                    else {
                        closeModal!();
                        displayToast!(`Picked up shift at ${formValues.location_name}, ${formValues.time} successfully!`, 'success');
                    }
                }
                else{
                    displayToast!('Failed to accept leave!', 'error');
                }
                
            }
            const handleDecline = async () => {
                const confirmation = window.confirm("This action cannot be undone. Are you sure you want to decline this leave request?");
                if (!confirmation) return;

                const result = await updateLeaveStatus(event?.extendedProps?.id as string, (formValues as LeaveExtendedProps).assignee_id, false);;
                if (result){
                    if (event) setEvents!(event, "delete"); 
                    closeModal!();
                    displayToast!('Leave declined!', 'success');
                }
                else{
                    displayToast!('Failed to decline leave!', 'error');
                }
                
            }
            buttons = (<>
        <Button type="cta" fontSize="0.8em" className="bg-[color:var(--success-color)] hover:bg-[color:var(--success-color-hover)]" onClick={handleAccept}>Accept</Button>
        <Button type="cta" fontSize="0.8em" className="bg-[color:var(--danger-color)] hover:bg-[color:var(--danger-color-hover)]" onClick={handleDecline}>Decline</Button>
        </>);
        }   
        else{
            const handleCancel = async () => {
            const result = await deleteLeave(event?.extendedProps?.id as string);

            if (result){
                if (event) setEvents!(event, "delete"); 
                closeModal!();
                displayToast!('Leave request cancelled!', 'success');
            }
            else{
                displayToast!('Failed to cancel leave request!', 'error');
            }
            
            }
             buttons = (<>
        <Button type="cta" fontSize="0.8em" className="bg-[color:var(--danger-color)] hover:bg-[color:var(--danger-color-hover)]" onClick={handleCancel}>Cancel</Button>
        </>);
        }
    }
    else if (type === ModalTypes.PendingDetails)
    {
        const handleAccept = async () => {
            if (!formValues) return;
            const result = await updateShiftStatus(formValues.id as string, Status.Accepted);

            if (result.success){
                if (event) {
                    const updatedEvent = {
                        ...event,
                        extendedProps: {
                            ...event.extendedProps,
                            status: Status.Accepted
                        },
                        title: buildShiftEventTitle(Status.Accepted, event.extendedProps?.time, event.extendedProps?.location_name),
                        backgroundColor: getStatusColor(Status.Accepted)
                    };

                    setEvents!(updatedEvent, "update");

                    closeModal!();
                    displayToast!(`Accepted shift at ${event.extendedProps?.location_name}, ${event.extendedProps?.time} successfully!`, 'success');
                }
                else {
                    closeModal!();
                    displayToast!(`Accepted shift at ${formValues.location_name}, ${formValues.time} successfully!`, 'success');
                }
            }
            else{
                displayToast!(result.err, 'error');
            }
            
        }
        const handleDecline = async () => {
            const confirmation = window.confirm("This action cannot be undone. Are you sure you want to decline this shift?");
          
            if (!formValues) return;
            const result = await updateShiftStatus(formValues.id as string, Status.DeclinedShift);


            if (result.success){
                if (event) setEvents!(event, "delete"); 
                closeModal!();
                displayToast!('Shift declined!', 'success');
            }
            else{
                displayToast!(result.err, 'error');
            }
            
        }

        if (!isAdmin)
            buttons = (<>
        <Button type="cta" fontSize="0.8em" className="bg-[color:var(--success-color)] hover:bg-[color:var(--success-color-hover)]" onClick={handleAccept}>Accept</Button>
        <Button type="cta" fontSize="0.8em" className="bg-[color:var(--danger-color)] hover:bg-[color:var(--danger-color-hover)]" onClick={handleDecline}>Decline</Button>
        </>);
    }
    else if (type === ModalTypes.DeclinedDetails){
        const handleView = async () => {
            const result = await deleteShift(event?.extendedProps?.id);
            
            if (result){
                if (event) setEvents!(event, "delete"); 
                closeModal!();
            }
        }

        const handleReassign =  () => {
            handleChange!('assignee_name','');  
           
            setEditing!(true);
        }

        if (isAdmin)
            buttons = <Button fontSize="0.8em" onClick={handleReassign} className="mb-2">Reassign</Button>
        else buttons = <Button fontSize="0.8em" onClick={handleView}>Mark as viewed</Button>
    }
    else if (type === ModalTypes.UnpublishedShiftDetails)
    {
        const handlePublish = async () => {
            try{
              (window as any).__setLoading?.(true);
              const result = await publishShift(event?.extendedProps?.id as string);
              
              if (result){
                  if (event) {
                      const updatedEvent = {
                          ...event,
                          extendedProps: {
                              ...event.extendedProps,
                              published: true,
                              status: event.extendedProps?.original_status
                          },
                          title: buildShiftEventTitle(event.extendedProps?.original_status, event.extendedProps?.time, event.extendedProps?.location_name),
                          backgroundColor: getStatusColor(event.extendedProps?.original_status)
                      };

                      setEvents!(updatedEvent, "update");

                      closeModal!();
                      displayToast!(`Published shift at ${event.extendedProps?.location_name}, ${event.extendedProps?.time} successfully!`, 'success');
                  }
              }
              else{
                  displayToast!('Failed to publish shift!', 'error');
              }
            }
            finally{
              (window as any).__openShiftDuplicate?.(false);
            }
        }

        if (isAdmin){
            buttons = (<>
        <Button type="cta" fontSize="0.8em" onClick={handlePublish}>Publish</Button>
        </>);
        }
    }
    const handleSave = () => {
        const btnSave = document.getElementById('btnSave');
        btnSave?.click();
    }
    if (isEditing && isAdmin) buttons = <div className="flex items-center flex-1 justify-between">{buttons}<Button fontSize="0.8em" onClick={handleSave}>Save</Button></div>;
    return buttons;
}

export function createModalNoOverlay(type:ModalTypes|null, modalContainer: HTMLDivElement, details?:Record<string, any>, displayToast?:(message:string, toastType: 'success'|'error')=>void, setShown?:(e:boolean)=>void){
    return (<Modal noOverlay={true} type={type} details={details} modalContainer={modalContainer} displayToast={displayToast} setShown={setShown}/>);
}

export function createModal(type:ModalTypes|null, startOpen: boolean, modalContainer: HTMLDivElement, details?:Record<string, any>, setParentOpen?: (e:boolean)=>void, setEvents?:setEventType, event?:EventInput, displayToast?:(message:string, toastType: 'success'|'error')=>void, hasItems?:(e:boolean)=>void, maxContentHeight?:string){
    return (<Modal type={type} details={details} startOpen={startOpen} modalContainer={modalContainer} setParentOpen={setParentOpen} setEvents={setEvents} event={event} displayToast={displayToast} hasItems={hasItems} maxContentHeight={maxContentHeight}/>);
}


interface ModalPortalProps {
  children: ReactNode;
  container: HTMLDivElement | HTMLElement;
  isModalOpen: boolean;
}

function ModalPortal({ children, container, isModalOpen }: ModalPortalProps) {
  const main = document.querySelector('main');
  useEffect(() => {
    if (!main) return;

    if (isModalOpen) {
      if (!main.contains(container)) {
        main.appendChild(container);
      }
    } else {
      if (main.contains(container)) {
        main.removeChild(container);
      }
    }

    return () => {
      if (main && main.contains(container)) {
        main.removeChild(container);
      }
    };
  }, [main, isModalOpen]);

  return container ? createPortal(children, container) : null;
}


export default function Modal({type, details, startOpen, title, modalContainer, setParentOpen, ...props} : ModalProps){
  const [shown, setShown] = useState(startOpen ?? false);
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState<ShiftExtendedProps|LeaveExtendedProps|undefined>(
    details ? ('status' in details ? details as ShiftExtendedProps : details as LeaveExtendedProps) : undefined
  );

  // 🆕 duplicate UI state
  const [dupOpen, setDupOpen] = useState(false);
  const [dupInitial, setDupInitial] = useState<any | null>(null);

  const [notifyModal, setNotifyModal] = useState(false);
  const [notifyWeb, setNotifyWeb] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [email, setEmail] = useState<{subject:string, html: string}|null>(null);
  
  useEffect(() => {
    if (notifyEmail && formValues && formValues.assignee_name && 'address' in formValues){
      const castedFormValues = formValues as ShiftExtendedProps
      setEmail(buildShiftEmail({event:"updated", userName: formValues?.assignee_name, date: formValues.date, start: formValues.start_time, end: formValues.end_time, address: castedFormValues.address, notes: castedFormValues.notes, status: statusToString(castedFormValues.status)}));
    }
  }, [notifyEmail])

  useEffect(() => {
    let tempPayRate = false;
    if (details && 'status' in details){
      const shiftProps = formValues as ShiftExtendedProps;
      if (!shiftProps.pay_rate) tempPayRate = true;
    }
    
    setFormValues(details ? ('status' in details ? ((tempPayRate&&isEditing) ? {...details, pay_rate:0 ,total_payment:0} as ShiftExtendedProps : details as ShiftExtendedProps) : details as LeaveExtendedProps) : undefined);
  }, [details]);

  const handleChange = (field: string, value: any) => {
    setFormValues((prev : any) => {
      if (value && formValues && "start_time" in formValues && (field === "start_time" || field === "end_time" || field === 'pay_rate') && !(!formValues?.start_time || !formValues?.end_time)){   
          if (formValues.start_time && formValues.end_time && 'pay_rate' in formValues){
              const currentPayRate = field === 'pay_rate' ? value : formValues.pay_rate;
              const currentStartTime = field === 'start_time' ? value : formValues.start_time;
              const currentEndTime = field === 'end_time' ? value : formValues.end_time;

              if (currentPayRate!==0) handleChange('total_payment', Math.round((currentPayRate * dayjs(currentEndTime.substring(0,5), 'HH:mm').diff(dayjs(currentStartTime.substring(0,5), "HH:mm"), 'minute')/60)*100)/100);
          }
      }

      if (value && formValues && "start_time" in formValues && (field === "start_time" || field === "end_time") && !(!formValues?.start_time || !formValues?.end_time)){
        return {
          ...prev,
          [field]: value,
          time: (field === "start_time" ? value.slice(0,5) : formValues?.start_time.slice(0,5)) + "-" + (field === "end_time"?value.slice(0,5):formValues?.end_time.slice(0,5))
        };
      }
      
      
      if (prev && ((prev.status === Status.OpenShift || prev.status === Status.Unassigned) && (field==="status" && value!==prev.status)) && formValues?.assignee_name === undefined){
        return { ...prev, [field]: value, 'assignee_name':''
        };
      }
      if ((field==="status" && (value===Status.OpenShift || value===Status.Unassigned))){
        return { ...prev, [field]: value, 'assignee_name':undefined };
      }
      return { ...prev, [field]: value };
    });
  };

  const containerRef = useRef<HTMLDivElement>(null);
  if (!props.noOverlay) useClickOutside(containerRef, ()=> props.setShown ? props.setShown(false) : setShown(false));

  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);

  if (!props.noOverlay) overlayAnimation(props.shown ? props.shown : shown, setRendered, setVisible, modalContainer, setParentOpen);

  const closeModal = () => props.setShown ? props.setShown(false) : setShown(false);

  const user = useAuth().user;
  const admin = user?.role === "admin";
  const setEditing = (edit:boolean) => { setIsEditing(admin && edit); };

  if (!admin && formValues && formValues.status === 'Open' && user){
    formValues.assignee_id = user.id.toString();
  }

  const buttons = type!==undefined ? createButtons(
    type, props.setEvents, props.event, props.displayToast, closeModal, admin, formValues, handleChange, isEditing, setEditing
  ) : null;

  useEffect(()=>{
    if (user && user?.role === 'user'){
      setFormValues((prev: any) => ({ ...prev, assignee_id: user.id }));
    }
  }, [user])

  useEffect(()=>{
      if (isEditing && formValues?.assignee_name && formValues.date){
        const date = dayjs(formValues.date);
        (async () => {
            try{
                const payRate = await fetchUsersPayRate(formValues.assignee_id, dayjs(formValues.date));
                handleChange('pay_rate', Math.round(payRate * 100) / 100);
            }
            catch (e){
                console.log(e);
                props.displayToast && props.displayToast(e+'', 'error');
                handleChange('assignee_name','');
            }
            finally{
                // add loading 
            }
        })();
    }
  }, [formValues?.assignee_name, formValues?.date, isEditing])

  const [loading, setLoading] = useState(false);

  // 🆕 open duplicate dialog with current event values
  const handleDuplicateOpen = () => {
    const ex: any = props.event?.extendedProps;
    if (!ex) return;

    setDupInitial({
      date: ex.date,                       // "YYYY-MM-DD"
      start_time: ex.start_time,           // "HH:mm"
      end_time: ex.end_time,               // "HH:mm"
      assignee_id: ex.assignee_id || "",
      assignee_name: ex.assignee_name || "",
      location_id: ex.location_id || "",
      location_name: ex.location_name || "",
      address: ex.address || "",
      notes: ex.notes || "",
      status: ex.status || "Pending",      // or force "Pending"
    });
    setDupOpen(true);
  };

  // expose a global so the toolbar icon can call it without refactor
  useEffect(() => {
    (window as any).__setLoading = (state:boolean)=>setLoading(state);

    (window as any).__openShiftDuplicate = handleDuplicateOpen;

    (window as any).__openNotifyModal = ()=>setNotifyModal(true);
    return () => { delete (window as any).__openShiftDuplicate; delete (window as any).__openNotifyModal; delete (window as any).__setLoading;};
  }, [props.event]);

  const ModalJSX = (
    <div
      className={`${props.noOverlay ? ' ' : 'fixed -translate-y-1/2 top-1/2'} md:translate-none md:relative transform rounded-lg bg-white text-left shadow-xl transition-all my-auto w-80 sm:w-full sm:max-w-lg`}
      ref={containerRef}
    >
      {loading && <div className="absolute rounded-lg top-0 left-0 w-full h-full bg-[#ffffff8d]"><Spinner custom showWater backgroundGradient/></div>}

      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 rounded-lg">
        <div className="w-full md:text-left">
          <div className="flex items-center justify-between align-middle mb-2">
            <h1 id="dialog-title" className="text-lg font-semibold text-gray-900">
              {type !== undefined ? (formValues?.type ? type?.replace("shift", formValues?.type) : type) : title??"Please set the tag 'title'"}
            </h1>

            <Icon id="x" width="1.5em" height="1.5em" className="text-black-700 hover:text-danger" onClick={closeModal} />
          </div>

          { notifyModal ? 
          <>
            <div className="flex justify-between items-center">
              <div className={`text-sm font-semibold text-gray-600 mt-1 flex items-center gap-1`}>Notify via: 
                  <Selectable className="py-1 px-4" fontSize="0.9em" onClick={{true: ()=>setNotifyWeb(true), false: ()=>setNotifyWeb(false)}} startActive={true}>Website</Selectable>
                  <Selectable className="py-1 px-4" fontSize="0.9em" onClick={{true: ()=>setNotifyEmail(true), false: ()=>setNotifyEmail(false)}}>Email</Selectable>
              </div>
            
              <div className="flex text-[color:var(--primary-color)] [&>*]:hover:text-[color:var(--hover-color)]">
                    <FaRegBell onClick={()=>setNotifyModal(false)} title={'Tap to go back'}/>
              </div>
            </div>

            {notifyWeb && 
            <div>
              <div className="flex items-center mt-2">
                <div className={`text-sm font-bold text-gray-800 flex items-center gap-1`}>
                  Website
                </div>
              </div>

              <div className="flex items-center pl-4 mt-2">
                <div className={`text-sm font-medium text-gray-600 flex items-start gap-1`}>
                  Message: 
                  <span className="font-normal">
                  {generateStaffNotificationMessage({type: shiftStatusToNotificationType(stringToStatus(formValues?.status??'')), date: dayjs().format('DD-MM-YYYY'), days_left: dayjs().diff(dayjs(formValues?.date), 'day')+1})}</span>
                </div>
              </div>
            </div>
            }

            {notifyEmail &&
              <div>
              <div className="flex items-center mt-2">
                <div className={`text-sm font-bold text-gray-800 flex items-center gap-1`}>
                  Email
                </div>
              </div>

              <div className="flex items-center pl-4 mt-2">
                <div className={`text-sm font-medium text-gray-600 flex items-start gap-1`}>
                  Subject: 
                  <span className="font-normal">
                  {email?.subject}</span>
                </div>
              </div>

              <div className="flex items-center pl-4 ">
                <div className={`text-sm font-medium text-gray-600 flex items-start gap-1`}>
                  Message: 
                </div>
              </div>

              <div className="flex items-center pl-4 mt-1">
                <div className={`text-sm font-normal text-gray-600 flex items-start gap-1`}>
                  <div dangerouslySetInnerHTML={{__html: email?.html??''}}>
                  </div>
                </div>
              </div>
            </div>
            }

            <div className="flex flex-col items-end mt-4">
              <Button fontSize="0.8em" className="px-6 py-3" disabled={!(notifyEmail||notifyWeb)} onClick={()=>{
                (async ()=>{
                  try{
                    setLoading(true);
                    const res = await notifyManually(notifyWeb, notifyEmail, formValues?.id, formValues?.assignee_id, formValues?.status as ShiftStatus, email?.subject, email?.html)
                    if (res){
                      props.displayToast && props.displayToast(formValues?.assignee_name + ' has been notified!', 'success');
                      setNotifyModal(false);
                    }
                    else{
                      props.displayToast && props.displayToast('Failed to send notification!', 'error');
                    }
                  }
                  finally{
                    setLoading(false);
                  }
                  
                })();
                
                }}>Notify</Button>
            </div>
          </> : '' }

          { !notifyModal && type && details && type !== ModalTypes.Notifications && createDetails(
            type, details, admin, props.setEvents, props.event, props.displayToast,
            closeModal, isEditing, setEditing, formValues, handleChange,
            "location_id" in details ? details as ShiftExtendedProps : undefined, setLoading
          )}

          { !notifyModal ? props.children : ""}
        </div>
      </div>

      {!notifyModal && (buttons!=null || props.customButtons) && (
        <div className="p-4 flex flex-row-reverse px-6 gap-3 rounded-lg bg-gray-50">
          {type!==undefined ? buttons : props.customButtons}
        </div>
      )}

      {/* 🆕 Duplicate Dialog */}
      {dupOpen && dupInitial && (
        <DupDialog
          open={dupOpen}
          initial={dupInitial}
          onClose={() => setDupOpen(false)}
          onCreate={async (payload) => {
            try {
              setLoading(true);
              // create via existing create endpoint
              const res = await createShift({
                id: undefined,
                assignee_id: payload.assignee_id,
                status: payload.status as any,
                date: payload.date,
                start_time: payload.start_time,
                end_time: payload.end_time,
                notes: payload.notes,
                location_id: payload.location_id,
                location_name: payload.location_name,
                address: payload.address,
                assignee_name: payload.assignee_name,
                type: "shift",
                email_reason: "duplicate"
              });

              // optimistic event for calendar
              const timeLabel = `${payload.start_time.slice(0,5)}–${payload.end_time.slice(0,5)}`;
              const newEvent: EventInput = {
                id: res?.id || `${Date.now()}`,
                start: payload.date,
                extendedProps: {
                  id: res?.id || `${Date.now()}`,
                  status: 'Unpublished',
                  original_status: payload.status,
                  type: "shift",
                  date: payload.date,
                  start_time: payload.start_time.slice(0,5),
                  end_time: payload.end_time.slice(0,5),
                  time: timeLabel,
                  location_id: payload.location_id,
                  location_name: payload.location_name,
                  address: payload.address,
                  notes: payload.notes,
                  assignee_id: payload.assignee_id,
                  assignee_name: payload.assignee_name,
                  published: payload.published,
                },
                color: getStatusColor(stringToStatus(payload.status as any)),
                title: buildShiftEventTitle(payload.status, timeLabel, payload.location_name, payload.assignee_name, 'shift'),
              };

              props.setEvents && props.setEvents(newEvent, "create");
              setDupOpen(false);
              props.displayToast && props.displayToast("Shift duplicated", "success");
            } catch (e) {
              console.error("[Duplicate] create failed", e);
              props.displayToast && props.displayToast("Failed to duplicate shift", "error");
            } finally {
              setLoading(false);
            }
          }}
        />
      )}
    </div>
  );

  if (props.noOverlay) return ModalJSX;

  return (
    <ModalPortal container={modalContainer} isModalOpen={rendered}>
      {rendered && (
        <div role="dialog" aria-modal="true" aria-labelledby="dialog-title" className={`relative z-10 h-full transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div aria-hidden="true" className={`absolute inset-0 bg-gray-200/75 backdrop-blur-sm transition-all duration-200 ${visible ? 'backdrop-opacity-100' : 'backdrop-opacity-0'}`} />
          <div className="relative z-10 w-full overflow-y-auto h-full">
            <div className="flex min-h-full justify-center p-4 text-center items-center sm:p-0">
              {type === ModalTypes.Notifications && (
                <ListView title="Notifications" containerRef={containerRef} setShown={setShown} idList={details ? details.map((d:any)=>d.id) : undefined} hasItems={props.hasItems}>
                  {createNotifications(false, details as NotificationProps[])}
                </ListView>
              )}
              {type !== ModalTypes.Notifications && ModalJSX}
            </div>
          </div>
        </div>
      )}
    </ModalPortal>
  );
}
