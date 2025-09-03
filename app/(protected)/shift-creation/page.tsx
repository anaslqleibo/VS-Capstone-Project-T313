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
      !assignee?.id ||
      !location.id ||
      location.id === -1 ||
      !location.name ||
      !location.address ||
      !date ||
      !start ||
      !end
    ) {
      alert("Please fill all fields.");
      console.log("Assignee ID:", assignee?.id);
      console.log("Location ID:", location.id);
      console.log("Location Name:", location.name);
      console.log("Location Address:", location.address);
      console.log("Date:", date ? dayjs(date).format("YYYY-MM-DD") : "null");
      console.log("Start Time:", start ? dayjs(start).format("HH:mm:ss") : "null");
      console.log("End Time:", end ? dayjs(end).format("HH:mm:ss") : "null");
      return;
    }

    const isValidTime = dayjs(start).isValid() && dayjs(end).isValid();
    const isValidDate = dayjs(date).isValid();

    if (!isValidTime || !isValidDate) {
      alert("Invalid date or time.");
      return;
    }

    const shift = {
      assignee_id: assignee.id,
      status: "Pending" as ShiftStatus,
      date: dayjs(date).format("YYYY-MM-DD"),
      start_time: dayjs(start).format("HH:mm:ss"),
      end_time: dayjs(end).format("HH:mm:ss"),
      notes,
      location: location.name,
      address: location.address,
    };

    console.log("Sending shift data:", shift);

    try {
      await createShift(shift);
      alert("Shift created successfully!");
      // Reset form
      setAssignee(null);
      setLocation({ name: "", address: "", id: -1 });
      setDate(dayjs());
      setStart(null);
      setEnd(null);
      setNotes("");
    } catch (err) {
      console.error("Shift creation failed:", err);
      alert("Something went wrong. Check console for details.");
    }
  };

  const pickerSetup = {
    "& .MuiPickersInputBase-sectionsContainer": { padding: "8px 4px" },
  };

  return (
    <Layout modalContainer={modalContainer}>
      <div className="relative flex-[1] h-full bg-[#f4f4f4]">
        <div className="p-6 h-full md:flex md:flex-col">
          <h2 className="text-2xl mb-[30px]">
            Welcome,{" "}
            <span className="text-[color:var(--primary-color)] font-semibold">
              {account?.first_name + " " + account?.last_name}
            </span>
          </h2>

          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 rounded-lg md:w-fit">
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
                  onChange={(newValue) => setStart(newValue)}
                  slotProps={{ textField: { sx: pickerSetup } }}
                  className="w-36"
                />
                <span className="text-[color:var(--primary-color)] font-bold">–</span>
                <TimePicker
                  format="hh:mm A"
                  value={end}
                  onChange={(newValue) => setEnd(newValue)}
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
                  setUpdatedLocation={(field, value) => {
                    console.log(`Setting location ${field} to:`, value);
                    setLocation((prev) => ({
                      ...prev,
                      [field]: field === "location_id" ? Number(value) : value,
                    }));
                  }}
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600 mt-1 mb-1">Notes:</p>
                <textarea
                  className="font-normal text-sm border-2 border-gray-500 bg-gray-50 rounded-md min-w-full p-2 min-h-[72px] resize-none focus:outline-0"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Insert notes about shift here..."
                />
              </div>

              <div className="flex flex-col items-end">
                <Button className="w-1/2" onClick={handleCreateShift}>
                  Create
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}