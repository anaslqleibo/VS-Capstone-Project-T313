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


            

<button data-modal-target="default-modal" data-modal-toggle="default-modal" className="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button">
  Toggle modal
</button>

<div id="default-modal" tabIndex={-1} aria-hidden="true" className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
    <div className="relative p-4 w-full max-w-2xl max-h-full">
      
        <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
            
            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Terms of Service
                </h3>
                <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="default-modal">
                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                    </svg>
                    <span className="sr-only">Close modal</span>
                </button>
            </div>
       
            <div className="p-4 md:p-5 space-y-4">
                <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                    With less than a month to go before the European Union enacts new consumer privacy laws for its citizens, companies around the world are updating their terms of service agreements to comply.
                </p>
                <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                    The European Union’s General Data Protection Regulation (G.D.P.R.) goes into effect on May 25 and is meant to ensure a common set of data rights in the European Union. It requires organizations to notify users as soon as possible of high-risk data breaches that could personally affect them.
                </p>
            </div>
      
            <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                <button data-modal-hide="default-modal" type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">I accept</button>
                <button data-modal-hide="default-modal" type="button" className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Decline</button>
            </div>
        </div>
    </div>
</div>

        </>
        
    );
}