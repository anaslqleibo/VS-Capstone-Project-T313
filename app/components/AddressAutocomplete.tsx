import { useEffect, useRef, useState } from "react";
import { searchAddress } from "@/app/lib/nominatim";
import { useClickOutside } from "./utils/useClickOutside";

/**
 * An input field for street address, equipped with autosuggestion
 * @returns Input field with suggestions on addresses
 */
export default function AddressAutocomplete({value, onChange}:{value?:string, onChange?:(e:any)=>void}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const inputField = useRef(null);

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

  function handleSelect(suggestion: any, onChange?:(e:any)=>void) {
    setQuery(suggestion.display_name);
    onChange&&onChange(suggestion.display_name);
    setSuggestions([]);
  }

  useClickOutside(inputField, ()=>setSuggestions([]));
  return (
    <div className="relative w-full max-w-md" ref={inputField}>
      <input
        type="text"
        value={query===""?(value ?? ''):query}
        onChange={(e)=>{setQuery(e.target.value); if(onChange) onChange(e.target.value);}}
        placeholder="Enter an address..."
        className="border-[1.5px] p-2 w-full rounded-md !outline-none border-[color:var(--dark-grey)] hover:border-[color:var(--hover-color)] focus:border-[color:var(--primary-color)]"
      />
      {suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 bg-white border rounded mt-1 max-h-60 overflow-y-auto shadow-lg z-50">
          {suggestions.map((s) => (
            <li
              key={s.place_id}
              onClick={() => handleSelect(s, onChange)}
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
