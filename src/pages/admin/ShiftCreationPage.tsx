import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { PageProps } from "../../App";
import Input from "../../components/Input";
import Layout from "../../components/Layout";
import { useState } from "react";
import dayjs from "dayjs";
import { PickerValue } from "@mui/x-date-pickers/internals";
import "./ShiftCreationPage.css";
import { getLocationsStatic } from "../../classes/Location";
import Dropdown from "../../components/Dropdown";
import { getEmployeeStatic } from "../../classes/Employee";

export default function ShiftCreationPage({modalContainer}: PageProps){
    const [date, setDate] = useState<PickerValue>(null);
    const [start, setStart] = useState<PickerValue>(null);
    const [end, setEnd] = useState<PickerValue>(null);
    const [notes, setNotes] = useState<string>("");

    const setTime = () => {

    }

    const pickerSetup = { "& .MuiPickersInputBase-sectionsContainer": {
                        padding: "8px 4px" }};

    return (
    <Layout modalContainer={modalContainer}>
        <div className="relative flex-[1] h-full bg-[#f4f4f4]">
          <div className='p-6 h-full md:flex md:flex-col'>
            
            <h2 className="text-2xl mb-[30px]">Welcome, <span className="text-[color:var(--primary-color)] font-semibold">Anas</span></h2>


            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 rounded-lg w-fit">
                <div className="mt-3 w-fit sm:mt-0 sm:text-left flex flex-col gap-2">
                        <h1 id="dialog-title" className="text-3xl mb-2 font-semibold text-[color:var(--primary-color)]">Create shift</h1>

                        <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-600 mt-1 mb-1">Date:</p>
                            <DatePicker  format="DD-MM-YYYY" value={date}
                                onChange={(newValue) => setDate(newValue)} slotProps={{
                                textField: {
                                sx: pickerSetup,
                                }
                            }}/>
                        </div>

                        <div className="flex items-center gap-2">
                           <p className="text-sm font-semibold text-gray-600 mt-1 mb-1">Time:</p>
                            

                            {/* TODO: Add checking so that 'to' cant be before 'from' and vice versa */}
                            <TimePicker format="hh:mm A" value={start}
      onChange={(newValue) => setStart(newValue)}  slotProps={{
                                textField: {
                                sx: pickerSetup,
                                }
                            }} className="w-36"/>
                                <span className="text-[color:var(--primary-color)] font-bold">–</span>
                            <TimePicker format="hh:mm A" value={end}
      onChange={(newValue) => setEnd(newValue)} slotProps={{
                                textField: {
                                sx: pickerSetup,
                                }
                            }} className="w-36"/>
                        </div>    
                                
                        <div className="flex items-center gap-2 text-sm text-gray-600 w-100">
                            <div className="font-semibold">
                                Assignee:
                            </div>
                
                            <Dropdown items={getEmployeeStatic()} placeholder="Select employee"  maxVisibleItems={6}/>
                         </div>

                         <div className="flex items-center gap-2 text-sm text-gray-600 w-100">
                            <div className="font-semibold">
                                Location:
                            </div>
                
                            <Dropdown items={getLocationsStatic()} placeholder="Select location" maxVisibleItems={6}/>
                         </div>

                         <div className="flex items-center gap-2 text-sm text-gray-600 w-100">
                            <div className="font-semibold">
                                Address:
                            </div>
                
                            <Input className="p-2 font-normal"/>
                         </div>


                         <div>
                            <p className="text-sm font-semibold text-gray-600 mt-1 mb-1">Notes: </p>
                            <textarea className=" font-normal text-sm border-2 border-gray-500 bg-gray-50 rounded-md min-w-full p-2 min-h-[72px] resize-none focus:outline-0" value={notes} onChange={(e)=>setNotes(e.target.value)}placeholder="Insert notes about shift here..."></textarea>
                        </div>

                    </div>
            </div>
            </div>
        </div>
    </Layout>
    );
}