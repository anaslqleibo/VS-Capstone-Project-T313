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

export default UnavailabilityView;
