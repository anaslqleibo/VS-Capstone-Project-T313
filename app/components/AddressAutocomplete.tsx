import { useEffect, useState } from "react";
import { searchAddress } from "@/app/lib/nominatim";
import { useClickOutside } from "./utils/useClickOutside";

export default function AddressAutocomplete() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.trim().length >= 3) {
        const data = await searchAddress(query);
        setSuggestions(data);
      } else {
        setSuggestions([]);
      }
    }, 500);
     return () => clearTimeout(timeoutId);
  }, [query]);

  function handleSelect(suggestion: any) {
    setQuery(suggestion.display_name);
    setSuggestions([]);
    console.log("Selected address:", suggestion);
  }

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        value={query}
        onChange={(e)=>setQuery(e.target.value)}
        placeholder="Enter an address"
        className="border p-2 w-full rounded"
      />
      {suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 bg-white border rounded mt-1 max-h-60 overflow-y-auto shadow-lg z-50">
          {suggestions.map((s) => (
            <li
              key={s.place_id}
              onClick={() => handleSelect(s)}
              className="p-2 hover:bg-gray-200 cursor-pointer"
            >
              {s.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
