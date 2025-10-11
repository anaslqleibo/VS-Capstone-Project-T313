"use client";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { PickerValue } from "@mui/x-date-pickers/internals";
import Layout from "@/app/components/Layout";
import Dropdown, { LocationDropdownWithAddress } from "@/app/components/Dropdown";
import Button from "@/app/components/Button";
import { fetchAllEmployees, User } from "@/app/controllers/User";
import { useAuth } from "@/app/contexts/AuthContext";
import { createShift, ShiftStatus } from "@/app/controllers/Shifts";
import Checkbox from "@/app/components/Checkbox";
import Toast from "@/app/components/Toast";
import { error } from "console";
import Accordion from "@/app/components/Accordion";
import getStatusColor, { Status, stringToStatus } from "@/app/components/utils/getStatusColor";
import Icon from "@/public/icons/Icons";
import { checkAvailability } from "@/app/controllers/Leave";
import Modal from "@/app/components/Modal";
import Spinner from "@/app/components/Spinner";

export default function ShiftCreationPage() {
  const modalContainer = useRef<HTMLDivElement>(null);
  const account = useAuth().user;

  const [date, setDate] = useState<PickerValue>(dayjs());
  const [start, setStart] = useState<PickerValue>(null);
  const [end, setEnd] = useState<PickerValue>(null);
  const [notes, setNotes] = useState<string>("");

  const [employees, setEmployees] = useState<User[]>([]);
  const [assignee, setAssignee] = useState<User | null>(null);
  const [location, setLocation] = useState<{ name: string; address: string; id: number }>({
    name: "",
    address: "",
    id: -1,
  });
  const [openShift, setOpenShift] = useState<boolean>(false);

  useEffect(() => {
    async function getEmployees() {
      const employees = await fetchAllEmployees();
      setEmployees(employees);
    }
    getEmployees();
  }, []);

  // Add this function to handle location selection
  const handleLocationSelect = (selectedLocation: any) => {
    console.log("Location selected:", selectedLocation);
    setLocation({
      name: selectedLocation.name,
      address: selectedLocation.address,
      id: Number(selectedLocation.id)
    });
  };

  const handleCreateShift = async () => {
    console.log("Form data:", {
      assignee_id: assignee?.id,
      location_id: location.id,
      location_name: location.name,
      location_address: location.address,
      date: date ? dayjs(date).format("YYYY-MM-DD") : null,
      start: start ? dayjs(start).format("HH:mm:ss") : null,
      end: end ? dayjs(end).format("HH:mm:ss") : null,
    });

    

    if (
      !location.id ||
      location.id === -1 ||
      !location.name ||
      !location.address ||
      !date ||
      !start ||
      !end
    ) {
      // alert("Please fill all fields.");
      displayToast("Please fill all required fields", "error")
      return;
    }

    

    const isValidTime = dayjs(start).isValid() && dayjs(end).isValid();
    const isValidDate = dayjs(date).isValid();

    if (!isValidTime || !isValidDate) {
      // alert("Invalid date or time.");
      displayToast("Invalid date or time", "error");
      return;
    }

    if (!assignee?.id && !openShift){
      if (modalConfirmation){
        setModalConfirmation(false);
      }
      else{
        setOpenModal(true);
        return;
      }
    }

    const shift = {
      assignee_id: assignee?.id.toString() ?? '',
      status: openShift ? "Open" as ShiftStatus : (assignee?.id ? "Pending" as ShiftStatus : "Unassigned" as ShiftStatus),  
      date: dayjs(date).format("YYYY-MM-DD"),
      start_time: dayjs(start).format("HH:mm:ss"),
      end_time: dayjs(end).format("HH:mm:ss"),
      notes,
      location_id: location.id.toString(),
      location_name: location.name,
      address: location.address,
      type: "shift",
    };

    let proceed = true;
    if (status === "error"){
      displayToast("The assignee is not able to take this shift.", 'error');
      proceed = false;
    }
    else if (status === "warning"){
      const res = window.confirm("Are you sure you want to continue creating this shift despite the warnings?");
      proceed = res;
    }
    
    if (!proceed) return;
    try {
      setLoading(true);
      console.log("Sending shift data:", shift);

      await createShift(shift);
      // alert("Shift created successfully!");
      displayToast("Shift created successfully!", "success");
      // Reset form
      setAssignee(null);
      setLocation({ name: "", address: "", id: -1 });
      setDate(dayjs());
      setStart(null);
      setEnd(null);
      setNotes("");
    } catch (err) {
      console.error("Shift creation failed:", err);
      displayToast("Something went wrong. Check console for details.", "error");
    }
    finally{
      setLoading(false);
    }
  };

  const pickerSetup = {
    "& .MuiPickersInputBase-sectionsContainer": { padding: "8px 4px" },
  };

  const [openModal, setOpenModal] = useState(false);
  const [modalConfirmation, setModalConfirmation] = useState(false);
  const [showToast, setToastShown] = useState(false);
  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState<"success"|"error">("success");
  
  const displayToast = (message: string, toastType: "success"|"error") => {
      setMessage(message);
      setToastType(toastType);
      setToastShown(true);
  }

  const [unavailDetails, setUnavailDetails] = useState(null);
  const [status, setStatus] = useState<'error'|'warning'|'ok'|'default'>('default')
  const statusColors: Record<'error' | 'warning' | 'ok' | 'default', string> = {
    error: 'border-2 border-[color:var(--danger-color)] text-[color:var(--danger-color)] shadow-[0_0_4px_var(--danger-color)]',
    warning: 'border-2 border-[color:var(--warning-color)] text-[color:var(--warning-color)] shadow-[0_0_4px_var(--warning-color)]',
    ok: 'border-2 border-[color:var(--success-color)] text-[color:var(--success-color)] shadow-[0_0_4px_var(--success-color)]',
    default: ''
  };

  const borderColor = statusColors[status];
  

  useEffect(()=>{
    async function getAvailability(){
      if (assignee && date){
        const res = await checkAvailability(assignee.id, date.format("YYYY-MM-DD"), start?.format("HH:mm"), end?.format("HH:mm"));
        console.log(res);

        if (res.status && res.status === "available"){
          setUnavailDetails(null);
          setStatus('ok');
        }
        else{
          setUnavailDetails(res);
          if (res.shift || res.leave || res.unavailability){
             if ((res.shift && res.shift.status === "Pending") || (res.leave && res.leave.status === "Pending") || (res.unavailability && res.unavailability.status === "Pending")){
              setStatus('warning');
              return;
            }
            else setStatus('error');
          }
          else
            setStatus('error')
        }
      }
    }

    if (!openShift) getAvailability();
  }, [assignee, date, start, end, openShift])

  useEffect(()=>{
    if (openShift){
      setStatus("default");
      setUnavailDetails(null);
    } 
  }, [openShift])

  const [loading, setLoading] = useState(false);

  return (
    <Layout modalContainer={modalContainer}>
       {loading && <div className="absolute z-200 rounded-lg top-0 left-0 w-full h-full bg-[#ffffff8d]"> <Spinner custom showWater backgroundGradient/> </div>}

      <div className="relative flex-[1] h-full bg-[#f4f4f4]">
        <Toast message={message} type={toastType} shown={showToast} setShown={setToastShown}/>
       

        <div className="p-6 h-full md:flex md:flex-col">
          {/* <h2 className="text-2xl mb-[30px]">
            Welcome,{" "}
            <span className="text-[color:var(--primary-color)] font-semibold">
              {account?.first_name + " " + account?.last_name}
            </span>
          </h2> */}

          <div className="flex flex-col justify-between md:flex-row gap-4 h-full">
            <div className={`bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 rounded-lg md:w-fit md:flex-1/2 ${borderColor} overflow-y-auto h-full`}>
              <div className="mt-3 sm:mt-0 sm:text-left flex flex-col gap-2">
              <h1 className="text-3xl mb-2 font-semibold text-[color:var(--primary-color)]">Create shift</h1>

              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-600 mt-1 mb-1">Date:</p>
                <DatePicker
                  format="DD-MM-YYYY"
                  value={date}
                  onChange={(newValue) => setDate(newValue)}
                  slotProps={{ textField: { sx: pickerSetup } }}
                />
              </div>

              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-600 mt-1 mb-1">Time:</p>
                <TimePicker
                  format="hh:mm A"
                  value={start}
                  onChange={(newValue) =>{setStart(newValue)}}
                  slotProps={{ textField: { sx: pickerSetup } }}
                  className="w-36"
                />
                <span className="text-[color:var(--primary-color)] font-bold">–</span>
                <TimePicker
                  format="hh:mm A"
                  value={end}
                  onChange={(newValue) => {setEnd(newValue)}}
                  slotProps={{ textField: { sx: pickerSetup } }}
                  className="w-36"
                />
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 w-full">
                <div className="font-semibold">Assignee:</div>
                <Dropdown
                  items={employees.map(employee => `${employee.first_name} ${employee.last_name}`)}
                  placeholder="Select employee"
                  maxVisibleItems={6}
                  className="text-black border-gray-400"
                  onChange={(value) => {
                    const selectedEmployee = employees.find(emp => 
                      `${emp.first_name} ${emp.last_name}` === value
                    );
                    console.log("Selected employee object:", selectedEmployee);
                    setAssignee(selectedEmployee || null);
                  }}
                  disabled={openShift}
                />
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 w-full">
                <div className="font-semibold text-gray-600">
                  <div>Location:</div>
                  <br />
                  <div>Address:</div>
                </div>
                <LocationDropdownWithAddress
                  onSelect={handleLocationSelect} // Add this prop
                  setUpdatedDetail={(field, value) => {
                    console.log(`Setting location ${field} to:`, value);
                    setLocation((prev) => ({
                      ...prev,
                      [field]: field === "location_id" ? Number(value) : value,
                    }));
                  }}
                />
              </div>

              <div className="flex items-start gap-2 text-sm text-gray-600 w-full">
                <div className="font-semibold">Settings:</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <Checkbox label="Mark as open" checked={openShift} onChange={(e)=>setOpenShift(e)} className="text-xs md:text-sm"/>
                </div>
                
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600 mt-1 mb-1">Notes:</p>
                <textarea
                  className="font-normal text-sm text-black border-2 border-gray-500 bg-gray-50 rounded-md min-w-full p-2 min-h-[72px] resize-none focus:outline-0"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Insert notes about shift here..."
                />
              </div>

              <div className="flex flex-col items-end sticky bottom-0 right-0">
                <Button className="w-fit px-8 py-4 shadow-lg" onClick={handleCreateShift}>
                  Create
                </Button>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 md:flex-1/2">

            {
              status!=="default" && assignee && 
              <div className={`border-2 border-b-2 ${borderColor} font-semibold px-4 py-2 rounded-md flex items-center justify-between`}>
                { !unavailDetails && assignee?.last_name + " is available at the selected date and time"}
                { unavailDetails && (unavailDetails as any).shift && assignee?.last_name + " has an active shift at the selected date and time"}
                { unavailDetails && (unavailDetails as any).leave && assignee?.last_name + " is on leave at the selected date and time"}
                { unavailDetails && (unavailDetails as any).unavailability && assignee?.last_name + " is unavailable at the selected date and time"}

                <Icon id={(status==="error" || status==="warning") ? "warning" : "checkmark"} width="1.2em" height="1.2em" className='transition-transform'/>
              </div>
            }
            
          
            {
              unavailDetails && Object.entries(unavailDetails).map(([type, details]) => (
                <Accordion key={type} text={assignee?.last_name + "'s " + type + " details"} startOpen={true} componentClassName="border-2 border-b-2">
                  <div className='flex flex-col gap-2 justify-start'>

                    { Object.entries(details as Record<string, unknown>).map(([field, value]) => (
                      <div key={field} className='flex items-start gap-2'>
                        <span className="font-semibold">{(field.slice(0,1).toUpperCase() + field.slice(1)).replaceAll('_',' ')}:</span>
                        <span className={`${field === "status" ? "font-semibold" : ""}`}  style={field === "status" ? { color: getStatusColor(stringToStatus(value as string)) } : {}}>{value as string}</span>
                      </div>
                    ))
                    }
                  </div>
                </Accordion>
              ))
            }
            
            
          </div>
          

          </div>
          
        </div>
      </div>
         { modalContainer.current &&       
              <Modal details={{}} shown={openModal} setShown={setOpenModal} modalContainer={modalContainer.current} setParentOpen={setOpenModal} displayToast={displayToast} title="Create unassigned shift confirmation">
                <div className='mt-4'>You are about to create an unassigned shift. To assign an employee, click 'Cancel' and choose one from the dropdown. Do you want to proceed?</div>
                 <div className='flex items-center justify-end gap-4 -mb-4 mt-6'> 
                  <Button type="outline" fontSize="0.8em"  className="py-3 px-5" onClick={()=>setOpenModal(false)}>Cancel</Button>
                  <Button type="cta" htmlType='submit' fontSize="0.8em" className="py-3 px-5" onClick={()=>{setModalConfirmation(true); handleCreateShift(); setOpenModal(false)}}>Continue</Button>
                  
                </div>
              </Modal>
            }

      
    </Layout>
  );
}