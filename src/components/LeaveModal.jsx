import { useState } from "react";

const LeaveModal = ({ isOpen, onClose, onSubmit }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({ startDate, endDate, startTime, endTime });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
        <button onClick={onClose} className="absolute top-2 right-3 text-xl font-bold">&times;</button>
        <h2 className="text-xl font-semibold mb-4">Add Leave</h2>
        <div className="space-y-4">
          <div>
            <label className="block font-medium">Date:</label>
            <div className="flex space-x-2">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border rounded px-2 py-1 w-full" />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border rounded px-2 py-1 w-full" />
            </div>
          </div>
          <div>
            <label className="block font-medium">Time:</label>
            <div className="flex space-x-2">
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="border rounded px-2 py-1 w-full" />
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="border rounded px-2 py-1 w-full" />
            </div>
          </div>
          <button onClick={handleSubmit} className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition">
            Submit Leave
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveModal;
