import ButtonDemo from "./ButtonDemo";
import IconDemo from "./IconDemo";
import InputDemo from "./InputDemo";
import FormDemo from "./FormDemo";
import ComponentDemo from "./ComponentDemo";
import Modal from "../components/Modal";
import { ModalTypes } from "../components/Modal";
import { useState } from "react";
import Button from "../components/Button";
import UnavailabilityPage from "../UnavailabilityPage";


const UnavailabilityView = () => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const hours = Array.from({ length: 10 }, (_, i) => 9 + i); // 9 AM to 6 PM

  return (
    <div className="overflow-x-auto bg-white p-4 rounded shadow">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="border px-2 py-1">Time</th>
            {days.map((day) => (
              <th key={day} className="border px-2 py-1">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hours.map((hour) => (
            <tr key={hour}>
              <td className="border px-2 py-1 text-sm font-medium">{hour}:00</td>
              {days.map((_, index) => (
                <td key={index} className="border px-2 py-4 bg-gray-100 hover:bg-gray-300 cursor-pointer text-center">
                  <span className="text-xs text-gray-600">Available</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

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
            {/* <Modal type={ModalTypes.OpenShiftDetails} details={openShiftDetails} shown={openShiftShown} setShown={setOpenShiftShown} />

            <Button onClick={()=>setUnavailDetailShown(true)}>Open Unavailability details</Button>
            <Modal type={ModalTypes.UnavailabilityDetails} details={unavailDetails} shown={unavailDetailShown} setShown={setUnavailDetailShown} />

            <Button onClick={()=>setLeaveDetailShown(true)}>Open Leave details</Button>
            <Modal type={ModalTypes.LeaveDetails} details={leaveDetails} shown={leaveDetailShown} setShown={setLeaveDetailShown} /> */}

            <UnavailabilityView/>
        </>
        
    );
}